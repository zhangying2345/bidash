/**
 * Define the helper to use bundler
 */
'use strict';

const Gulp = require('gulp');

const Merge2 = require('merge2');
const Watcher = require('gulp-watch');
const FancyLog = require('fancy-log');

const Rollup = require('rollup');
const RollupTypescript = require('rollup-plugin-typescript2');
const RollupUglify = require('rollup-plugin-uglify');
const RollupTerser = require('rollup-plugin-terser');

const Utils = require('./utils');

class ModuleBundler {
  constructor(args) {
    this.args = args;
  }

  cleanBuild() {
    return Utils.cleanDir('./dist');
  }

  async buildUmd() {
    const rollupConfig = require('../../config/rollup/config.dev.js');
    const rollup = await Rollup.rollup({
      input: rollupConfig.input,
      plugins: [
        RollupTypescript({
          tsconfig: './config/tsc/config.rollup.json',
          useTsconfigDeclarationDir: false
        }),
        RollupUglify.uglify()
      ]
    });

    await rollup.write(rollupConfig.output[0]);
  }

  async buildEs() {
    const rollupConfig = require('../../config/rollup/config.dev.js');
    const rollup = await Rollup.rollup({
      input: rollupConfig.input,
      plugins: [
        RollupTypescript({
          tsconfig: './config/tsc/config.rollup.json',
          useTsconfigDeclarationDir: false
        }),
        RollupTerser.terser()
      ]
    });

    await rollup.write(rollupConfig.output[1]);
  }

}

// exports
module.exports = ModuleBundler;
