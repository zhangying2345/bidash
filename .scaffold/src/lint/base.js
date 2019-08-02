/**
 * Define the base for code lint
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

class BaseLint extends ServiceBase {
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

    this.lintConfigDir = Path.join(this.projectConfig.rootConfigDir, 'lint');
  }
}

module.exports = BaseLint;
