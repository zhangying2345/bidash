/**
 * LogAggregator is the logers' aggregator
 */

import { Loger } from './loger';
import { Aggregator } from '../common';

import { LogLevel, LogType, LogOption } from './log-entity';

import * as Uuid from 'uuid';

export class LogAggregator implements Loger, Aggregator {
  constructor() {
    this._id = Uuid.v4();
  }

  //#region Implements Loger APIs
  debug(formatOrMessage: string, ...args: Array<string | number>) {
    this.logers.forEach((loger) => loger.debug(formatOrMessage, ...args));
  }

  info(formatOrMessage: string, ...args: Array<string | number>) {
    this.logers.forEach((loger) => loger.info(formatOrMessage, ...args));
  }

  warn(formatOrMessage: string, ...args: Array<string | number>) {
    this.logers.forEach((loger) => loger.warn(formatOrMessage, ...args));
  }

  error(formatOrMessage: string, ...args: Array<string | number>) {
    this.logers.forEach((loger) => loger.error(formatOrMessage, ...args));
  }

  fatal(formatOrMessage: string, ...args: Array<string | number>) {
    this.logers.forEach((loger) => loger.fatal(formatOrMessage, ...args));
  }

  log(formatOrMessage: string, type: LogType = LogType.All, level: LogLevel = LogLevel.Warn, ...args: Array<string | number>) {
    this.logers.forEach((loger) => loger.log(formatOrMessage, type, level, ...args));
  }

  clear() {
    this.logers.forEach((loger) => loger.clear());
  }

  initialize() {
  }

  get message() {
    return this._logers[0] && this._logers[0].message;
  }
  //#endregion

  //#region Aggregator APIs
  register(loger: Loger): void {
    if (!this.contains(loger)) {
      this._logers.push(loger);
    }
  }

  unregister(loger: Loger): void {
    if (this.contains(loger)) {
      const index = this.getLogerIndex(loger);
      this._logers.splice(index, 1);
    }
  }

  unregisterAll() {
    this._logers = [];
  }

  get registered(): Loger[] {
    return this._logers;
  }
  //#endregion

  // UniqueObject APIs
  get uuid() { return this._id; }

  // Own APIs
  get logers() { return this._logers; }

  //#region protected members
  protected contains(loger: Loger): boolean {
    const target = this.logers.find((element) => {
      return element.uuid === loger.uuid;
    });

    return (target !== undefined);
  }

  protected getLogerIndex(loger: Loger): number {
    const targetIdx = this.logers.findIndex((element) => {
      return element.uuid === loger.uuid;
    });

    return targetIdx;
  }

  protected _logers: Loger[] = [];
  //#endregion

  //#region private members
  private _id: string;
  //#endregion
}
