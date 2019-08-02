/**
 * The Interface Definition of an aggregator
 */

import { UniqueObject } from './unique-object';

export interface Aggregator {
  /**
   * register an object with unique ID
   *
   * @param UniqueObject object  An object with Unique Id
   * @memberof Aggregator
   */
  register(object: UniqueObject): void;

  /**
   * unregister an object with unique ID
   *
   * @param UniqueObject object  The object with Unique Id registered
   * @memberof Aggregator
   */
  unregister(object: UniqueObject): void;

  /**
   * remove all registered objects
   *
   * @memberof Aggregator
   */
  unregisterAll(): void;

  /**
   * get registered objects
   *
   * @memberof Aggregator
   */
  registered: UniqueObject[];
}

