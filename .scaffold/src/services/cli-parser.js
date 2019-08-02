/**
 * CLI parser service
 */
'use strict';

const Fs = require('fs');
const Path = require('path');
const YargsParser = require('yargs-parser');
const Moment = require('moment');

const BaseService = require('./base-service');

class CliParser extends BaseService {
  constructor(injector) {
    super(injector);

    // ref: https://www.npmjs.com/package/yargs-parser
    const yargsParserOption = {
      configuration: {
        // true in default, treat '-abc' as -a, -b, -c; change to false, treat as 'abc'
        'short-option-groups': false
      }
    };
    this._cliArgs = YargsParser(process.argv.slice(2), yargsParserOption);

    // console.log('CliParser Cnt.');
  }

  // only get other service, dont call any method from them
  resolveDependencies() {
    super.resolveDependencies();
  }

  // do initial tasks
  initialize() {
    super.initialize();

    if (!this.loger) { return; }

    this.loger.log(`CLI Arguments: ${JSON.stringify(this.cliArgs, null, 2)}`);

    // parse arguments to option object
    let option = {};
    // build tag timesteamp, like '20170720T133045'
    const currentDateTime = Moment().format('YYYYMMDDTHHmmss');
    const tagArgValue = this.hasStringArg('tag');
    const buildTag = tagArgValue ? tagArgValue : currentDateTime;

    option = {...option, ...{
      buildTag: buildTag
    }};

    // package type
    const validTypes = ['local', 'proto', 'test', 'prod'];
    const defaultTypeValue = validTypes[0]; // get the first element's type

    // --type <local|proto|test|prod>
    const typeArgValue = this.hasStringArg('type');
    let typeValue = typeArgValue ? typeArgValue : defaultTypeValue;

    // check validation
    typeValue = (validTypes.indexOf(typeValue) !== -1) ? typeValue : defaultTypeValue;
    option = {...option, ...{
      packageType: typeValue,
      production: (typeValue === 'prod')
    }};

    // check aot
    option = {...option, ...{
      aot: this.hasBoolArg('aot')
    }};

    // bundle option
    // add package type prefix
    let tagBundleDistDir = option.packageType;

    // add the build tag postfix
    let tag = option.buildTag;
    // add the aot postfix in build tag for angular AOT compling
    tag =  option.aot ? `${tag}-aot` : tag;
    tagBundleDistDir = `${tagBundleDistDir}-${tag}`;

    // some like: 'bundle/[local|proto|test|prod]-20170824T101314[-aot]'
    tagBundleDistDir = Path.join(this.projectConfig.bundleDistDir, tagBundleDistDir);
    // some like: 'bundle/[local|proto|test|prod]-20170824T101314[-aot].log'
    const bundleLogFile = `${tagBundleDistDir}.log`;

    option = {...option, ...{
      bundleLogFile: bundleLogFile,
      tagBundleDistDir: tagBundleDistDir
    }};

    // verbose
    const setVerbose = this.hasBoolArg('verbose') || this.hasBoolArg('V') || this.hasBoolArg('VV') || this.hasBoolArg('VVV');
    option = {...option, ...{
      verbose:setVerbose
    }};

    this._option = option;
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
  get option() { return this._option; }
}

module.exports = CliParser;
