/**
 * Define the consts used in gulpfile.js
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

const Merge2 = require('merge2');
const Del = require('del');

const Utils = require('./utils');

const {
  log,
  isDefaultArg,
  hasArg
} = require('../helper');

class Publisher {
  constructor(projectConfig, moduleBundler, args, consts, webpackArgs, tagMaker, apiDocMaker, i18nHelper) {
    this.projectConfig = projectConfig;
    this.moduleBundler = moduleBundler;
    this.args = args;
    this.consts = consts;
    this.tagMaker = tagMaker;
    this.apiDocMaker = apiDocMaker;
    this.i18nHelper = i18nHelper;

    // if it is prod, change to portal for official release
    const packageType = webpackArgs && webpackArgs.packageType;
    this.packageTypeName = packageType;

    this.tag = tagMaker && tagMaker.tag;
    const version = hasArg(this.args.version) ? this.args.version : this.consts.npmPackageVersion;

    this.pkgNameBase = `${this.consts.npmPackageName}-${version}-${packageType}-${this.tag}`;

    this.bundleDistDir = this.getBundleDistDir();
    this.distDir = this.getDistDir();
  }

  get distDeployDir() {
    return `${this.consts.deployDistDir}/to-deploy`;
  }

  getDistDir() {
    if (!this.bundleDistDir) { return ''; }

    const sourceDirName = Path.basename(this.bundleDistDir);
    const distDir = Path.join(this.consts.deployDistDir, sourceDirName);
    return distDir;
  }

  getBundleDistDir() {
    let bundleDistDir = this.moduleBundler.webpackOutputDir;
    if (hasArg(this.args.src) && (typeof(this.args.src) === 'string')) {
      bundleDistDir = Path.join(process.cwd(), this.args.src);
    }

    return bundleDistDir;
  }

  clean(doneFn) {
    return Utils.cleanDir(this.consts.deployDistDir);
  }

  prepare(doneFn) {
    const bundleDistDir = this.consts.bundleDistDir;
    const hasEndSlash = bundleDistDir.endsWith('/');

    const streams=[];
    this.projectConfig.copy.package.forEach((config) => {
      streams.push(Utils.copyPatterns(config.files, config.destDir));
    });

    // with -sm, --sm or --sourcemaps from ng cli
    if (hasArg(this.args.sm) || hasArg(this.args.sourcemaps)) {
      const pattern = hasEndSlash ? `${bundleDistDir}**/*.map` : `${bundleDistDir}/**/*.map`;
      streams.push(Utils.copyPatterns(pattern, this.consts.deployDistDir));
    }
    return Merge2(streams);
  }

  buildWar() {
    const packageName = `${this.pkgNameBase}.war`;

    log(`buildWar, source dir: ${this.distDir}`);
    log(`buildWar, dest file: ${this.consts.deployDistDir}/${packageName}`);
    log(`buildWar, deploy file: ${this.distDeployDir}/${this.packageTypeName}.war`);
    return Gulp.src(`${this.distDir}/**/*`)
      .pipe(War(this.buildWarOption(`${this.consts.npmPackageName}`)))
      .pipe(Zip(packageName))
      .pipe(Gulp.dest(`${this.consts.deployDistDir}`))
      .pipe(Rename(`${this.packageTypeName}.war`))
      .pipe(Gulp.dest(`${this.distDeployDir}`));
  }

  buildTarInWar() {
    const packageName = `${this.pkgNameBase}-war.tar.gz`;

    log(`buildTarInWar, dest file: ${this.consts.deployDistDir}/${packageName}`);
    // build tar.gz package
    return Gulp.src(
      [
        `${this.distDeployDir}/${this.packageTypeName}.war`,
        `${this.consts.deployFilesDir}/install.sh`
      ])
      .pipe(Tar(`${packageName}`))
      .pipe(Gzip({
        gzipOptions: {
          level: 9
        }
      }))
      .pipe(Gulp.dest(`${this.consts.deployDistDir}`));
  }

  buildTarInRaw() {
    const packageName = `${this.pkgNameBase}.tar.gz`;

    log(`buildTarInRaw, source dir: ${this.distDir}`);
    log(`buildTarInRaw, dest file: ${this.consts.deployDistDir}/${packageName}`);
    // build tar.gz package
    return Gulp.src(`${this.distDir}/**/*`)
      .pipe(Tar(`${packageName}`))
      .pipe(Gzip({
        gzipOptions: {
          level: 9
        }
      }))
      .pipe(Gulp.dest(`${this.consts.deployDistDir}`));
  }

  buildTsDocWar() {
    const packageName = `${this.consts.npmPackageName}-api.war`;

    //const typeDocConfig = require(`${this.apiDocMaker.ApiDocsConfigDir}/typedoc.json`);
    const srcDir =`${this.consts.apiDocDistDir}/typedoc`;

    log(`buildTsDocWar, source dir: ${srcDir}`);
    log(`buildTsDocWar, dest file: ${this.consts.deployDistDir}/${packageName}`);
    return Gulp.src(`${srcDir}/**/*`)
      .pipe(War(this.buildWarOption(`${this.consts.npmPackageName}-api-reference`)))
      .pipe(Zip(packageName))
      .pipe(Gulp.dest(`${this.consts.deployDistDir}`));
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

  version() {
    const replace = require('gulp-replace');

    const version = hasArg(this.args.update) && (typeof (this.args.update) === 'string') ? this.args.update : this.consts.npmPackageVersion;
    log(`new version: "${version}"`);

    // package.json
    const npmPackageUpdater = Gulp.src(
      [
        Path.join(process.cwd(), './package.json'),
      ])
      .pipe(replace(/"version" *: *("[0-9]+.[0-9]+.[0-9]+")/, function (match, p1, offset, string) {
        log(`${this.file.path}: Found '${match}' with param ${p1} at ${offset} with new value "${version}"`);

        return `"version": "${version}"`;
      }))
      .pipe(Gulp.dest('./'));

    // package.yml
    const packageYamlUpdater = Gulp.src(
      [
        Path.join(process.cwd(), './package.yml')
      ])
      .pipe(replace(/version *: *([0-9]+.[0-9]+.[0-9]+)/, function (match, p1, offset, string) {
        log(`${this.file.path}: Found '${match}' with param ${p1} at ${offset} with new value "${version}"`);

        return `version: ${version}`;
      }))
      .pipe(Gulp.dest('./'));

    // sonarqube properties
    const sonarUpdater = Gulp.src(
      [
        `${this.consts.projectConfigDir}/sonar*.properties`,
      ])
      .pipe(replace(/projectVersion *= *([0-9]+.[0-9]+.[0-9]+)/, function (match, p1, offset, string) {
        log(`${this.file.path}: Found '${match}' with param ${p1} at ${offset} with new value "${version}"`);

        return `projectVersion=${version}`;
      }))
      .pipe(Gulp.dest(`${this.consts.projectConfigDir}/`));

    return Merge2(npmPackageUpdater, packageYamlUpdater, sonarUpdater);
  }
}

module.exports = Publisher;
