/**
 * Gulp 4.x tasks
 */
'use strict';

const Gulp = require('gulp');

const {
  Loger,
  BaseBuild,
  TscBuild,
  BaseDevServe,
  NodeDevServe,
  BasePublish,
  DockerPublish,
  BaseLint,
  TsLint,
  BaseUnitTest,
  TsUnitTest,
  Utils
} = require('./.scaffold');

//// clean
Gulp.task('clean:dist', () => {
  return Utils.cleanPatterns(['dist/**/*']);
});
// default clean
Gulp.task('clean', Gulp.series('clean:dist'));

//// build
Gulp.task('build:copy:clean', BaseBuild.cleanCopies.bind(BaseBuild));
Gulp.task('build:copy', BaseBuild.copy.bind(BaseBuild));
Gulp.task('build:watch', Gulp.series('build:copy', BaseBuild.watchBundleCopies.bind(BaseBuild)));
// Use tsc
Gulp.task('build:tsc:clean', TscBuild.clean.bind(TscBuild));
Gulp.task('build:tsc:before', Gulp.series(TscBuild.before.bind(TscBuild)));
Gulp.task('build:tsc:after', TscBuild.after.bind(TscBuild));
Gulp.task('build:tsc', Gulp.series(
  'build:copy',
  'build:tsc:before',
  TscBuild.start.bind(TscBuild),
  'build:tsc:after'
));
// default build
Gulp.task('build:clean', Gulp.parallel('build:copy:clean', 'build:tsc:clean'));
Gulp.task('build', Gulp.series('build:clean', 'build:tsc'));

//// local development
Gulp.task('dev:node:before', NodeDevServe.before.bind(NodeDevServe));
const devNodeTask = Gulp.series('build', 'dev:node:before', NodeDevServe.start.bind(NodeDevServe));
Gulp.task('dev:node:watch', NodeDevServe.watch.bind(NodeDevServe, devNodeTask));
// default dev
Gulp.task('dev', Gulp.series(devNodeTask, 'dev:node:watch'));

//// lint
Gulp.task('lint:ts:clean', Gulp.series(TsLint.after.bind(TsLint)));
Gulp.task('lint:ts:before', Gulp.series(TsLint.after.bind(TsLint)));
Gulp.task('lint:ts:after', Gulp.series(TsLint.after.bind(TsLint)));
Gulp.task('lint:ts', Gulp.series('lint:ts:before', TsLint.start.bind(TsLint), 'lint:ts:after'));

// default lint
Gulp.task('lint:clean', Gulp.series('lint:ts:clean'));
Gulp.task('lint', Gulp.series('lint:ts'));

//// test
Gulp.task('test:ts:clean', Gulp.series(TsUnitTest.clean.bind(TsUnitTest)));
Gulp.task('test:ts:before', Gulp.series(TsUnitTest.before.bind(TsUnitTest)));
Gulp.task('test:ts:after', Gulp.series(TsUnitTest.after.bind(TsUnitTest)));
Gulp.task('test:ts', Gulp.series('test:ts:before', TsUnitTest.start.bind(TsUnitTest), 'test:ts:after'));

// default lint
Gulp.task('test:clean', Gulp.series('test:ts:clean'));
Gulp.task('test', Gulp.series('test:ts'));

//// publish
Gulp.task('publish:base:before', Gulp.series(BasePublish.before.bind(BasePublish)));

Gulp.task('publish:docker:clean', Gulp.series(DockerPublish.clean.bind(DockerPublish)));
Gulp.task('publish:docker:before', Gulp.series(DockerPublish.before.bind(DockerPublish)));
Gulp.task('publish:docker:after', Gulp.series(DockerPublish.after.bind(DockerPublish)));
Gulp.task('publish:docker:test', Gulp.series(DockerPublish.start.bind(DockerPublish)));
Gulp.task('publish:docker', Gulp.series(
  'build',
  'publish:base:before',
  'publish:docker:before',
  DockerPublish.start.bind(DockerPublish),
  'publish:docker:after'
));
// default publish
Gulp.task('publish:clean', Gulp.parallel('build:copy:clean', 'publish:docker:clean'));
Gulp.task('publish:before', Gulp.series('publish:clean', 'build', 'publish:base:before', 'publish:docker:before'));
Gulp.task('publish:test', Gulp.series('publish:docker:test'));
Gulp.task('publish', Gulp.series('publish:clean', 'publish:docker'));

// update version field in package.json and config/sonar.properties
Gulp.task('version', BasePublish.version.bind(BasePublish));

//// default
Gulp.task('default', Gulp.series('dev'));
