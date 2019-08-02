/**
 * It is project configurations management.
 * Project configuration is defined in JSON file, and they are variable for different project.
 *
 * It will merge all JSON files defined in ./config/project-configs/ folder, and supply API to get merged JSON object.
 */
'use strict';

const Fs = require('fs');
const Path = require('path');
const Globby = require('globby');
const FancyLog = require('fancy-log');

const JSON5 = require('json5');
const Yaml = require('js-yaml');

const AjvClass = require('ajv');
const Ajv = new AjvClass();

const {
  log,
  logV,
  logVV
} = require('../helper');

class ProjectConfig {
  constructor() {
    // log('ProjectConfig Cnt.');
    const projectConfigDir = Path.join(process.cwd(), './config');
    const projectConfigFilesDir = Path.join(projectConfigDir, 'project-configs');

    this.scaffoldDir = Path.join(process.cwd(), './.scaffold');

    // project config files, accept json, json5 or yaml
    const configFiles = Globby.sync([
      `${projectConfigFilesDir}/**/*.json?(5)`,
      `${projectConfigFilesDir}/**/*.y?(a)ml`
    ]);
    logV(configFiles);

    let merged = {};
    try {
      for (const file of configFiles) {
        // log(file);
        // support .json or .yml format
        const isJson = file.endsWith('.json5') || file.endsWith('.json');
        const isYaml = file.endsWith('.yml') || file.endsWith('.yaml');

        const fileContent = Fs.readFileSync(file, 'utf8');

        if (isJson) {
          const config = JSON5.parse(fileContent);
          merged = Object.assign({}, merged, config);
        }

        if (isYaml) {
          const config = Yaml.safeLoad(fileContent);
          merged = Object.assign({}, merged, config);
        }
      }
    } catch (err) {
      throw err;
    }

    const headerJson = {
      $schema: '../.scaffold/config/project-config.schema.json',
      description: 'This file is generated by tool. Do not modify it by manual. Change files under ./project-configs folder'
    };
    const mergedWithHeader = Object.assign({}, headerJson, merged);
    logVV(JSON.stringify(mergedWithHeader, null, 2));

    // load schema in yaml and save to json file
    const schemaFile = Fs.readFileSync(`${this.scaffoldDir}/config/project-config.schema.yml`, 'utf8');
    const schema = Yaml.safeLoad(schemaFile);
    // save as json file
    Fs.writeFileSync(`${this.scaffoldDir}/config/project-config.schema.json`, JSON.stringify(schema, null, 2));

    // validate
    const isValid = Ajv.validate(schema, merged);
    logV('Is project-config.json valid? ' + isValid);
    if (!isValid) {
      FancyLog.error(Ajv.errors);
      throw Error('Invalid project-config.json, please check config/project-configs/*.');
    }

    // write merged content into a json file, used by project
    if (!Fs.existsSync(projectConfigDir)) {
      Fs.mkdirSync(projectConfigDir);
    }
    Fs.writeFileSync(`${projectConfigDir}/project-config.json`, JSON.stringify(mergedWithHeader, null, 2));

    this._config = merged;
  }

  get config() {
    return this._config;
  }
}

// To keep common use in client-side and server-side, use RequireJS style to export module.
module.exports = ProjectConfig;
