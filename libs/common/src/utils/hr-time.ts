/**
 * Rretty high resolution time
 */

import * as PrettyTime from 'pretty-time';

export class HrTimer {
  /**
   * return formated elapsed time string
   * @param diff The result of process.hrtime(start)
   * @param minUnit, string, optional values: 'w', 'd', 'h', 'm', 's', 'ms', 'μs', 'ns', as PrettyTime needs
   * @param digits, number, set the result digits, in 0 ~ 20 usually
   * @note if use PrettyTime for http response X-Response-Time, it can not use 'μs', or it throw invalid character issue
   */
  static pretty(diff: [number, number], minUnit = 'ms', digits = 6) {
    // get milliseconds with 6 digits
    const prettyTime = PrettyTime(diff, minUnit, digits);
    return prettyTime;
  }

  //#region private members
  //#endregion
}
