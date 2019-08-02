/**
 * Define the base for package & publish
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
const Clean = require('gulp-clean');
const Replace = require('gulp-replace');

const Stream2 = require('merge2');
const Del = require('del');
const CrossSpawn = require('cross-spawn');

const BaseService = require('../services/base-service');

class BasePublish extends BaseService {
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

    // if it is prod, change to portal for official release
    const packageType = this.cliParser.option.packageType;
    this.packageType = packageType;

    this.tag = this.cliParser.option.buildTag;
    const cliVervion = this.cliParser.hasStringArg('version');
    const version = cliVervion ? cliVervion : this.projectConfig.packageVersion;

    this.basePkgName = `${this.projectConfig.packageName}-${version}-${packageType}-${this.tag}`;

    this.prepareDir = Path.join(this.projectConfig.publishDistDir, 'prepare');
    this.toDeployDir = Path.join(this.projectConfig.publishDistDir, 'to-deploy');

    this.bundleDistDir = this.getBundleDistDir();

    const items = this.projectConfig.config.copy.publish.patterns;
    // filter out not ignore keys
    const validItems = items.filter((item) => !(item.option && (item.option.ignore || (item.option.type !== 'bundled'))));
    this.publishCopies = validItems;
  }

  clean() {
    return this.utils.cleanDir(this.prepareDir);
  }

  getBundleDistDir() {
    let bundleDistDir = this.projectConfig.bundleDistDir;
    const cliSrc = this.cliParser.hasStringArg('src');
    bundleDistDir = cliSrc ? Path.join(process.cwd(), cliSrc) : bundleDistDir;
    return bundleDistDir;
  }

  before(doneFn) {
    const bundleDistDir = this.bundleDistDir;
    this.loger.log('prepare, bundle source dir: ' + bundleDistDir);

    const streams = [];
    this.publishCopies.forEach((config) => {
      streams.push(this.utils.copyPatterns(config.files, config.destDir, config.option));
    });

    // with -sm, --sm or --source-map
    const hasSourceMapArg = this.cliParser.hasBoolArg('sm') || this.cliParser.hasBoolArg('sourceMap');
    if (hasSourceMapArg) {
      const pattern = Path.join(bundleDistDir, '**/*.map');
      streams.push(this.utils.copyPatterns(pattern, this.prepareDir));
    }

    // parallel streams
    return Stream2(streams);
  }

  version() {
    const cliUpdate = this.cliParser.hasStringArg('update');
    const version = cliUpdate ? cliUpdate : this.projectConfig.packageVersion;
    this.loger.log(`new version: "${version}"`);

    const setCliRoot = this.cliParser.hasBoolArg('root');
    let projectRootDir = this.projectConfig.rootDir;
    projectRootDir = setCliRoot ? '.' : projectRootDir;

    let projectConfigDir = this.projectConfig.configDir;
    projectConfigDir = setCliRoot ? this.projectConfig.rootConfigDir : projectConfigDir;

    const streams = [];
    const loger = this.loger;
    // package.json
    const packageJsonFile = Path.join(projectRootDir, './package.json');
    if (Fs.existsSync(packageJsonFile)) {
      const stream = Gulp.src(packageJsonFile)
        .pipe(Replace(/"version" *: *("[0-9]+.[0-9]+.[0-9]+")/, function (match, p1, offset, string) {
          loger.log(`${this.file.path}: Found '${match}' with param ${p1} at ${offset} with new value "${version}"`);

          return `"version": "${version}"`;
        }))
        .pipe(Gulp.dest(projectRootDir));
      streams.push(stream);
    } else {
      this.loger.log(`${packageJsonFile} not exist`);
    }

    // package.yml
    const packageYmlFile = Path.join(projectRootDir, './package.yml');
    if (Fs.existsSync(packageYmlFile)) {
      const stream = Gulp.src(packageYmlFile)
        .pipe(Replace(/version *: *([0-9]+.[0-9]+.[0-9]+)/, function (match, p1, offset, string) {
          loger.log(`${this.file.path}: Found '${match}' with param ${p1} at ${offset} with new value "${version}"`);

          return `version: ${version}`;
        }))
        .pipe(Gulp.dest(projectRootDir));
      streams.push(stream);
    } else {
      this.loger.log(`${packageYmlFile} not exist`);
    }

    // sonarqube properties
    const patterns = [
      Path.join(projectConfigDir, '**/sonar-project.properties')
    ];
    const sonarProjectProperties = this.utils.checkFiles(patterns);
    if (sonarProjectProperties.length > 0) {
      const stream = Gulp.src(patterns)
        .pipe(Replace(/projectVersion *= *([0-9]+.[0-9]+.[0-9]+)/, function (match, p1, offset, string) {
          loger.log(`${this.file.path}: Found '${match}' with param ${p1} at ${offset} with new value "${version}"`);

          return `projectVersion=${version}`;
        }))
        .pipe(Gulp.dest(projectConfigDir));
      streams.push(stream);
    } else {
      this.loger.log(`sonar-project.properties not exist`);
    }

    return Stream2(streams);
  }
}

module.exports = BasePublish;
