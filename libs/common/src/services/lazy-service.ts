/**
 * It defines the services which need to do some initialization after constructor
 */

export interface LazyService {
  /**
   * Triger to do some initialization jobs after constructor
   *
   * @memberof LazyService
   */
  initialize(): void;
}
