/**
 * Define the consts used in gulpfile.js
 */
'use strict';

const Gulp = require('gulp');

const {
  log,
  isDefaultArg,
  hasArg
} = require('../helper');

const Utils = require('./utils');

class ApiDocMaker {
  constructor(projectConfig, args, consts) {
    this.projectConfig = projectConfig;
    this.args = args;
    this.consts = consts;
  }

  get ApiDocsConfigDir() { return `${this.consts.scaffoldDir}/api-docs`; }

  buildEsdoc(doneFn) {
    const esdoc = require('gulp-esdoc');

    const defaultConfig = require(`${this.ApiDocsConfigDir}/esdoc.json`);
    // merge project config
    const config = Object.assign({}, defaultConfig, this.projectConfig.apiDocs.esdoc.option);
    // log('esdoc config: ' + JSON.stringify(config));

    const defaultFiles = [`${this.consts.srcDir}`];
    // merge project config
    const files = defaultFiles.concat(this.projectConfig.apiDocs.esdoc.files);
    // log('esdoc files: ' + JSON.stringify(files));
    return Gulp.src(files)
      .pipe(esdoc(config));
  }

  buildJsdoc(doneFn) {
    const jsdoc = require('gulp-jsdoc3');

    const defaultConfig = require(`${this.ApiDocsConfigDir}/jsdoc.json`);
    // merge project config
    const config = Object.assign({}, defaultConfig, this.projectConfig.apiDocs.jsdoc.option);
    // log('jsdoc config: ' + JSON.stringify(config));

    const defaultFiles = [
      'README.md',
      'docs/**/*.md',
      `${this.consts.srcDir}/**/*.js`,
      `!${this.consts.srcDir}/**/*.spec.js`
    ];
    // merge project config
    const files = defaultFiles.concat(this.projectConfig.apiDocs.jsdoc.files);
    // log('jsdoc files: ' + JSON.stringify(files));

    return Gulp.src(files)
      .pipe(jsdoc(config));
  }

  cleanTypedoc() {
    return Utils.cleanDir('.dist/api-docs/typedoc');
  }

  buildTypedoc(doneFn) {
    const typedoc = require('gulp-typedoc');

    const defaultConfig = require(`${this.ApiDocsConfigDir}/typedoc.json`);
    // merge project config
    const config = Object.assign({}, defaultConfig, this.projectConfig.apiDocs.typedoc.option);
    // log('typedoc config: ' + JSON.stringify(config));

    const defaultFiles = [
      `${this.consts.srcDir}/**/*.ts`,
      `!${this.consts.srcDir}/**/*.spec.ts`,
      `${this.consts.srcDir}/**/*.js`,
      `!${this.consts.srcDir}/**/*.spec.js`,
      '!./node_modules/**/*'
    ];
    // merge project config
    const files = defaultFiles.concat(this.projectConfig.apiDocs.typedoc.files);
    // log('typedoc files: ' + JSON.stringify(files));

    return Gulp.src(files)
      .pipe(typedoc(config));
  }
}

module.exports = ApiDocMaker;
