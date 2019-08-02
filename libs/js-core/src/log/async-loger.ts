/**
 * AsyncLoger allow set a callback function to handle log message, used to implement such as remote loger
 */

import { LogLevel, LogType, LogOption } from './log-entity';
import { LogerBase } from './loger-base';

export class AsyncLoger extends LogerBase {
  constructor(option: LogOption, handler?:(message) => void) {
    super(option);

    this.handler = handler;
  }

  initialize() {
    super.initialize();
  }

  log(formatOrMessage: string, type: LogType = LogType.Remote, level: LogLevel= LogLevel.Warn, ...args: any[]) {
    // if current level < setting level, ignore
    if (level < this.option.logLevel) { return; }

    // if current type isn't Remote or All, ignore
    if ((type !== LogType.Remote) && (type !== LogType.All)) { return; }

    // Call the parent's method to genereate message
    super.log(formatOrMessage, type, level, ...args);

    // call callback
    this.handler && this.handler(this.message);
  }

  // private members
  private handler;
}
