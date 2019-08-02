/**
 * FixedQueue implements a fixed length queue in FIFO way.
 *
 * [More descriptions for this component in multiple line]
 *
 * @flow
 */
export class FixedQueue {
  constructor(/* integer > 0 */length) {
    if (length < 1) { throw new Error('The passed in argument length should > 0.'); }
    this.maxLength = length;

    this.queue = [];
  }

  /**
   * Add item according to the setting in option argument.
   *
   * It will keep the fixed max length automatically.
   *
   * option:
   * {
   *   'sort': sort-function
   * }
   */
  push(/* any */object, /* json */option?) {
    const currentLength = this.queue.length;

    if (currentLength >= this.maxLength) {
      this.queue.pop(); // remove the oldest object in the end.
    }

    // insert the new object in the head
    this.queue.unshift(object);

    if (option !== undefined) {
      option.sort && this.queue.sort(option.sort);
    }
  }

  /**
   * object: value type Or object type
   */
  contains(/* any */object) {
    if (this.queue.length < 1) { return false; }

    const type = typeof (object);

    if (type !== 'object') {
      return (this.queue.indexOf(object) !== -1);
    } else {
      // get all properties for an object type
      const properties = Object.getOwnPropertyNames(object);

      const target = this.queue.find((element, index, array) => {
        let isEqual = true;
        if (properties.length === 0) {
          if (Object.getOwnPropertyNames(element).length !== 0) { isEqual = false; }
        }
        properties.forEach(function (property) {
          const hasproperty = object.hasOwnProperty(property);

          // the equal for object is very strict, every property must be equal
          // use JSON.stringify to support nested objects
          isEqual = isEqual && hasproperty && (JSON.stringify(element[property]) === JSON.stringify(object[property]));
        }, this);

        return isEqual;
      });

      return (target !== undefined);
    }
  }

  get data() {
    return this.queue;
  }

  get length() {
    return this.queue.length;
  }

  get fixedLength() {
    return this.maxLength;
  }

  private maxLength: number;
  private queue: any[];
}
