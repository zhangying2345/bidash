/**
 * Define the tsc bundle service
 */
'use strict';

const Fs = require('fs');
const Path = require('path');

const Gulp = require('gulp');
const Tsc = require('gulp-typescript');
const Sourcemaps = require('gulp-sourcemaps');
const Stream2 = require('merge2');

const BaseBuild = require('./base');

class TscBuild extends BaseBuild {
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

    // enable Incremental compilation
    let configFile = 'tsc/tsconfig.app.json';
    if (this.cliParser.hasArg('spec')) {
      configFile = 'tsc/config.spec.json';
    }
    configFile = Path.join(this.projectConfig.configDir, configFile);
    this.appTsProject = Tsc.createProject(configFile, {outDir: null});

    // configFile = Path.join(this.projectConfig.rootConfigDir, 'tsc/tsconfig.libs.json');
    // this.libsTsProject = Tsc.createProject(configFile, {outDir: null});
    this.libsTscOutputDir = Path.join(this.cwd, 'dist/tsc/libs');

    this.appTscOutputDir = Path.join(this.projectConfig.distDir, 'tsc');
    this.appBundleDir = Path.join(this.projectConfig.bundleDistDir, 'app');
    this.libsBundleDir = Path.join(this.projectConfig.bundleDistDir, 'libs');
  }

  clean(doneFn) {
    const streams = Stream2();
    streams.add(this.utils.cleanDir(this.libsTscOutputDir));
    streams.add(this.utils.cleanDir(this.appBundleDir));
    streams.add(this.utils.cleanDir(this.libsBundleDir));
    streams.add(this.utils.cleanDir(this.appTscOutputDir));

    return streams;
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
    const streams = [];

    // let stream = this.libsTsProject.src()
    //   .pipe(Sourcemaps.init())
    //   // .pipe(Sourcemaps.identityMap())
    //   .pipe(this.libsTsProject())
    //   .pipe(Sourcemaps.write('.', { sourceRoot: './', includeContent: true }))
    //   .pipe(Gulp.dest(this.libsTscOutputDir));
    // streams.push(stream);

    // override tsconfig without outDir
    let stream = this.appTsProject.src()
      .pipe(Sourcemaps.init())
      // .pipe(Sourcemaps.identityMap())
      .pipe(this.appTsProject())
      .pipe(Sourcemaps.mapSources((sourcePath, file) => {
        const originPattern = '../../src';
        const newPattern = 'src';
        sourcePath = sourcePath.startsWith(originPattern) ? sourcePath.replace(originPattern, newPattern) : sourcePath;
        return sourcePath;
      }))
      .pipe(Sourcemaps.write('.', { sourceRoot: './', includeContent: true }))
      .pipe(Gulp.dest(this.appTscOutputDir));
    streams.push(stream);

    return Stream2(streams);
  }

  after(doneFn) {
    const streams = [];

    let stream = this.utils.copyPatterns(Path.join(this.appTscOutputDir, this.projectConfig.originRootDir, 'src/**'), this.appBundleDir);
    streams.push(stream);

    stream = this.utils.copyPatterns(Path.join(this.appTscOutputDir, 'libs/**/*'), this.libsBundleDir);
    streams.push(stream);

    stream = this.utils.copyPatterns(Path.join(this.appTscOutputDir, 'libs/**/*'), this.libsTscOutputDir);
    streams.push(stream);

    return Stream2(streams);
  }
}

module.exports = TscBuild;
