/**
 * Define the base for unit test
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

class BaseUnitTest extends ServiceBase {
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
}

module.exports = BaseUnitTest;
