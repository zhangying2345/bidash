/**
 * Define the base for local dev serve
 */
'use strict';

const Fs = require('fs');
const FsExtra = require('fs-extra');
const Path = require('path');

const Gulp = require('gulp');
const FancyLog = require('fancy-log');
const Watcher = require('gulp-watch');

const CrossSpawn = require('cross-spawn');
const Opn = require('opn');

const ServiceBase = require('../services/base-service');

class BaseDevServe extends ServiceBase {
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

  killProcess(childProcess) {
    const pid = childProcess.pid;

    FancyLog(`kill process tree derived from pid: ${pid}`);

    // kill process in different platform
    switch (process.platform) {
    default:
    case 'win32':
      CrossSpawn.sync('taskkill', ['/F', '/T', '/PID', pid]);
      break;
    case 'darwin':
    case 'linux':
      // if process has children, use pkill, or use kill
      // pgrep -P <pid> to check it has children or not
      // CrossSpawn.sync('pkill', ['-P', pid]);
      CrossSpawn.sync('kill', ['-9', pid]);
      break;
    }
  }

  launchBrowser(url) {
    if (this.cliParser.hasBoolArg('browser')) {
      // Opn(url, {
      //   app: [this.chromeExe, '--incognito']
      // });
      this.launchChrome(null, url);
    }
  }

  launchChrome(doneFn, url = '') {
    if (process.platform === 'darwin') {
      const childProcess = CrossSpawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
        '--incognito',
        url], {
        stdio: ['ignore', process.stdout, process.stderr]
      });

      doneFn && doneFn();
      return childProcess;
    }

    Opn('https://cn.bing.com', {
      app: [this.chromeExe, '--incognito', url]
    });

    doneFn && doneFn();
  }

  /**
   * For each platform, google chrome should be installed as the precondition
   *
   * @returns the chrome exe path for each platform
   */
  get chromeExe() {
    let exePath = 'chrome';
    switch (process.platform) {
    default:
    case 'win32':
      exePath = 'chrome';
      break;
    case 'darwin':
      exePath = '/Applications/Google Chrome.app';
      break;
    case 'linux':
      exePath = 'google-chrome';
      break;
    }

    return exePath;
  }
}

module.exports = BaseDevServe;
