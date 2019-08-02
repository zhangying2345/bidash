/**
 * The extended method for Native Type Object
 *
 * [More descriptions for this component in multiple line]
 *
 * @flow
 */

/**
 * Object Extension
 *
 * Note: we cann't use Object.prototype to add additional methods,
 * core.js will throw exception in Angular
 *
 * @export
 */
export class ObjectEx {
  /**
   * Check equality between two JSON object
   *
   * Sample:
   * const obj = '{name: "hi"}';
   * const obj1 = '{name: "hi"}';
   * const isEqual = ObjectEx.equals(obj, obj1); // true
   *
   * @param Object xObj
   * @param Object yObj
   * @returns True in equal, False in not equal
   * @memberof ObjectEx
   */
  static equals(xObj: object, yObj: object) {
    if (!xObj || !yObj) {
      return false;
    }

    const srcStr = JSON.stringify(xObj);
    const targetSrc = JSON.stringify(yObj);
    const equal = (srcStr === targetSrc);

    return equal;
  }

  /**
   * Merge two JSON objects, the second argument will be added into first argument and
   * update new value in same key in same level.
   * The keys in first argument will be front of keys in second argument in same level
   *
   * Sample:
   * const obj = { name: 'test1', address: { details: 'xxx'} };
   * const obj2 = {name: 'test', age: 10, address: { street: 'xxx'}, event: func};
   * const result = ObjectEx.merge(obj, obj2);
   * result: {name: 'test', age: 10, address: { details: 'xxx', street: 'xxx'}, event: func};
   *
   * const arr = [1, 2, 3, obj];
   * const arr2 = [4, 5, 6, obj2];
   * const result = ObjectEx.merge(arr, arr2);
   * result: [4, 5, 6, new-obj2]; result[3] !== obj2, but (result[3]).name = obj2.name, it means copy value, not reference
   *
   * @param origin any object
   * @param patch any object, if it is not object type, return null
   * @returns Merged new Object, the type is same as patch
   * @memberof ObjectEx
   */
  static merge(origin, patch) {
    function getObjectChildKeys(obj) {
      return Object.keys(obj).filter((key) => {
        const value = obj[key];
        // Note: typeof (array) === 'object'; typeof (null) === 'object'
        return value && (typeof (value) === 'object') && (value !== null);
      });
    }

    // check arguments, set to object in default
    origin = origin ? origin : {};
    patch = patch ? patch : {};

    // check type, must after above statements
    const patchIsArray = Array.isArray(patch);
    const originIsArray = Array.isArray(origin);

    // if patch is array, then set origin to array, must after above statements
    origin = patchIsArray ? (originIsArray ? origin : []) : origin;

    // console.log(`typeof(origin): ${typeof(origin)}; typeof(patch): ${typeof(patch)}`);
    if ((typeof(patch) !== 'object')) { return null; }

    // do simple merge for first level children, if there are deep level object children,
    // original value will be replaced
    // Note:
    //   for array, don't use [...arr1, ...arr2], because it equals arr1.concat(arr2), use object spread
    //   also support function type
    //   if orign, patch are array, each key in the result is the index number
    let result = { ...origin, ...patch };
    if (patchIsArray) {
      result = Object.keys(result).map((index) => result[index]);
      // use the same length of patch, cut off the rest part from origin
      result = result.slice(0, patch.length);
    }

    // start to handle deep level object children
    const objChildKeys = getObjectChildKeys(patch);
    // go deep in new object recursively, until a node without object child
    objChildKeys.forEach((key) => {
      const originValue = origin[key];
      const patchValue = patch[key];
      result[key] = this.merge(originValue, patchValue);
    });

    return result;
  }
}
