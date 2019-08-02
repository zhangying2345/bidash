/**
 * Define the tslint lint service
 */
'use strict';

const Fs = require('fs');
const Path = require('path');

const Gulp = require('gulp');

const FancyLog = require('fancy-log');
const CrossSpawn = require('cross-spawn');

const BaseLint = require('./base');

class EsLint extends BaseLint {
  constructor(injector) {
    super(injector);
  }

  // only get other service, dont call any method from them
  resolveDependencies() {
    super.resolveDependencies();
  }

  // do initial tasks
  initialize() {
    super.initialize();
  }

  clean(doneFn) {
    doneFn && doneFn();
  }

  before(doneFn) {
    doneFn && doneFn();
  }

  start(doneFn) {
    const eslint = require('gulp-eslint');

    const defaultConfig = require(`${this.lintConfigDir}/eslint.config.js`);
    // merge project config
    const config = Object.assign({}, defaultConfig, this.projectConfig.config.linters.eslint.option);
    // log('eslint config: ' + JSON.stringify(config));

    const defaultFiles = [
      `${this.projectConfig.srcDir}/**/*.js`
    ];
    // merge project config
    const files = defaultFiles.concat(this.projectConfig.config.linters.eslint.files);
    // log('eslint files: ' + JSON.stringify(files));

    return Gulp.src(files)
      .pipe(eslint(config))
      // eslint.format() outputs lint results
      // Alternatively use eslint.formatEach() (see Docs).
      .pipe(eslint.format())
      // To have the process exit with an error code (1) on
      // lint error, return stream and pipe to failAfterError last.
      .pipe(eslint.failAfterError());
  }

  after(doneFn) {
    doneFn && doneFn();
  }

}

module.exports = EsLint;
