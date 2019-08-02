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

class StyleLint extends BaseLint {
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
    const stylelint = require('gulp-stylelint');

    const defaultConfig = require(`${this.lintConfigDir}/stylelint.config.js`);
    // merge project config
    const config = Object.assign({}, defaultConfig, this.projectConfig.config.linters.stylelint.option);
    // log('stylelint config: ' + JSON.stringify(config));

    const defaultFiles = [
      `${this.projectConfig.srcDir}/**/*.*css`,
    ];
    // merge project config
    const files = defaultFiles.concat(this.projectConfig.config.linters.stylelint.files);
    // log('stylelint files: ' + JSON.stringify(files));

    return Gulp.src(files)
      .pipe(stylelint({
        config: config,
        reporters: [
          {
            formatter: 'verbose',
            console: true
          },
          {
            formatter: 'string',
            save: `${this.consts.reportDistDir}/lint/css-reports.txt`,
            console: false
          }
        ]
      }));
  }

  after(doneFn) {
    doneFn && doneFn();
  }
}

module.exports = StyleLint;
