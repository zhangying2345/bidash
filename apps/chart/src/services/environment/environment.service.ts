/**
 * Configuration Service
 *
 * Loading external config file, and supply interface to access config dataPoints
 */
import { injectable, inject } from 'inversify';

import { IocSymbols } from '../../ioc';

import { BaseEnvironmentService, CliParser } from '@bf/js-api-common';

@injectable()
export class EnvironmentService extends BaseEnvironmentService {
  constructor(
    @inject(IocSymbols.CliParser) cliParser: CliParser
  ) {
    super(cliParser);

    console.log(JSON.stringify(this.config, null, 2));
    console.log('EnvironmentService Cnt.');
  }

  //#region override Configuration APIs
  get httpServerConfig() { return this.config.express; }
  get databaseConfig() { return this.config.mongoDB; }
  get mongoDBsConfig() { return this.config.mongoDBs; }

  get uaaConfig() { return this.config.uaa; }
  get brokerConfig() { return this.config.kafka; }
  //#endregion
}
