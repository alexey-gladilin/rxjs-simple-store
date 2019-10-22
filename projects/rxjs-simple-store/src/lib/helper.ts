import { Observable } from 'rxjs';

/**
 * Rule signature
 * @param context The context within which the rule is executed
 * @param state Current state of the data
 * @param nextState New data state
 * @param args Parameters of the method to which the rule is applied
 */
type RulePayload<T> = (context: any, state: T, nextState: T, ...args) => Observable<void>;

/**
 * The level of implementation of rules
 */
export enum RuleLevel {
  /**
   * The method level
   * When the rule is executed before the main method code
   * to which it is applied
   */
  Method = 'METHOD',

  /**
   * The level of state
   * When the rule is executed after the main code is executed
   * the method to which it is applied and before the state change
   */
  State = 'STATE'
}

/**
 * Metadata describing the rules
 */
class RuleMetadata<T> {

  constructor(
    /** Rule */
    public rule: RulePayload<T>,

    /** The level of implementation of rules */
    public level = RuleLevel.State
  ) { }
}

/**
 * Metadata describing the rule group
 */
class RuleGroupMetadata<T> {
  constructor(
    /** Rule group */
    public ruleGroup: object,
    /** Filter */
    public filter?: {
      /** List of rules to enable */
      excludes?: RuleMetadata<T>[],

      /** List of rules to be excluded */
      includes?: RuleMetadata<T>[]
    }
  ) { }

  /**
   * Function to get a list of rules to execute
   */
  getExecuteRules(): { ruleLevel: RuleLevel, fn: RulePayload<T> }[] {

    if (this.filter) {
      if (this.filter.includes && this.filter.includes.length > 0) {
        return Object.keys(this.ruleGroup)
          .filter(key => this.filter.includes
            .some(inRule => inRule.rule === this.ruleGroup[key]
            )
          )
          .sort((a, b) => {
            const aIndex = this.filter.includes.findIndex(item => item.rule === this.ruleGroup[a]);
            const bIndex = this.filter.includes.findIndex(item => item.rule === this.ruleGroup[b]);

            return aIndex < bIndex ? -1 : aIndex > bIndex ? 1 : 0;
          })
          .map(r => {
            return {
              ruleLevel: this.filter.includes.find(item => item.rule === this.ruleGroup[r]).level,
              fn: this.ruleGroup[r] as RulePayload<T>
            };
          });
      } else if (this.filter.excludes && this.filter.excludes.length > 0) {
        return Object.keys(this.ruleGroup)
          .filter(key => !this.filter.excludes
            .some(inRule => inRule.rule === this.ruleGroup[key]
            )
          )
          .map(r => {
            return {
              ruleLevel: RuleLevel.State,
              fn: this.ruleGroup[r] as RulePayload<T>
            };
          });
      }
    }

    return Object.keys(this.ruleGroup)
      .map(r => {
        return {
          ruleLevel: RuleLevel.State,
          fn: this.ruleGroup[r] as RulePayload<T>
        };
      });
  }
}

export {
  RuleMetadata,
  RuleGroupMetadata,
  RulePayload
};

