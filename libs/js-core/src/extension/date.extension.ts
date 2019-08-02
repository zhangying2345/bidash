/**
 * The extended method for Native Type Object
 *
 * [More descriptions for this component in multiple line]
 *
 * @flow
 */

/**
 * ref:
 *   https://github.com/jvandemo/generator-angular2-library/issues/221
 *   https://github.com/rollup/rollup/issues/670
 *
 * Solutions:
 * A. import Moment from 'moment; and "allowSyntheticDefaultImports": true in tsconfig.json
 * B. const Moment = require('moment);
 * C. import * as moment from 'moment'; const Moment = moment;
 */

const Moment = require('moment');

/**
 * Date Extension
 *
 * @export
 */
export class DateEx {
  // Convert to UTC string
  // ref:
  //   http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15
  //   https://tools.ietf.org/html/rfc3339#section-5.6
  //   https://tools.ietf.org/html/rfc2822#page-14
  //
  // The format is as follows: YYYY-MM-DDTHH:mm:ss.sssZ, Z is the time zone offset specified as âZâ (for UTC)
  static getUtcTimestamp(value?: number, format?: string): string {
    const timeInMs = value ? value : Date.now();
    const formatStr = format ? format : 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

    const formated = Moment(timeInMs).utc().format(formatStr);

    return formated;
  }

  /**
   * Gets timestamp
   * @param [value]
   * @param [format]
   * @param [utc] if get utc time
   * @returns timestamp
   */
  static getTimestamp(value?: number, format?: string, utc?: boolean): string {
    const timeInMs = value ? value : Date.now();
    const formatStr = format ? format : 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

    const formated = (utc || utc === undefined) ? Moment(timeInMs).utc().format(formatStr) : Moment(timeInMs).format(formatStr);

    return formated;
  }
}
