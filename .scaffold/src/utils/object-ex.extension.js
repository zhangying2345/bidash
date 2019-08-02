/**
 * Object extensions
 *
 */
'use strict';

const ObjectEx = {
  orderEquals: function(originJsonObj, comparedJsonObj) {
    if (!originJsonObj || !comparedJsonObj) { return false; }

    const originStr = JSON.stringify(originJsonObj);
    const comparedStr = JSON.stringify(comparedJsonObj);
    const equal = (originStr === comparedStr);

    return equal;
  },

  equals: function(originJsonObj, comparedJsonObj) {
    if (!originJsonObj || !comparedJsonObj) { return false; }

    const originChildKeys = Object.keys(originJsonObj);
    const comparedChildKeys = Object.keys(comparedJsonObj);

    if (originChildKeys.length !== comparedChildKeys.length) { return false; }

    let equal = true;
    for (let key of originChildKeys) {
      if (!comparedChildKeys.includes(key)) { return false; }

      if (typeof(originJsonObj[key]) === 'object') {
        equal = (originJsonObj[key]).equals(comparedJsonObj[key]);
      } else {
        equal = (originJsonObj[key] === comparedJsonObj[key]);
      }
      // meet any false, return false
      if (!equal) { break; }
    }

    return equal;
  },

  shallowClone: function(originJsonObj) {
    if (!originJsonObj) { return undefined; }

    const newObj = this.shallowMerge(originJsonObj, {});
    return newObj;
  },

  clone: function(originJsonObj) {
    if (!originJsonObj) { return undefined; }

    const newObj = this.merge(originJsonObj, {});
    return newObj;
  },

  shallowMerge: function(originJsonObj, newJsonObj) {
    let merged;
    // Object Spread Syntax can copy value and function, but can not support getter, setter, and deep level object

    // not like Object.assign, spread syntax always return a new object
    // obj = {name: 'leo'};
    // obj2 = {...obj, ...{age: 20}}
    // obj === obj2 // or Object.is(obj, obj2), false

    // BTW, according to MDN, spread syntax won't call the setter than Object.assign

    merged = {...originJsonObj, ...newJsonObj};

    return merged;
  },

  merge: function(originJsonObj, newJsonObj) {
    function getObjectChildKeys(jsonObj) {
      const keys = Object.keys(jsonObj).filter((key) => {
        const value = jsonObj[key];
        return value && (typeof(jsonObj[key]) === 'object') && !Array.isArray(value);
      });
      return keys;
    }

    // do simple shallowMerge for first level children, if there are deep level object children, original value will be replaced
    let merged = this.shallowMerge(originJsonObj, newJsonObj);

    // start to handle deep level object children
    const objChildKeys = getObjectChildKeys(newJsonObj);
    // go deep in new object recursively, until a node without object child
    objChildKeys.forEach((key) => {
      const objValue = originJsonObj[key];
      const originObj = (objValue ? objValue : {}); // objValue may be undefined
      merged[key] = this.merge(originObj, newJsonObj[key]);
    });

    return merged;
  },
};

// exports
module.exports = {
  ObjectEx
};
