/**
 * The Definition of Log Levels for the log client
 */
export enum LogLevel {
  // Dump All Levels' messages. Designates local development situation.
  Debug = 0,
  // Designates local development situation.
  Info = 1,
  // Default value. Designates potentially harmful situations which not affect app running.
  Warn = 2,
  // Designates harmful situations which affect app running.
  Error = 3,
  // Designates critical situations which affect app running.
  Fatal = 4,
}

/**
 * The Definition of Log Types for the dump tunnel from log client to log server
 */
export enum LogType {
  All = 0,    // Dump to both
  Local = 1,  // Dump to Local Log Server
  Remote = 2, // Default value. Dump to Remote Log Server
}

/**
 * The Definition of Log Option when create a logger object
 */
export class LogOption {
  constructor() {
    this.logLevel = LogLevel.Warn;
  }

  // public members
  logLevel;
}
