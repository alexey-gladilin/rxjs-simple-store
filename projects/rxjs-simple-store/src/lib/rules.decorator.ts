import {
  RuleGroupMetadata,
  RulePayload,
  RuleLevel
} from './helper';
import {
  concat,
  throwError
} from 'rxjs';

/**
 * Applies a set of rules
 * @param ruleGroups List of rules
 */
// tslint:disable-next-line: only-arrow-functions
export const Rules = function <T> (...ruleGroups: RuleGroupMetadata<T>[]) {
  // tslint:disable-next-line: only-arrow-functions
  return function(target, key, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {

      this.beforeSetStateFn = null;

      let rulesMethodLevel: RulePayload<T>[] = [];
      let rulesStateLevel: RulePayload<T>[] = [];

      ruleGroups.forEach(g => {
        const rules = g.getExecuteRules();

        rulesMethodLevel = [
          ...rulesMethodLevel,
          ...rules.filter(item => item.ruleLevel === RuleLevel.Method)
            .map(item => item.fn)
        ];

        rulesStateLevel = [
          ...rulesStateLevel,
          ...rules.filter(item => item.ruleLevel === RuleLevel.State)
            .map(item => item.fn)
        ];
      });

      const beforeSetStateFn = (state, nextState) => {
        this.beforeSetStateFn = null;

        concat(...rulesStateLevel.map(r => r(this, state, nextState, args)))
          .subscribe({
            error: () => {
              this.setState(state);
              // TODO: throwing errors out
            },
            complete: () => this.setState(nextState)
          });

        let error;
        if (rulesMethodLevel.length > 0) {
          concat(...rulesMethodLevel.map(r => r(this, this.state, this.nextState, args)))
            .subscribe({
              error: err => {
                error = err;
                // TODO: throwing errors out
              }
            });
        }

        if (!error) {
          if (rulesStateLevel.length > 0) {
            this.beforeSetStateFn = beforeSetStateFn;
          }
          return originalMethod.apply(this, args);
        }
        return throwError(error);
      };
    };
    return descriptor;
  };
};
