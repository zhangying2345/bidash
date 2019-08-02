/**
 * CLI parser
 */

import { injectable } from 'inversify';

import * as YargsParser from 'yargs-parser';

@injectable()
export class CliParser {
  constructor() {
    // ref: https://www.npmjs.com/package/yargs-parser
    const yargsParserOption = {
      configuration: {
        // true in default, treat '-abc' as -a, -b, -c; change to false, treat as 'abc'
        'short-option-groups': false
      }
    };
    this._cliArgs = YargsParser(process.argv.slice(2), yargsParserOption);
    // console.log(JSON.stringify(this.argv));

    console.log('CliParser Cnt.');
  }

  // return value by argument name
  get(name) {
    // undefined or real value
    const value = this._cliArgs[name];
    return value;
  }

  set(name, value) {
    this._cliArgs[name] = value;
  }

  // if the value is not string, return false, otherwise, return the string value
  hasStringArg(arg) {
    const value = this.hasArg(arg);
    const isString = (typeof(value) === 'string');
    const result = isString ? value : false;
    return result;
  }

  // if the value is not boolean, return false, otherwise, return the boolean value(true or false)
  hasBoolArg(arg) {
    const value = this.hasArg(arg);
    const isBool = (typeof(value) === 'boolean');
    const result = isBool ? value : false;
    return result;
  }

  // if the arg dosn't exist, return false, otherwise, return the value
  hasArg(arg) {
    const value = this.get(arg);
    const result = !value ? false : value;
    return result;
  }

  get cliArgs() { return this._cliArgs; }

  //#region private members
  private _cliArgs;
  //#endregion
}
