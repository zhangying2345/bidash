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
import { KafkaClientService } from './kafka-client';
import { DeviceService } from './device';

export class RoutesV1 extends RoutesBase {
  constructor(router, apiPrefix, cwd) {
    super(router, apiPrefix, '/v1', cwd);

    this.swaggerParser = new SwaggerParser();

    // this.fileService = iocContainer.get<FileService>(IocSymbols.FileService);
    // this.metadataService = iocContainer.get<MetadataService>(IocSymbols.MetadataService);
    // this.pageService = iocContainer.get<PageService>(IocSymbols.PageService);
    this.kafkaClientService = iocContainer.get<KafkaClientService>(IocSymbols.KafkaClientService);
    this.deviceService = iocContainer.get<DeviceService>(IocSymbols.DeviceService);
    this.historyService = iocContainer.get<HistoryService>(IocSymbols.HistoryService);

  }

  // The public standard API to be used by http server
  get apiHandlers() {
    const handlers: ApiHandler[] = [
      // api spec
      { method: 'get', url: `${this.apiPrefix}`, handlers: [ this.onGetApiSpec.bind(this) ] },

      // File APIs
      // { method: 'post', url: `${this.apiPrefix}/file/upload`, handlers: this.fileService.insertFileHandlers },
      // { method: 'get', url: `${this.apiPrefix}/file/:filename`, handlers: this.fileService.getFileByMD5Handlers },
      // { method: 'delete', url: `${this.apiPrefix}/file`, handlers: this.fileService.deleteFileHandlers },

      // History APIs
      // { method: 'post', url: `${this.apiPrefix}/history`, handlers: this.historyService.insertHandlers },
      // { method: 'post', url: `${this.apiPrefix}/history/remove`, handlers: this.historyService.removeDataHandlers },
      { method: 'get', url: `${this.apiPrefix}/history/query`, handlers: this.historyService.getByQueryHandlers },
      { method: 'get', url: `${this.apiPrefix}/history/queryByPeriod`, handlers: this.historyService.getByPeriodQueryHandlers },
      // { method: 'get', url: `${this.apiPrefix}/history/tableList`, handlers: this.historyService.getTableListHandlers },
      // { method: 'get', url: `${this.apiPrefix}/history/scps/line`, handlers: this.historyService.getScpsLineHandlers },
      // { method: 'get', url: `${this.apiPrefix}/history/scps/lineBasedHour`, handlers: this.historyService.getScpsLineBasedHourHandlers },
      // { method: 'get', url: `${this.apiPrefix}/history/scps/table`, handlers: this.historyService.getScpsTableHandlers },

      // Metadata APIs
      // { method: 'post', url: `${this.apiPrefix}/metadata`, handlers: this.metadataService.insertHandlers },
      // { method: 'post', url: `${this.apiPrefix}/metadata/update`, handlers: this.metadataService.updateHandlers },
      // { method: 'get', url: `${this.apiPrefix}/metadata/query`, handlers: this.metadataService.getByQueryHandlers },

      // Page APIs
      // { method: 'post', url: `${this.apiPrefix}/page`, handlers: this.pageService.insertHandlers },
      // { method: 'post', url: `${this.apiPrefix}/page/remove`, handlers: this.pageService.removePageHandlers },
      // { method: 'get', url: `${this.apiPrefix}/page/list`, handlers: this.pageService.getByQueryHandlers },
      // { method: 'post', url: `${this.apiPrefix}/page/upload/image`, handlers: this.pageService.uploadImageHandlers },
      // { method: 'post', url: `${this.apiPrefix}/page/insertOrUpdateCategory`, handlers: this.pageService.insertCategoryHandlers },
      // { method: 'get', url: `${this.apiPrefix}/page/listCategory`, handlers: this.pageService.listCategoryHandlers },
      // { method: 'get', url: `${this.apiPrefix}/page/listCategoryByScope`, handlers: this.pageService.listCategoryByScopeHandlers },
      // { method: 'post', url: `${this.apiPrefix}/page/deleteCategory`, handlers: this.pageService.removeCategoryHandlers },
      // { method: 'post', url: `${this.apiPrefix}/page/insertPage`, handlers: this.pageService.insertPageHandlers },
      // { method: 'get', url: `${this.apiPrefix}/page/listPage`, handlers: this.pageService.listPageHandlers },

      // kafka client APIs
      { method: 'get', url: `${this.apiPrefix}/topics`, handlers: this.kafkaClientService.getTopicsHandlers },

      //device APIS
      { method: 'get', url: `${this.apiPrefix}/device`, handlers: this.deviceService.getDeviceConfigHandlers },

      // data source APIs
      { method: 'get', url: `${this.apiPrefix}/dataTypes`, handlers: this.deviceService.getDataTypesHandlers },
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

