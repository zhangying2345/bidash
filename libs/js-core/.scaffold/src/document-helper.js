/**
 * Define i18n utils
 */
'use strict';

const Path = require('path');
const Fs = require('fs');
const Globby = require('globby');
const Gulp = require('gulp');
const Clean = require('gulp-clean');

const Flatten = require('gulp-flatten');
const Watcher = require('gulp-watch');
const FancyLog = require('fancy-log');

const Merge2 = require('merge2');

const { Langs } = require('../../config/i18n-langs.js');

const {
  log,
  logV
} = require('../helper');

class DocumentHelper {
  constructor(projectConfig, args, consts) {
    this.projectConfig = projectConfig;
    this.args = args;
    this.consts = consts;
  }

  collectFiles() {
    const streams = [];
    Langs.forEach((lang) => {
      const config = this.getDocConfig(lang);
      const outputDir = config.destDir;

      // files for each pattern
      const files = Globby.sync(config.files);
      logV(files);

      const stream = Gulp.src(config.files)
        .pipe(Flatten()) // remove folder structure
        .pipe(Gulp.dest(`${outputDir}`));
      streams.push(stream);
    });

    return Merge2(streams);
  }

  clean() {
    const streams=[];
    Langs.forEach((lang) => {
      const config = this.getDocConfig(lang);
      const stream = Gulp.src(
        [
          `${config.destDir}`
        ], {read: false, allowEmpty: true})
        .pipe(Clean({
          force: true
        }));
      streams.push(stream);
    });

    return Merge2(streams);
  }

  getDocConfig(lang) {
    const config = this.projectConfig.copy.bundle.docs.find((item) => (item.lang === lang));
    if(!config) {
      FancyLog.error('undefined document config: ' + lang + ', please check config/i18n-configs.js and config/project-configs/deploy.yml');
    }
    return config;
  }
}

module.exports = DocumentHelper;
