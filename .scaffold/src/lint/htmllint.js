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

class HtmlLint extends BaseLint {
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
    const htmllint = require('gulp-htmllint');

    const defaultConfig = require(`${this.lintConfigDir}/htmllint.config.json`);
    // merge project config
    const config = Object.assign({}, defaultConfig, this.projectConfig.config.linters.htmllint.option);
    // log('htmllint config: ' + JSON.stringify(config));

    const defaultFiles = [
      `${this.projectConfig.srcDir}/**/*.html`
    ];
    // merge project config
    const files = defaultFiles.concat(this.projectConfig.config.linters.htmllint.files);
    // log('htmllint files: ' + JSON.stringify(files));

    return Gulp.src(files)
      .pipe(htmllint({
        rules: config,
      }, this.htmllintReporter));
  }

  after(doneFn) {
    doneFn && doneFn();
  }

  htmllintReporter(filepath, issues) {
    if (issues.length > 0) {
      issues.forEach(function (issue) {
        // FancyLog(JSON.stringify(issue));
        FancyLog(
          AnsiColors.white(`${filepath} [${issue.line},${issue.column}]: `) +
          AnsiColors.red(`(${issue.rule})${issue.msg}`)
        );
      });

      process.exitCode = 1;
    }
  }
}

module.exports = HtmlLint;
