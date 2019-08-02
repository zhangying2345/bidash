/**
 * It defines some util for Json handling
 */

// import * as CircularJSON from 'circular-json';

export class JsonEx {
  /**
   * format json in safe, if it has circular reference
   */
  static format(jsonObj, space: number = null) {
    const cache = [];
    const converted = JSON.stringify(jsonObj, function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    }, space);
    return converted;

    // const formatted = CircularJSON.stringify(jsonObj, null, space);
    // return formatted;
  }
}
