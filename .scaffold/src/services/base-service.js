/**
 * Base service class
 */
'use strict';

const { Symbols } = require('../ioc/symbols');

class BaseService {
  constructor(injector) {
    this.injector = injector;

    this.cwd = process.cwd();
  }

  // give a chance to get depend services
  resolveDependencies() {
    if (!this.injector) { return; }

    this.cliParser = this.injector.get(Symbols.CliParser);
    this.loger = this.injector.get(Symbols.Loger);
    this.utils = this.injector.get(Symbols.Utils);
    this.projectConfig = this.injector.get(Symbols.ProjectConfig);
  }

  // give a change to do initialize
  initialize() {
  }
}

module.exports = BaseService;
