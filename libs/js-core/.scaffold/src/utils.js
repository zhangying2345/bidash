/**
 * Utilities
 */
'use strict';

const Path = require('path');

const Gulp = require('gulp');
const Glob = require('glob');
const Globby = require('globby');
const Clean = require('gulp-clean');

const {
  log,
  logV,
  isDefaultArg,
  hasArg
} = require('../helper');

class Utils {
  static cleanPatterns(patterns) {
    const files = Globby.sync(patterns);
    log('clean files: ' + JSON.stringify(files, null, 2));
    return Gulp.src(files, {read: false, allowEmpty: true})
      .pipe(Clean({
        force: true
      }));
  }

  static cleanDir(srcDir) {
    log(`clean dir: ${srcDir}`);
    let files = Globby.sync(srcDir);
    files.push(srcDir); // append the folder itself to end
    log('clean files: ' + JSON.stringify(files, null, 2));
    return Gulp.src(files, {read: false, allowEmpty: true})
      .pipe(Clean({
        force: true
      }));
  }

  static copyPatterns(patterns, destDir) {
    const files = Globby.sync(patterns);
    logV('copy files: ' + JSON.stringify(files, null, 2) + ' to ' + destDir);
    return Gulp.src(patterns, {allowEmpty: true})
      .pipe(Gulp.dest(destDir));
  }

  static getWatcherStats(vinyl) {
    const stats = {
      // hitstory: change.history,
      path: vinyl.path,
      // stat: change.stat,
      event: vinyl.event
    };
    return stats;
  }

  static get watcherOptions() {
    const options = {
      name: 'watcher',
      events: [
        'error',     // itself error
        // 'ready',     // initial scan complete, ready for changes. Note: don't use this, or it shows 'Path must be a string'
        // 'raw',       // raw event info
        'add',       // add new file
        'change',    // file changed
        'unlink',    // remove file
        'addDir',    // add new folder
        'unlinkDir'  // remove folder
      ]
    };
    return options;
  }
}

module.exports = Utils;
