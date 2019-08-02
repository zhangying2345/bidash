/**
 * Define the base for build/bundle
 */
'use strict';

const Fs = require('fs');
const FsExtra = require('fs-extra');
const Path = require('path');

const Gulp = require('gulp');
const FancyLog = require('fancy-log');
const PluginError = require('plugin-error');
const Clean = require('gulp-clean');
const Watcher = require('gulp-watch');

const Flatten = require('gulp-flatten');
const Stream2 = require('merge2');

const Del = require('del');
const Globby = require('globby');

const ServiceBase = require('../services/base-service');

class BaseBuild extends ServiceBase {
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

    const items = this.projectConfig.config.copy.bundle.patterns;
    // filter out not ignore keys
    const validItems = items.filter((item) => !(item.option && item.option.ignore));

    this.bundleCopies = validItems;
  }

  // generateBuildInfo(doneFn) {
  //   // prepare build info, such as build timestamp, save into a config file
  //   const buildInfo = {
  //     version: this.consts.packageVersion,
  //     timestamp: new Date().toLocaleString()
  //   };
  //   const outputDir = Path.join(this.consts.srcDir, 'environments');
  //   FsExtra.outputFileSync(`${outputDir}/build-info.json`, JSON.stringify(buildInfo, null, 2));

  //   doneFn();
  // }

  cleanCopies(doneFn) {
    const items = this.bundleCopies;
    for (let item of items) {
      const destDir = Path.join(this.cwd, item.destDir);
      this.loger.log('cleanCopies: ' + destDir);
      let distFiles = Globby.sync(destDir);
      distFiles.unshift(destDir);
      this.loger.logV('Clean files: ' + JSON.stringify(distFiles, null, 2));

      // clean old
      Del.sync([destDir], {force: true});
    }
    doneFn && doneFn();
  }

  copy(doneFn) {
    const items = this.bundleCopies;
    const streams = [];
    for (let item of items) {
      const destDir = Path.join(this.cwd, item.destDir);
      const stream = this.utils.copyPatterns(item.files, destDir, item.option);

      streams.push(stream);
    }

    return Stream2(streams);
  }

  watchBundleCopies(doneFn) {
    const options = this.utils.watcherOptions;
    const watchBlobs = this.bundleCopies.reduce((result, current) => {
      return result.concat(current.files);
    }, []);
    this.loger.logV(watchBlobs);
    try {
      Watcher(watchBlobs, options, function (change) {
        const stats = this.utils.getWatcherStats(change);
        FancyLog('Detect: ' + JSON.stringify(stats));
        FancyLog('Re-copy bundle need files');
        this.cleanCopies(); // firstly, clean
        this.copy(); // secondly, copy again
      }.bind(this));
    } catch(error) {
      FancyLog.error('Watcher error:' + error);
    }

    doneFn();
  }

  get tagBundleDistDir() {
    return this.cliParser.option.tagBundleDistDir;
  }
  get bundleLogFile() {
    return this.cliParser.option.bundleLogFile;
  }
}

module.exports = BaseBuild;
