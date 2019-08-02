/**
 * Scaffold Entry
 */
'use strict';

const {
  CliArgs,
  log,
  isDefaultArg,
  hasArg
} = require('./helper');

log('CWD: ' + process.cwd());
log('CLI arguments: ' + JSON.stringify(CliArgs));

// ProjectConfig must be called firstly, it generate ./config/project-config.json which is required by others
const ProjectConfigClass = require('./src/project-config.js');
const ProjectConfig = new ProjectConfigClass().config;

const ConstsClass = require('./src/consts.js');
const Consts = new ConstsClass(ProjectConfig);

const ApiDocMakerClass = require('./src/api-doc-maker.js');
const ApiDocMaker = new ApiDocMakerClass(ProjectConfig, CliArgs, Consts);

const DocumentHelperClass = require('./src/document-helper.js');
const DocumentHelper = new DocumentHelperClass(ProjectConfig, CliArgs, Consts);

const LinterClass = require('./src/linter.js');
const Linter = new LinterClass(ProjectConfig, CliArgs, Consts);

const ModuleBundlerClass = require('./src/module-bundler.js');
const ModuleBundler = new ModuleBundlerClass(ProjectConfig, CliArgs, Consts);

const PublisherClass = require('./src/publisher.js');
const Publisher = new PublisherClass(ProjectConfig, ModuleBundler, CliArgs, Consts, null, null, ApiDocMaker, null);

const TesterClass = require('./src/tester.js');
const Tester = new TesterClass(CliArgs, Consts);

const TranspilerClass = require('./src/transpiler.js');
const Transpiler = new TranspilerClass(CliArgs);

// exports
module.exports = {
  ApiDocMaker,
  DocumentHelper,
  Linter,
  ProjectConfig,
  Publisher,
  ModuleBundler,
  Tester,
  Transpiler
};
