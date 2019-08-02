/**
 * Define the tar package publish service
 */
'use strict';

const Path = require('path');
const Fs = require('fs');

const Gulp = require('gulp');
const Tar = require('gulp-tar');
const Gzip = require('gulp-gzip');
const Stream2 = require('merge2');

const BasePublisher = require('./base');

class TarPublish extends BasePublisher {
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
    return this.utils.cleanDir(this.projectConfig.publishDistDir);
  }

  before(doneFn) {
    const stream2 = Stream2();

    return stream2;
  }

  after(doneFn) {
    doneFn && doneFn();
  }

  start() {
    const packageName = `${this.basePkgName}.tar.gz`;

    log(`buildTarInRaw, source dir: ${this.prepareDir}`);
    log(`buildTarInRaw, dest file: ${this.projectConfig.publishDistDir}/${packageName}`);
    // build tar.gz package
    return Gulp.src(`${this.prepareDir}/**/*`)
      .pipe(Tar(`${packageName}`))
      .pipe(Gzip({
        gzipOptions: {
          level: 9
        }
      }))
      .pipe(Gulp.dest(`${this.projectConfig.publishDistDir}`));
  }
}

module.exports = TarPublish;
