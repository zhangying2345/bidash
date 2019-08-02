/**
 * Utilities service
 */
'use strict';

const Fs = require('fs');
const Path = require('path');

const Gulp = require('gulp');
const Globby = require('globby');
const Clean = require('gulp-clean');
const Flatten = require('gulp-flatten');
const Replace = require('gulp-replace');

const Stream2 = require('merge2');

const Through2 = require('through2');

const Yaml = require('js-yaml');

const BaseService = require('./base-service');

class Utils extends BaseService {
  constructor(injector) {
    super(injector);
    // console.log('Utils Cnt.');
  }

  // only get other service, dont call any method from them
  resolveDependencies() {
    super.resolveDependencies();
  }

  // do initial tasks
  initialize() {
    super.initialize();
  }

  tryGetJson(string) {
    let isJson = true;
    try {
      const config = JSON.parse(string);
      return config;
    } catch(error) {
      isJson = false;
    }

    return isJson;
  }

  tryGetYamlJson(string) {
    let isYaml = true;
    try {
      const config = Yaml.safeLoad(string);
      return config;
    } catch(error) {
      isYaml = false;
    }

    return isYaml;
  }

  // if files exists, return file list, otherwise, return false
  checkFiles(patterns) {
    const files = Globby.sync(patterns);
    const result = (files.length > 0) ? files : false;
    return result;
  }

  cleanPatterns(patterns) {
    const files = Globby.sync(patterns);
    if (files.length < 1) {
      return this.emptyStream;
    }
    this.loger.logV('clean files: ' + JSON.stringify(files, null, 2));
    return Gulp.src(files, {read: false, allowEmpty: true})
      .pipe(Clean({
        force: true
      }));
  }

  // also suppot to clean single file
  cleanDir(srcDir) {
    const isDir = Fs.existsSync(srcDir) && Fs.lstatSync(srcDir).isDirectory();
    isDir && this.loger.log(`clean dir: ${srcDir}`);
    const files = isDir? Globby.sync(srcDir) : [];
    isDir && files.push(srcDir); // append the folder itself to end
    if (files.length < 1) {
      return this.emptyStream;
    }
    this.loger.logV('clean files: ' + JSON.stringify(files, null, 2));
    return Gulp.src(files, {read: false, allowEmpty: true})
      .pipe(Clean({
        force: true
      }));
  }

  copyPatterns(patterns, destDir, option) {
    let files = [];
    try {
      files = Globby.sync(patterns);
    } catch(error) {
      return this.emptyStream;
    }
    if (files.length < 1) {
      return this.emptyStream;
    }
    this.loger.logV('copy files: ' + JSON.stringify(files, null, 2) + ' to ' + destDir);
    let stream = Gulp.src(patterns, {allowEmpty: true});
    // handle options
    if (option && option.flat) {
      stream = stream.pipe(Flatten());
    }
    if (option && option.replace) {
      let pattern = option.replace.from;
      const replacement = option.replace.to;

      if (option.replace.type && option.replace.type ==='regex' ) {
        let flags = option.replace.regexFlags;
        flags = flags ? flags : 'g';
        pattern = new RegExp(pattern, flags);
      }
      stream = stream.pipe(Replace(pattern, replacement));
    }

    stream = stream.pipe(Gulp.dest(destDir));
    return stream;
  }

  addPrefixDir(files, prefixDir) {
    files = files.map((file) => {
      let result = Path.join(prefixDir, file);
      const setIgnored = file.startsWith('!');
      if (setIgnored) {
        result = `!${result}`;
      }
      return result;
    });
    return files;
  }

  get emptyTask() {
    const fn = (doneFn) => {
      doneFn && doneFn();
    }
    return Gulp.task(fn);
  }

  get emptyStream() {
    const pass = Through2.obj();
    process.nextTick(pass.end.bind(pass));
    return pass;
  }

  getWatcherStats(vinyl) {
    const stats = {
      // hitstory: change.history,
      path: vinyl.path,
      // stat: change.stat,
      event: vinyl.event
    };
    return stats;
  }

  get watcherOptions() {
    const options = {
      name: 'watcher',
      events: [
        'error',     // itself error
        // 'ready',     // initial scan complete, ready for changes. Note: don't use this, or it shows 'Path must be a string'
        // 'raw',       // raw event info
        'add',       // add new file
        'change',    // file changed
        'unlink',    // remove file
        'addDir',    // add new folder
        'unlinkDir'  // remove folder
      ]
    };
    return options;
  }

  // It will show assets, hash, timing, performance, because their default value is true
  get webpackAssetsOnlyStats() {
    return {
      // assets: false, // uncomment this to slient webpack totally
      chunks: false,
      chunkModules: false,
      chunkOrigins: false,
      modules: false,
      moduleTrace: false,
      children: false,
      // version: false,
      // hash: false
    };
  }

  // Base on webpackAssetsOnlyStats, it shows modules, chunks
  get webpackDetailedStats() {
    const reversed = {};
    Object.keys(this.webpackAssetsOnlyStats).forEach((key) => {
      reversed[key] = !this.webpackAssetsOnlyStats[key];
    });

    return reversed;
  }

  // Base on webpackAssetsOnlyStats, it show colors, errors
  get webpackErrorsStats() {
    return Object.assign({},
      this.webpackAssetsOnlyStats,
      {
        colors: true,
        warnings: true,
        errors: true,
        errorDetails: true,
      }
    );
  }

  // Base on webpackErrorsStats, but no assets, timing & performance
  get WebpackWatchStats() {
    return Object.assign({},
      this.webpackErrorsStats,
      {
        // timings: false,
        // performance: false,
        // hash: false,
        assets: false
      }
    );
  }

  // Base on WebpackWatchStats, only show color, disable all others
  get webpackSlientStats() {
    return Object.assign({},
      this.WebpackWatchStats,
      {
        warnings: false,
        errors: false,
        errorDetails: false,
      }
    );
  }

  // Show all stats
  get webpackVerboseStats() {
    return Object.assign({},
      this.webpackErrorsStats,
      this.webpackDetailedStats, // must behind webpackErrorsStats
      {
        // assets: true,
        maxModules: Infinity,
        providedExports: true,
        usedExports: true,
      }
    );
  }
}

module.exports = Utils;
