/**
 * IoC Container
 */
'use strict';

require('reflect-metadata');

const Inversify = require('inversify');

const { Symbols } = require('./symbols');

// classes
const BaseService = require('../services/base-service');
const CliParser = require('../services/cli-parser');
const Loger = require('../services/loger');
const ProjectConfig = require('../services/project-config');
const Utils = require('../services/utils');
const BaseBuild = require('../bundle/base');
const TscBuild = require('../bundle/tsc');
const BaseDevServe = require('../dev-serve/base');
const NodeDevServe = require('../dev-serve/node');
const BasePublish = require('../publish/base');
const DockerPublish = require('../publish/docker');
const TarPublish = require('../publish/tar');
const WarPublish = require('../publish/war');
const BaseLint = require('../lint/base');
const TsLint = require('../lint/tslint');
const BaseUnitTest = require('../test/base');
const TsUnitTest = require('../test/ts');
// add more in below

/**
 * Declare as injectable, like:
 *  @injectable()
 *  export class Class {}
 * in Typescript
 */
Inversify.decorate(Inversify.injectable(), BaseService);
Inversify.decorate(Inversify.injectable(), CliParser);
Inversify.decorate(Inversify.injectable(), Loger);
Inversify.decorate(Inversify.injectable(), ProjectConfig);
Inversify.decorate(Inversify.injectable(), Utils);
Inversify.decorate(Inversify.injectable(), BaseBuild);
Inversify.decorate(Inversify.injectable(), TscBuild);
Inversify.decorate(Inversify.injectable(), BaseDevServe);
Inversify.decorate(Inversify.injectable(), NodeDevServe);
Inversify.decorate(Inversify.injectable(), BasePublish);
Inversify.decorate(Inversify.injectable(), DockerPublish);
Inversify.decorate(Inversify.injectable(), TarPublish);
Inversify.decorate(Inversify.injectable(), WarPublish);
Inversify.decorate(Inversify.injectable(), BaseLint);
Inversify.decorate(Inversify.injectable(), TsLint);
Inversify.decorate(Inversify.injectable(), BaseUnitTest);
Inversify.decorate(Inversify.injectable(), TsUnitTest);

// add more in below

/**
 * Delcare Inject, like
 *  @injectable()
 *  export class Class {
 *    constructor(
 *      @inject(Symbols.Injector) private injector,
 *    )
 *  }
 */
Inversify.decorate(Inversify.inject(Symbols.Injector), BaseService, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), CliParser, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), Loger, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), ProjectConfig, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), Utils, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), BaseBuild, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), TscBuild, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), BaseDevServe, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), NodeDevServe, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), BasePublish, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), DockerPublish, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), TarPublish, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), WarPublish, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), BaseLint, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), TsLint, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), BaseUnitTest, 0);
Inversify.decorate(Inversify.inject(Symbols.Injector), TsUnitTest, 0);

// add more in below

// Declare bindings
// Ioc Container
const option = {
  defaultScope: 'Singleton'
};
const container = new Inversify.Container(option);
// create class instance and bind to symbol
container.bind(Symbols.Injector).toConstantValue(container);
container.bind(Symbols.BaseService).to(BaseService);
container.bind(Symbols.CliParser).to(CliParser);
container.bind(Symbols.Loger).to(Loger);
container.bind(Symbols.ProjectConfig).to(ProjectConfig);
container.bind(Symbols.Utils).to(Utils);
container.bind(Symbols.BaseBuild).to(BaseBuild);
container.bind(Symbols.TscBuild).to(TscBuild);
container.bind(Symbols.BaseDevServe).to(BaseDevServe);
container.bind(Symbols.NodeDevServe).to(NodeDevServe);
container.bind(Symbols.BasePublish).to(BasePublish);
container.bind(Symbols.DockerPublish).to(DockerPublish);
container.bind(Symbols.TarPublish).to(TarPublish);
container.bind(Symbols.WarPublish).to(WarPublish);
container.bind(Symbols.BaseLint).to(BaseLint);
container.bind(Symbols.TsLint).to(TsLint);
container.bind(Symbols.BaseUnitTest).to(BaseUnitTest);
container.bind(Symbols.TsUnitTest).to(TsUnitTest);

// add more in below

// IoC container as an injector
module.exports = {
  injector: container
};
