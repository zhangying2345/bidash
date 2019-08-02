/**
 * Define the consts used in gulpfile.js
 */
'use strict';

const Gulp = require('gulp');

// const CrossSpawn = require('cross-spawn');
// const KarmaServer = require('karma').Server;
const Mocha = require('gulp-mocha');
const Istanbul = require('gulp-istanbul');
const CrossSpawn = require('cross-spawn');

const {
  log,
  isDefaultArg,
  hasArg
} = require('../helper');

const Utils = require('./utils');

class Tester {
  constructor(args) {
    this.args = args;
  }

  cleanTestReports() {
    return Utils.cleanDir('./dist/reports');
  }

  doTest(doneFn) {
    const option = {
      require: [
        'ts-node/register',
        'source-map-support/register'
      ], // must
      reporter: 'list',
      grep: 'Test contains', // single test, todo: passed in cli argument
      exit: true
    };
    log(`mocha option: ${JSON.stringify(option)}`);
    return Gulp.src(['./src/**/*.spec.ts'], {read: false})
        // `gulp-mocha` needs filepaths so you can't have any plugins before it
        .pipe(Mocha(option))
        .on('error', console.error)
  }

  execMocha(doneFn) {
    // let configFile = `${this.TscConfigDir}/config.app.json`;
    // if (hasArg(this.args.spec)) {
    //   configFile = `${this.TscConfigDir}/config.spec.json`;
    // }

    // const configFile = './config/tsc/config.json'

    // log(`ConfigFile: ${configFile}`);
    const args = this.mochaBaseReportArgs;
    log(`mocha arguments: ${JSON.stringify(args)}`);
    CrossSpawn.sync('./node_modules/.bin/mocha', args, {
      stdio: 'inherit'
    });

    doneFn && doneFn();
  }

  watchMocha(doneFn) {
    // let configFile = `${this.TscConfigDir}/config.app.json`;
    // if (hasArg(this.args.spec)) {
    //   configFile = `${this.TscConfigDir}/config.spec.json`;
    // }

    // const configFile = './config/tsc/config.json'

    // log(`ConfigFile: ${configFile}`);
    const args = this.mochaBaseReportArgs.concat([
      '--watch' // must
    ]);
    log(`mocha arguments: ${JSON.stringify(args)}`);
    CrossSpawn.sync('./node_modules/.bin/mocha', args, {
      stdio: 'inherit'
    });

    doneFn && doneFn();
  }

  execNyc(doneFn) {
    const config = require('../../package.json').nyc;

    log(`nyc config: ${JSON.stringify(config)}`);
    const mochaArgs = this.mochaBaseArgs.concat([
      '--reporter',
      'mocha-sonarqube-reporter',
      '--reporter-options',
      'output=dist/reports/ut-report.xml'
    ]);
    const args = ['./node_modules/.bin/mocha'].concat(mochaArgs);
    log(`nyc arguments: ${JSON.stringify(args)}`);
    CrossSpawn.sync('./node_modules/.bin/nyc', args, {
      stdio: 'inherit'
    });

    doneFn && doneFn();
  }

  get mochaBaseArgs() {
    return [
      '--require',
      'ts-node/register',
      '--require',
      'source-map-support/register',
      '--recursive',
      './src/**/*.spec.ts',
      '--watch-extensions',
      'ts'
    ];
  }

  get mochaBaseReportArgs() {
    return this.mochaBaseArgs.concat([
      '--reporter',
      'list'
    ]);
  }

  get karmaConfigDir() { return `${this.consts.scaffoldDir}/karma`; }

  clean() {
    return Utils.cleanDir(`${this.consts.reportDistDir}/`);
  }
}

module.exports = Tester;
