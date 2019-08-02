/**
 * The Interface Definition of a loger
 */
import { UniqueObject } from '../common';

import { LogLevel, LogType } from './log-entity';

export interface Loger extends UniqueObject {
  /**
   * A convenient api to call log() in level = LogLevel.Debug
   *
   * @param string} formatOrMessage The message string Or in the format of string substitutions like 'str {0} {1} {2'
   * @param (...Array<string | number>) args  (Optional) The Variable Parameters (Number Or String) for the formatOrMessage
   * @memberof Loger
   */
  debug(formatOrMessage: string, ...args: Array<string | number>): void;

  /**
   * A convenient api to call log() in level = LogLevel.Info
   *
   * @param string} formatOrMessage The message string Or in the format of string substitutions like 'str {0} {1} {2'
   * @param (...Array<string | number>) args  (Optional) The Variable Parameters (Number Or String) for the formatOrMessage
   * @memberof Loger
   */
  info(formatOrMessage: string, ...args: Array<string | number>): void;

  /**
   * A convenient api to call log() in level = LogLevel.Warn
   *
   * @param string} formatOrMessage The message string Or in the format of string substitutions like 'str {0} {1} {2'
   * @param (...Array<string | number>) args  (Optional) The Variable Parameters (Number Or String) for the formatOrMessage
   * @memberof Loger
   */
  warn(formatOrMessage: string, ...args: Array<string | number>): void;

  /**
   * A convenient api to call log() in level = LogLevel.Error
   *
   * @param string} formatOrMessage The message string Or in the format of string substitutions like 'str {0} {1} {2'
   * @param (...Array<string | number>) args  (Optional) The Variable Parameters (Number Or String) for the formatOrMessage
   * @memberof Loger
   */
  error(formatOrMessage: string, ...args: Array<string | number>): void;

  /**
   * A convenient api to call log() in level = LogLevel.Fatal
   *
   * @param string} formatOrMessage The message string Or in the format of string substitutions like 'str {0} {1} {2'
   * @param (...Array<string | number>) args  (Optional) The Variable Parameters (Number Or String) for the formatOrMessage
   * @memberof Loger
   */
  fatal(formatOrMessage: string, ...args: Array<string | number>): void;

  /**
   * Full feature log api
   *
   * @param string} formatOrMessage The message string Or in the format of string substitutions like 'str {0} {1} {2'
   * @param LogType [type]         (Optional) The Log Type, default value is LogType.All
   * @param LogLevel [level]       (Optional) The Log Level, default value is LogLevel.Warn
   * @param (...Array<string | number>) args  (Optional) The Variable Parameters (Number Or String) for the formatOrMessage
   * @memberof Loger
   */
  log(formatOrMessage: string, type?: LogType, level?: LogLevel, ...args: Array<string | number>): void;

  /**
   * Trigger clear
   *
   * @memberof Loger
   */
  clear(): void;

  /**
   * Get current log message
   *
   * @memberof Loger
   */
  message: string;
}
