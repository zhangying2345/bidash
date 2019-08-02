/**
 * ConsoleLoger use the window.console API to dump logs into browser's console window
 */
import { LogLevel, LogType, LogOption } from './log-entity';
import { LogerBase } from './loger-base';

export class ConsoleLoger extends LogerBase {
  constructor(option: LogOption) {
    super(option);
  }

  log(formatOrMessage: string, type: LogType = LogType.Local, level: LogLevel = LogLevel.Warn, ...args: any[]) {
    // if current level < setting level, ignore
    if (level < this.option.logLevel) { return; }

    // if current type isn't Local or All, ignore
    if ((type !== LogType.Local) && (type !== LogType.All)) { return; }

    // Call the parent's method to genereate message
    super.log(formatOrMessage, type, level, ...args);

    const message = this.message;

    switch (level) {
      default:
      case LogLevel.Debug:
        console.debug(message);

        break;
      case LogLevel.Info:
        console.info(message);

        break;
      case LogLevel.Warn:
        console.warn(message);

        break;
      case LogLevel.Error:
      case LogLevel.Fatal:
        console.error(message);

        break;
    }
  }
}
