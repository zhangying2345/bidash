/**
 * Define the consts used in gulpfile.js
 */
'use strict';

const Fs = require('fs');
const Path = require('path');

const Gulp = require('gulp');
const FancyLog = require('fancy-log');
const AnsiColors = require('ansi-colors');

const Yaml = require('js-yaml');

const {
  log,
  logV,
  isDefaultArg,
  hasArg
} = require('../helper');

class Linter {
  constructor(projectConfig, args, consts) {
    this.projectConfig = projectConfig;
    this.args = args;
    this.consts = consts;
  }

  get LintConfigDir() { return `${this.consts.scaffoldDir}/lint`; }

  checkTs() {
    const gulpTslint = require('gulp-tslint');
    const tslint = require('tslint');

    const fileContent = Fs.readFileSync(`${this.LintConfigDir}/tslint.config.dev.yml`, 'utf8');
    const defaultConfig = Yaml.safeLoad(fileContent);
    // merge project config
    const config = Object.assign({}, defaultConfig, this.projectConfig.linters.tslint.option);
    logV('tslint config: ' + JSON.stringify(config));

    // config need be converted, ref: https://github.com/palantir/tslint/issues/2457#issuecomment-332822605
    const convertedConfig = tslint.Configuration.parseConfigFile(config);
    const options = {
      configuration: convertedConfig,
      formatter: 'verbose'
    };

    const defaultFiles = [
      `${this.consts.srcDir}/**/*.ts`,
      `${this.consts.libDir}/**/*.ts`,
      `${this.consts.mockDir}/**/*.ts`,
      // set exclude pattern in below
      '!**/node_modules/**/*',
      '!**/*.d.ts',
    ];
    // merge project config
    const files = defaultFiles.concat(this.projectConfig.linters.tslint.files);
    // log('tslint files: ' + JSON.stringify(files));
    return Gulp.src(files)
      .pipe(gulpTslint(options))
      .pipe(gulpTslint.report({
        emitError: false,
        allowWarnings: true,
        summarizeFailureOutput: true
      }));
  }

  checkEs() {
    const eslint = require('gulp-eslint');

    const defaultConfig = require(`${this.LintConfigDir}/eslint.config.js`);
    // merge project config
    const config = Object.assign({}, defaultConfig, this.projectConfig.linters.eslint.option);
    // log('eslint config: ' + JSON.stringify(config));

    const defaultFiles = [
      '**/*.js',
      // set exclude pattern in below
      '!**/node_modules/**/*',
      `!**/${this.consts.libDir}/**/*.js`,
      `!**/${this.consts.deployDistDir}/**/*.js`,
      // `!${this.consts.srcDir}/**/*.spec.js`,
      // `!{this.consts.libDir}/**/*.spec.js`,
      // `!${this.consts.mockDir}/**/*.spec.js`,
    ];
    // merge project config
    const files = defaultFiles.concat(this.projectConfig.linters.eslint.files);
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

  checkCss() {
    const stylelint = require('gulp-stylelint');

    const defaultConfig = require(`${this.LintConfigDir}/stylelint.config.js`);
    // merge project config
    const config = Object.assign({}, defaultConfig, this.projectConfig.linters.stylelint.option);
    // log('stylelint config: ' + JSON.stringify(config));

    const defaultFiles = [
      `${this.consts.srcDir}/**/*.*css`,
      `${this.consts.styleDir}/**/*.*css`,
    ];
    // merge project config
    const files = defaultFiles.concat(this.projectConfig.linters.stylelint.files);
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

  checkHtml() {
    const htmllint = require('gulp-htmllint');

    const defaultConfig = require(`${this.LintConfigDir}/htmllint.config.json`);
    // merge project config
    const config = Object.assign({}, defaultConfig, this.projectConfig.linters.htmllint.option);
    // log('htmllint config: ' + JSON.stringify(config));

    const defaultFiles = [
      `${this.consts.srcDir}/**/*.html`
    ];
    // merge project config
    const files = defaultFiles.concat(this.projectConfig.linters.htmllint.files);
    // log('htmllint files: ' + JSON.stringify(files));

    return Gulp.src(files)
      .pipe(htmllint({
        rules: config,
      }, this.htmllintReporter));
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

module.exports = Linter;
