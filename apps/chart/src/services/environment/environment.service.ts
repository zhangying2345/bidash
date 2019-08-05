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

    console.log('zhangying',JSON.stringify(this.config));
    console.log('EnvironmentService Cnt.');
  }

  //#region override Configuration APIs
  get httpServerConfig() { return this.config.express; }
  get mongoDBsConfig() { return this.config.mongoDBs; }

  //#endregion
}
