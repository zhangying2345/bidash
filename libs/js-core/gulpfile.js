/**
 * gulp 4.x
 */
'use strict';

const Gulp = require('gulp');

const {
  ApiDocMaker,
  DocumentHelper,
  Linter,
  ModuleBundler,
  Publisher,
  Tester,
  Transpiler
} = require('./.scaffold');

// bundling in Tsc
Gulp.task('tsc:clean', Transpiler.cleanTscBuild.bind(Transpiler));
Gulp.task('tsc', Gulp.series('tsc:clean', Transpiler.execTsc.bind(Transpiler)));
Gulp.task('tsc:watch', Transpiler.watchTsc.bind(Transpiler))
// Gulp.task('tsc:watch', Gulp.series('tsc', () => {
//   const option= {
//     delay: 3000 // delay 3s to improve performance in find-and-replace actions
//   };
//   const watcher = Gulp.watch('./src/**/*.ts', option, Gulp.series('tsc'));
//   watcher.on('all', function(event, path, stats) {
//     console.log('File: ' + path + `, Event: ${event}`);
//   });
// }));
// below method not works
// Gulp.task('tsc:watch2', Gulp.series('tsc', Transpiler.tscBuildWatch.bind(Transpiler)));

// bundling in Rollup
Gulp.task('bundle:rollup:clean', ModuleBundler.cleanBuild.bind(ModuleBundler));
Gulp.task('bundle:rollup', Gulp.series('bundle:rollup:clean', ModuleBundler.buildUmd.bind(ModuleBundler), ModuleBundler.buildEs.bind(ModuleBundler)));

// build
Gulp.task('build', Gulp.series('bundle:rollup'));

// test
Gulp.task('test:clean', Tester.cleanTestReports.bind(Tester));
Gulp.task('test', Gulp.series('test:clean', Tester.execMocha.bind(Tester)));
Gulp.task('test:watch', Gulp.series('test:clean', Tester.watchMocha.bind(Tester)));
Gulp.task('test:coverage', Gulp.series('test:clean', Tester.execNyc.bind(Tester)));

// code static analysis
Gulp.task('lint:ts', Linter.checkTs.bind(Linter));
Gulp.task('lint', Gulp.parallel('lint:ts'));

// API reference docs
Gulp.task('api:ts:clean', ApiDocMaker.cleanTypedoc.bind(ApiDocMaker));
Gulp.task('api:ts', Gulp.series('api:ts:clean', ApiDocMaker.buildTypedoc.bind(ApiDocMaker)));
Gulp.task('api', Gulp.parallel('api:ts'));

// document
Gulp.task('doc:clean', DocumentHelper.clean.bind(DocumentHelper));
Gulp.task('doc', Gulp.series('doc:clean', DocumentHelper.collectFiles.bind(DocumentHelper)));

// update version field in package.json and config/sonar.properties
Gulp.task('version', Publisher.version.bind(Publisher));

// prepare to deploy/publish
Gulp.task('deploy:clean', Publisher.clean.bind(Publisher));
Gulp.task('deploy:prepare', Gulp.series('deploy:clean', Publisher.prepare.bind(Publisher)));
Gulp.task('deploy', Gulp.series('build', 'api:ts', 'deploy:prepare'));

// Default task
Gulp.task('default', Gulp.series('build'));
