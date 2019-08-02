export class SequentialNaming {

  /**
 * Gets sequence array
 * @param {object[]|string[]} array
 * @param {string} baseString
 * @returns  {number[]}
 * @memberof SequentialNaming
 */
static getSequenceArray(array, baseString, property = 'name') {
    const sequenceArray = [];
    array.forEach((item) => {
      if (typeof (item) !== 'string' && typeof (item) !== 'object') { return; }
      const index = typeof (item) === 'string' ? item.indexOf(baseString) : item[property].indexOf(baseString);
      if (index === 0) {
        const suffix = item[property].substring(baseString.length);
        if (parseInt(suffix) !== NaN || suffix.length === 0) {
          sequenceArray.push(suffix);
        }
      }
    })
    return sequenceArray;
  }

  /**
  * Sets sequence
  * @param {number[]} sequenceArray
  * @returns  {number}
  * @memberof SequentialNaming
  */
 static setSequence(sequenceArray) {
    const sequence = sequenceArray.length === 0 ? 0 : Math.max(...sequenceArray) + 1;
    return sequence;
  }

  /**
   * Gets current name
   * @param {any[]} array
   * @param {string} baseString
   * @param {string} [property]
   * @returns  {string}
   * @memberof SequentialNaming
   */
  static getCurrentName(array, baseString, property = 'name') {
    const sequenceArray = this.getSequenceArray(array, baseString, property);
    const sequence = this.setSequence(sequenceArray);
    return `${baseString}${sequence}`;
  }
}
