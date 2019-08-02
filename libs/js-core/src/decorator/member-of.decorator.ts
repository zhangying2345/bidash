/**
 * This file define a decorator to used for class, abstract class member
 *
 * Sample:
 *
 * abstract class ClassName {
 *   @memberOf(ClassName, 'dataKey')
 *   id: string;
 *
 *   @memberOf(ClassName, 'bindingKey')
 *   name: string;
 * }
 *
 * // get member names only related to decorator named key
 * const bindingKeys = Reflect.getOwnMetadata('bindingKey', ClassName);
 */
import * as Reflect from 'core-js/es7/reflect';

export function memberOf(classTarget: any, metadataKey: string) {
  return function (propertyTarget: any, propertyKey: string) {
    const classPrototype = classTarget.prototype;
    const parentPrototype = Object.getPrototypeOf(classPrototype);
    const parentTarget = parentPrototype.constructor;

    const parentIsObject = (parentPrototype === Object.prototype);

    if (!Reflect.getOwnMetadata(metadataKey, classTarget)) {
      // call this to malloc memory, it is only need to call once for each [metadataKey, classTarget]
      Reflect.defineMetadata(metadataKey, [], classTarget);
    }

    // get reference, handler them directly to add/remove metadata
    const ownProperties = Reflect.getOwnMetadata(metadataKey, classTarget);
    const properties = Reflect.getMetadata(metadataKey, classTarget);
    const parentOwnProperties = Reflect.getOwnMetadata(metadataKey, parentTarget);

    const isOwnExisted = (ownProperties.indexOf(propertyKey) !== -1);

    // add to own metadata
    if (!isOwnExisted) {
      ownProperties.push(propertyKey);
    }

    // if classTarget has parent with same metadataKey, add them too
    if (!parentIsObject) {
      const tempOwnProperties = parentOwnProperties ? parentOwnProperties : [];
      // remove duplicated propertyKeys
      const uniqueProperties = tempOwnProperties.concat(properties).reduce((result, curr) => {
        return (result.indexOf(curr) !== -1) ? result : result.concat(curr);
      }, []);
      // update properties
      properties.splice(0, properties.length);
      properties.push(...uniqueProperties);
    }
  };
}
