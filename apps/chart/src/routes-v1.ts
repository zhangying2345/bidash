/**
 * Define API v1 routes
 */
// import * as Fs from 'fs';
import * as Path from 'path';

import * as SwaggerParser from 'swagger-parser';
import * as Yaml from 'js-yaml';

import { RoutesBase, ApiHandler } from '@bf/js-api-common';

import { iocContainer, IocSymbols } from './ioc';

// import { FileService } from './file';
import { HistoryService } from './history';
// import { MetadataService } from './metadata';
// import { PageService } from './page';

export class RoutesV1 extends RoutesBase {
  constructor(router, apiPrefix, cwd) {
    super(router, apiPrefix, '/v1', cwd);

    this.swaggerParser = new SwaggerParser();

    // this.fileService = iocContainer.get<FileService>(IocSymbols.FileService);
    // this.metadataService = iocContainer.get<MetadataService>(IocSymbols.MetadataService);
    // this.pageService = iocContainer.get<PageService>(IocSymbols.PageService);
    this.historyService = iocContainer.get<HistoryService>(IocSymbols.HistoryService);

  }

  // The public standard API to be used by http server
  get apiHandlers() {
    const handlers: ApiHandler[] = [
      // api spec
      { method: 'get', url: `${this.apiPrefix}`, handlers: [ this.onGetApiSpec.bind(this) ] },

      // History APIs
      { method: 'get', url: `${this.apiPrefix}/test`, handlers: this.historyService.testFun },
    ];

    return handlers;
  }

  private onGetApiSpec(req, rsp) {
    const apiSpecPath = Path.join(this.cwd, '../api-specs/dashboard-chart/api-v1.yml');
    // const specConent = Fs.readFileSync(apiSpecPath, 'utf8');

    const option = {

    }
    this.swaggerParser.bundle(apiSpecPath, option)
      .then((schema) => {
        rsp.setHeader('Content-Type', 'application/json');
        const yamlString = Yaml.safeDump(schema);
        rsp.send(yamlString);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  private swaggerParser;

  // private fileService;
  // private metadataService;
  // private pageService;
  private kafkaClientService;
  private deviceService;
  private historyService;

}

