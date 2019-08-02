/**
 * Define the war package publish service
 */
'use strict';

const Path = require('path');
const Fs = require('fs');

const Gulp = require('gulp');
const Zip = require('gulp-zip');
const Rename = require('gulp-rename');
const Tar = require('gulp-tar');
const Gzip = require('gulp-gzip');
const War = require('gulp-war');

const Stream2 = require('merge2');

const BasePublisher = require('./base');

class WarPublish extends BasePublisher {
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
    const stream2 = Stream2();

    return stream2;
  }

  after(doneFn) {
    doneFn && doneFn();
  }

  buildWar() {
    const packageName = `${this.basePkgName}.war`;

    log(`buildWar, source dir: ${this.prepareDir}`);
    log(`buildWar, dest file: ${this.projectConfig.publishDistDir}/${packageName}`);
    log(`buildWar, deploy file: ${this.toDeployDir}/${this.packageType}.war`);
    return Gulp.src(`${this.prepareDir}/**/*`)
      .pipe(War(this.buildWarOption(`${this.projectConfig.packageName}`)))
      .pipe(Zip(packageName))
      .pipe(Gulp.dest(`${this.projectConfig.publishDistDir}`))
      .pipe(Rename(`${this.packageType}.war`))
      .pipe(Gulp.dest(`${this.toDeployDir}`));
  }

  buildTarInWar() {
    const packageName = `${this.basePkgName}-war.tar.gz`;

    log(`buildTarInWar, dest file: ${this.projectConfig.publishDistDir}/${packageName}`);
    // build tar.gz package
    return Gulp.src(
      [
        `${this.toDeployDir}/${this.packageType}.war`,
        `${this.projectConfig.publishFilesDir}/install.sh`
      ])
      .pipe(Tar(`${packageName}`))
      .pipe(Gzip({
        gzipOptions: {
          level: 9
        }
      }))
      .pipe(Gulp.dest(`${this.projectConfig.publishDistDir}`));
  }

  buildTsDocWar() {
    const packageName = `${this.projectConfig.packageName}-api.war`;

    //const typeDocConfig = require(`${this.apiDocMaker.ApiDocsConfigDir}/typedoc.json`);
    const srcDir =`${this.projectConfig.apiDocDistDir}/typedoc`;

    log(`buildTsDocWar, source dir: ${srcDir}`);
    log(`buildTsDocWar, dest file: ${this.projectConfig.publishDistDir}/${packageName}`);
    return Gulp.src(`${srcDir}/**/*`)
      .pipe(War(this.buildWarOption(`${this.projectConfig.packageName}-api-reference`)))
      .pipe(Zip(packageName))
      .pipe(Gulp.dest(`${this.projectConfig.publishDistDir}`));
  }

  buildWarOption(displayName) {
    return {
      version: '3.1',
      welcome: 'index.html',
      displayName: `${displayName}`,
      schemaLocation: 'http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd',
      webappExtras: ['<error-page>\n' + '<error-code>404</error-code>' + '<location>/</location>\n' + '</error-page>']
    };
  }
}

module.exports = WarPublish;
