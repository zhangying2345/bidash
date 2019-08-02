/**
 * IoC Class Symbols
 */

const Symbols = {
  BaseService: Symbol.for('BaseService'),
  CliParser: Symbol.for('CliParser'),
  Loger: Symbol.for('Loger'),
  ProjectConfig: Symbol.for('ProjectConfig'),
  Utils: Symbol.for('Utils'),
  BaseBuild: Symbol.for('BaseBuild'),
  TscBuild: Symbol.for('TscBuild'),
  BaseDevServe: Symbol.for('BaseDevServe'),
  NodeDevServe: Symbol.for('NodeDevServe'),
  BasePublish: Symbol.for('BasePublish'),
  WarPublish: Symbol.for('WarPublish'),
  DockerPublish: Symbol.for('DockerPublish'),
  TarPublish: Symbol.for('TarPublish'),
  BaseLint: Symbol.for('BaseLint'),
  TsLint: Symbol.for('TsLint'),
  BaseUnitTest: Symbol.for('BaseUnitTest'),
  TsUnitTest: Symbol.for('TsUnitTest'),

  // add more in below

  Injector: Symbol.for('Injector')
};

module.exports = {
  Symbols
};
