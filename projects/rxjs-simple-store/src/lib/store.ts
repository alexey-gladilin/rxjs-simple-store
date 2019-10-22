import {
  Observable,
  BehaviorSubject
} from 'rxjs';

/**
 * Storage base class
 */
export class Store<T> {

  /** Observed state */
  readonly state$: Observable<T>;

  /** State */
  private innerState$: BehaviorSubject<T>;

  /** The state object */
  get state(): T {
    return this.innerState$.getValue();
  }

  /** Method delegate to be called before setting the new state */
  beforeSetStateFn: (state: T, nextState: T) => void;

  /**
   * constructor
   * @param stateInit Data to initialize the state
   */
  constructor(stateInit: T) {
    this.innerState$ = new BehaviorSubject(stateInit);
    this.state$ = this.innerState$.asObservable();
  }

  /**
   * Updates the status
   * @param nextState State to be set
   */
  protected setState(nextState: T): void {
    if (this.beforeSetStateFn) {
      this.beforeSetStateFn(this.state, nextState);
    } else {
      this.innerState$.next(nextState);
    }
  }
}
