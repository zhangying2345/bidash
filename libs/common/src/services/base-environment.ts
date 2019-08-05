/**
 * Configuration Service
 *
 * Loading external config file, and supply interface to access config properties
 */
import * as Path from 'path';
import * as Fs from 'fs';
import * as Yaml from 'js-yaml';
import * as Ajv from 'ajv';

import { CliParser } from './cli-parser.service';

import { ObjectEx } from '@sip/js-core';

export class BaseEnvironmentService {
  constructor(
    protected cliParser: CliParser
    ) {
    this.initialize();

    console.log('BaseEnvironmentService Cnt.');
  }

  //#region public methods & properties
  get config() { return this._config; }
  //#endregion

  //#region private memebers
  protected _config;

  private initialize() {
    this.loadConfig();
  }

  private loadConfig() {
    const schemaFile = '../schema/environment.schema.yml';
    const schemaFilePath = Path.join(this.cwd, schemaFile);
    const schemaText = Fs.readFileSync(schemaFilePath, 'utf8');
    const schemaJson = Yaml.safeLoad(schemaText, {filename: schemaFile});

    const baseConfigFile = '../config/environment.yml';
    const baseConfigFilePath = Path.join(this.cwd, baseConfigFile);
    const baseConfigText = Fs.readFileSync(baseConfigFilePath, 'utf8');
    const baseConfig = Yaml.safeLoad(baseConfigText, {filename: baseConfigFile});

    let config = {
      case: baseConfig.case,
      type: baseConfig.type,
      cwd: this.cwd
    };
    // merge from cli arguments
    // --case
    const cliCaseValue = this.cliParser.hasStringArg('case');
    if (cliCaseValue) {
      config = ObjectEx.merge(config, {
        case: cliCaseValue
      });
    }
    // --type
    const cliTypeValue = this.cliParser.hasStringArg('type');
    if (cliTypeValue) {
      config = ObjectEx.merge(config, {
        type: cliTypeValue
      });
    }
    // --port
    const cliPortValue = this.cliParser.hasStringArg('port');
    if (cliPortValue) {
      config = ObjectEx.merge(config, {
        express: {
          port: cliPortValue
        }
      });
    }

    let detailConfig = {};
    const isLocal = (config.type === 'local');
    console.log('zhangyingislocal', isLocal);
    const postfix = isLocal ? config.type : `${config.case}.${config.type}`;
    const detailConfigFile = `../config/environment.${postfix}.yml`;
    console.log('zhangyingislocal', detailConfigFile);
    const detailConfigFilePath = Path.join(this.cwd, detailConfigFile);
    if (Fs.existsSync(detailConfigFilePath)) {
      console.log('Find case environment.yml');
      const patchConfig = Fs.readFileSync(detailConfigFilePath, 'utf8');
      detailConfig = Yaml.safeLoad(patchConfig, {filename: detailConfigFile});
    }

    // deep merge
    config = ObjectEx.merge(config, detailConfig);

    // check validation
    const isValid = this.ajv.validate(schemaJson, config);
    if (!isValid) {
      console.error('Ajv: ' + JSON.stringify(this.ajv.errors, null, 2));
    }
    this._config = config;
  }

  private ajv = new Ajv();
  private cwd = Path.dirname(process.argv[1]);
  //#endregion
}
