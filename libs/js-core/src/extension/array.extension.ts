/**
 * The extended method for Native Type Array
 *
 * [More descriptions for this component in multiple line]
 *
 * @flow
 */
export class ArrayEx {

  /**
   * Sample:
   * const arr = ['hello', 'world'];
   * const hasHello = ArrayEx.contains(arr, 'hello'); // true
   */
  static contains<T>(origin: T[], element: T): boolean {
    if (!origin || (origin.length < 1)) { return false; }

    const has = (origin.indexOf(element) !== -1);

    return has;
  }

  /**
   * Sample:
   * const arr = ['hello', 'world'];
   * const status = ArrayEx.delete(arr, 'hello'); // true
   */
  static delete<T>(origin: T[], element: T): boolean {
    if (!origin || (origin.length < 1)) { return false; }

    //Todo: for Object, it need check equal, for string, number, boolean, enum, use '==='
    const targetIdx = origin.findIndex((item) => Object.is(item, element));
    if (targetIdx === -1) { return false; }

    origin.splice(targetIdx, 1);
    return true;
  }
}
