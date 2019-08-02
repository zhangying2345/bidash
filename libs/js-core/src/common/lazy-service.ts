/**
 * It defines the services which need to do some initialization after constructor
 */

import { UniqueObject } from './unique-object';

export interface LazyService extends UniqueObject {
  /**
   * Triger to do some initialization jobs after constructor
   *
   * @memberof LazyService
   */
  initialize(): void;
}
