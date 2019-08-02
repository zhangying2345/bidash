/**
 * LogerBase is the parent class for specifical loger, such as ConsoleLoger, RemoteLoger
 */
import { Loger } from './loger';
import { LogLevel, LogType, LogOption } from './log-entity';
import { StringEx } from '../extension';

import * as Uuid from 'uuid';

export class LogerBase implements Loger {
  constructor(option: LogOption) {
    this.option = option;

    this._id = Uuid.v4();
  }

  //#region Loger APIs
  debug(formatOrMessage: string, ...args: Array<string | number>) {
    this.log(formatOrMessage, LogType.All, LogLevel.Debug, ...args);
  }

  info(formatOrMessage: string, ...args: Array<string | number>) {
    this.log(formatOrMessage, LogType.All, LogLevel.Info, ...args);
  }

  warn(formatOrMessage: string, ...args: Array<string | number>) {
    this.log(formatOrMessage, LogType.All, LogLevel.Warn, ...args);
  }

  error(formatOrMessage: string, ...args: Array<string | number>) {
    this.log(formatOrMessage, LogType.All, LogLevel.Error, ...args);
  }

  fatal(formatOrMessage: string, ...args: Array<string | number>) {
    this.log(formatOrMessage, LogType.All, LogLevel.Fatal, ...args);
  }

  clear() {
  }

  initialize() {
  }

  log(formatOrMessage: string, type: LogType = LogType.All, level: LogLevel = LogLevel.Warn, ...args: Array<string | number>) {
    this._message = StringEx.format(formatOrMessage.toString(), ...args);
  }

  get message() { return this._message; }
  //#endregion

  // UniqueObject APIs
  get uuid() { return this._id; }

  // protected members
  protected option: LogOption;
  protected _message: string;

  // private members
  private _id: string;
}
