/**
 * Define the tslint lint service
 */
'use strict';

const Fs = require('fs');
const Path = require('path');

const Gulp = require('gulp');

const FancyLog = require('fancy-log');
const CrossSpawn = require('cross-spawn');

const BaseUnitTest = require('./base');

class TsUnitTest extends BaseUnitTest {
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

    doneFn();
  }

  after(doneFn) {
    doneFn && doneFn();
  }
}

module.exports = TsUnitTest;
