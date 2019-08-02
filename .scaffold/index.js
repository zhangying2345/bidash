/**
 * Define modules
 */
'use strict';

const { injector } = require('./src/ioc/container');
const { Symbols } = require('./src/ioc/symbols');

const services = {
  Loger: injector.get(Symbols.Loger),
  ProjectConfig: injector.get(Symbols.ProjectConfig), // must before CliParser
  CliParser: injector.get(Symbols.CliParser),
  Utils: injector.get(Symbols.Utils),
  BaseBuild: injector.get(Symbols.BaseBuild),
  TscBuild: injector.get(Symbols.TscBuild),
  BaseDevServe: injector.get(Symbols.BaseDevServe),
  NodeDevServe: injector.get(Symbols.NodeDevServe),
  BasePublish: injector.get(Symbols.BasePublish),
  DockerPublish: injector.get(Symbols.DockerPublish),
  TarPublish: injector.get(Symbols.TarPublish),
  WarPublish: injector.get(Symbols.WarPublish),
  BaseLint: injector.get(Symbols.BaseLint),
  TsLint: injector.get(Symbols.TsLint),
  BaseUnitTest: injector.get(Symbols.BaseUnitTest),
  TsUnitTest: injector.get(Symbols.TsUnitTest)

}

// init services, to solve circular dependency
Object.keys(services).forEach((name) => services[name].resolveDependencies());
// init servcies, to execute initial tasks
Object.keys(services).forEach((name) => services[name].initialize());

module.exports = {
  // service instances
  CliParser: services.CliParser,
  Loger: services.Loger,
  ProjectConfig: services.ProjectConfig,
  Utils: services.Utils,
  BaseBuild: services.BaseBuild,
  TscBuild: services.TscBuild,
  BaseDevServe: services.BaseDevServe,
  NodeDevServe: services.NodeDevServe,
  BasePublish: services.BasePublish,
  DockerPublish: services.DockerPublish,
  TarPublish: services.TarPublish,
  WarPublish: services.WarPublish,
  BaseLint: services.BaseLint,
  TsLint: services.TsLint,
  BaseUnitTest: services.BaseUnitTest,
  TsUnitTest: services.TsUnitTest,

  // IoC container and service indentifiers
  injector,
  Symbols
};
