/**
 * Define the docker image publish service
 */
'use strict';

const Path = require('path');
const Fs = require('fs');

const Gulp = require('gulp');
const Replace = require('gulp-replace');
const Rename = require('gulp-rename');

const Stream2 = require('merge2');
const CrossSpawn = require('cross-spawn');
const Del = require('del');

const BasePublisher = require('./base');

class DockerPublish extends BasePublisher {
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

    this.childProcess = null;
  }

  clean(doneFn) {
    doneFn && doneFn();
  }

  before(doneFn) {
    // handle Dockerfile
    const stream2 = Stream2();
    const cliDockerRegistry = this.cliParser.hasStringArg('dockerRegistry');
    const dockerRegistry = cliDockerRegistry ? `${cliDockerRegistry}/` : ''; // default is from official docker registry
    this.loger.log(`Docker registry: ${(dockerRegistry ? cliDockerRegistry : 'docker official')}`);

    const cliDockerFile = this.cliParser.hasStringArg('dockerFile');
    const dockerFile = cliDockerFile ? cliDockerFile : `${this.prepareDir}/Dockerfile`;

    const cliPkgProxy = this.cliParser.hasStringArg('pkgProxy');
    const pkgProxy = cliPkgProxy ? cliPkgProxy : '';

    const cliApkMirror = this.cliParser.hasStringArg('apkMirror');
    const apkMirror = cliApkMirror ? cliApkMirror : 'dl-cdn.alpinelinux.org';

    let stream = Gulp.src(dockerFile)
      .pipe(Replace(/FROM ([a-zA-Z].*)/, `FROM ${dockerRegistry}$1`))
      .pipe(Replace(/ARG http_proxy=(['a-zA-Z].*)/, `ARG http_proxy='${pkgProxy}'`))
      .pipe(Replace(/ARG https_proxy=(['a-zA-Z].*)/, `ARG https_proxy='${pkgProxy}'`))
      .pipe(Replace(/ENV http_proxy (['a-zA-Z].*)/, `ENV http_proxy '${pkgProxy}'`))
      .pipe(Replace(/ENV https_proxy (['a-zA-Z].*)/, `ENV https_proxy '${pkgProxy}'`))
      .pipe(Replace(/'(s\/.*\/)([.a-zA-Z].*)\/g'/, `'$1${apkMirror}/g'`))
      .pipe(Gulp.dest(this.prepareDir));
    stream2.add(stream);
    // this.loger.logV('copy files: ' + JSON.stringify(dockerFile, null, 2) + ' to ' + this.prepareDir);

    // handle npmrc
    const cliNpmProxy = this.cliParser.hasStringArg('npmProxy');
    if (cliNpmProxy) {
      Fs.appendFileSync(`${this.prepareDir}/npmrc`, `\nproxy=${cliNpmProxy}`, 'utf8');
    }
    stream = Gulp.src(`${this.prepareDir}/npmrc`)
      .pipe(Rename('.npmrc'))
      .pipe(Gulp.dest(this.prepareDir));
    stream2.add(stream);
    // clean old
    // stream = this.utils.cleanDir(`${this.prepareDir}/npmrc`);
    // stream2.add(stream);

    return stream2;
  }

  after(doneFn) {
    // doneFn && doneFn();
    return this.utils.cleanDir(`${this.prepareDir}/npmrc`);
  }

  start(doneFn) {
    const cliDockerImage = this.cliParser.hasStringArg('dockerImage');
    const dockerImage =  cliDockerImage ? cliDockerImage : `${this.projectConfig.packageName}:latest`;
    this.loger.log(`Docker image: ${dockerImage}`);

    const outOption = this.cliParser.hasBoolArg('V') ? process.stdout : 'ignore';
    CrossSpawn.sync('docker', ['build', '-t', `${dockerImage}`, '.'], {
      cwd: `${this.prepareDir}`,
      stdio: ['ignore', outOption, process.stderr]
    });

    doneFn && doneFn();
  }
}

module.exports = DockerPublish;
