import {
  Observable,
  BehaviorSubject
} from 'rxjs';

/**
 * Базовый класс хранилища данных
 */
export class Store<T> {

  /** Наблюдаемое состояние */
  readonly state$: Observable<T>;

  /** Состояние */
  private innerState$: BehaviorSubject<T>;

  /** Объект состояния */
  get state(): T {
    return this.innerState$.getValue();
  }

  /** Делегат метода который будет вызван перед установкой нового состояния */
  beforeSetStateFn: (state: T, nextState: T) => void;

  /**
   * Конструктор
   * @param stateInit Данные для инициализации состояния
   */
  constructor(stateInit: T) {
    this.innerState$ = new BehaviorSubject(stateInit);
    this.state$ = this.innerState$.asObservable();
  }

  /**
   * Обновляет состояние
   * @param nextState Состояние которое необходимо установить
   */
  protected setState(nextState: T): void {
    if (this.beforeSetStateFn) {
      this.beforeSetStateFn(this.state, nextState);
    } else {
      this.innerState$.next(nextState);
    }
  }
}
