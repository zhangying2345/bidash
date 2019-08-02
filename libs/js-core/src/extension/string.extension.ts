/**
 * The extended method for Native Type String
 *
 * [More descriptions for this component in multiple line]
 *
 * @flow
 */

export class StringEx {

  /**
   * Sample:
   * const str = 'hello, world';
   * const hasHello = StringEx.contains(str, 'hello'); // true
   */
  static contains(origin: string, subString: string) {
    if (!origin) { return false; }

    const has = (origin.indexOf(subString) !== -1);

    return has;
  }

  /**
   * Sample:
   * const str = 'Hello {0}, I am {1}';
   * const formated = StringEx.format(str, 'A', 'B'); // 'Hello A, I am B'
   */
  static format(format: string, ...args: any[]) {
    args.forEach((arg, index, array) => {
      const re = new RegExp('\\{' + index + '\\}', 'gm');
      format = format.replace(re, arg + ''); // arg + '' will convert number to string
    });
    return format;
  }
}
