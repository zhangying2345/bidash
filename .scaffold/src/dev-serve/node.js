/**
 * Define the node.js dev serve service
 */
'use strict';

const Fs = require('fs');
const Path = require('path');

const Gulp = require('gulp');

const FancyLog = require('fancy-log');
const CrossSpawn = require('cross-spawn');

const BaseDevServe = require('./base');

class NodeDevServe extends BaseDevServe {
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

    this.childProcess = null;

    this.appFile = Path.join(this.projectConfig.bundleDistDir, 'app/index.js');
  }

  clean(doneFn) {
    // return this.utils.cleanDir(this.tscOutputDir);
  }

  before(doneFn) {
    doneFn && doneFn();
  }

  /*
   * Typecript compile
   *
   * ref: https://www.npmjs.com/package/gulp-typescript
   */

  start(doneFn) {
    if (this.childProcess) {
      FancyLog('Restart Server');
      this.killProcess(this.childProcess);
      this.childProcess = null;
    }

    let args = process.argv.slice(2); // ignore node and gulp
    args = ['--max-old-space-size=4096', '--trace-warnings', this.appFile].concat(args);
    this.loger.log('args: ' + args);

    this.childProcess = CrossSpawn('node', args, {
      stdio: ['ignore', process.stdout, process.stderr]
    });

    FancyLog(`create server in pid & ppid: ${this.childProcess.pid}`);

    doneFn();
  }

  after(doneFn) {
    doneFn && doneFn();
  }

  watch(devTask, doneFn) {
    try {
      const option= {
        delay: 3000 // delay 3s to improve performance in find-and-replace actions
      };
      const watchPatterns = this.projectConfig.config.devServe.watch;
      this.loger.logV(JSON.stringify(watchPatterns, null, 2));
      const watcher = Gulp.watch(watchPatterns, option, Gulp.series(devTask));
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
}

module.exports = NodeDevServe;
