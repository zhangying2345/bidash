/**
 * Define the tslint lint service
 */
'use strict';

const Fs = require('fs');
const Path = require('path');

const Gulp = require('gulp');

const FancyLog = require('fancy-log');
const CrossSpawn = require('cross-spawn');
const Yaml = require('js-yaml');

const Tslint = require('gulp-tslint');

const BaseLint = require('./base');

class TsLint extends BaseLint {
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
    const defaultFiles = [
      `${this.projectConfig.srcDir}/**/*.ts`,
    ];
    // merge project config
    const files = defaultFiles.concat(this.projectConfig.config.linters.tslint.files);
    // log('tslint files: ' + JSON.stringify(files));
    const option = {
      configuration: `${this.lintConfigDir}/tslint.config.yml`,
      formatter: 'prose'
    };
    return Gulp.src(files)
      .pipe(Tslint(option))
      .pipe(Tslint.report({
        emitError: false,
        allowWarnings: true
      }));
  }

  after(doneFn) {
    doneFn && doneFn();
  }
}

module.exports = TsLint;
