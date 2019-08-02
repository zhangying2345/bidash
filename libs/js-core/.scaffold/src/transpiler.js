/**
 * Define the consts used in gulpfile.js
 */
'use strict';

const Gulp = require('gulp');

const Merge2 = require('merge2');
const Watcher = require('gulp-watch');
const FancyLog = require('fancy-log');
const CrossSpawn = require('cross-spawn');

const {
  log,
  hasArg
} = require('../helper');

const Typescript = require('gulp-typescript');
const Sourcemaps = require('gulp-sourcemaps');

const Utils = require('./utils');

class Transpiler {
  constructor(args) {
    this.args = args;
    this.tsProject = Typescript.createProject('./config/tsc/config.tsc.json');
  }

  cleanTscBuild() {
    return Utils.cleanDir('./dist/tsc');
  }

  tscBuild() {
    // ref: https://www.npmjs.com/package/gulp-typescript
    const tsResult = this.tsProject.src()
        .pipe(Sourcemaps.init()) // gulp-typescript dosn't support sourcemap, use gulp-sourcemaps
        .pipe(this.tsProject());

    return Merge2([
      tsResult.dts.pipe(Gulp.dest('dist/tsc')), // for .d.ts, no need sourcemap
      tsResult.js.pipe(Sourcemaps.write('.', {
        // ref: https://www.npmjs.com/package/gulp-typescript#source-maps
        sourceRoot: './', // relatvie dir to Gulp.dest dir
        includeContent: false // no original sources in .js.map
      })).pipe(Gulp.dest('dist/tsc')) // recommnad to keep it same as outDir in tsconfig.json
    ]);
  }

  tscBuildWatch(doneFn) {
    try {
      const option= {
        delay: 3000 // delay 3s to improve performance in find-and-replace actions
      };
      const watcher = Gulp.watch([
        './src/**/*',
      ], option, this.tscBuild());
      const watchCallback = function(path, states, event) {
        FancyLog('File: ' + path + `, Event: ${event}`);
        doneFn();
      }
      watcher.on('all', (event, path, stats) => watchCallback(path, stats, event));
      // watcher.on('change', (path, stats) => watchCallback(path, stats, 'changed'));
    } catch(error) {
      FancyLog.error('Watcher error:' + error);
    } finally {
      doneFn();
    }
  }

  execTsc(doneFn) {
    // let configFile = `${this.TscConfigDir}/config.app.json`;
    // if (hasArg(this.args.spec)) {
    //   configFile = `${this.TscConfigDir}/config.spec.json`;
    // }

    const configFile = './config/tsc/config.json'

    log(`ConfigFile: ${configFile}`);
    CrossSpawn.sync('./node_modules/.bin/tsc', ['--project', configFile], {
      stdio: 'inherit'
    });

    doneFn && doneFn();
  }

  watchTsc(doneFn) {
    const configFile = './config/tsc/config.json'

    log(`ConfigFile: ${configFile}`);
    CrossSpawn.sync('./node_modules/.bin/tsc', ['--watch', '--project', configFile], {
      stdio: 'inherit'
    });

    doneFn && doneFn();
  }

  get TscOutputDir() {
    return `${this.consts.bundleDistDir}/tsc`;
  }
  get TscConfigDir() {
    return `${this.consts.scaffoldDir}/tsc`;
  }
}

module.exports = Transpiler;
