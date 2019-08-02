import { Container, interfaces } from 'inversify';
import { IocSymbols } from './symbols';

import {
  EnvironmentService, DatabaseService, CheckAuthService
} from '../services';

import { DeviceService } from '../device';
import { CliParser } from '@bf/js-api-common';
// import { MetadataService, MetadataServiceImpl } from '../metadata';
// import { FileService, FileServiceImpl } from '../file';
// import { PageService, PageServiceImpl } from '../page';
import { HistoryService } from '../history';
import { KafkaClientService } from '../kafka-client';

class IoCContainer {
  constructor() {
    const option = {
      defaultScope: 'Singleton' as interfaces.BindingScope,
      skipBaseClassChecks: true
    };
    this.container = new Container(option);
  }

  initialize() {
    this.container.bind<CliParser>(IocSymbols.CliParser).to(CliParser);
    this.container.bind<EnvironmentService>(IocSymbols.EnvironmentService).to(EnvironmentService);
    this.container.bind<DatabaseService>(IocSymbols.DatabaseService).to(DatabaseService);
    this.container.bind<CheckAuthService>(IocSymbols.CheckAuthService).to(CheckAuthService);
    this.container.bind<DeviceService>(IocSymbols.DeviceService).to(DeviceService);
    this.container.bind<HistoryService>(IocSymbols.HistoryService).to(HistoryService);
    this.container.bind<KafkaClientService>(IocSymbols.KafkaClientService).to(KafkaClientService);

    // this.container.bind<MetadataService>(IocSymbols.DeviceService).to(MetadataServiceImpl);
    // this.container.bind<FileService>(IocSymbols.DeviceService).to(FileServiceImpl);
    // this.container.bind<PageService>(IocSymbols.DeviceService).to(PageServiceImpl);
}
get<TService>(symbol: symbol) {
  return this.container.get<TService>(symbol) as TService;
}

protected container: Container;
}
const iocContainer = new IoCContainer();
iocContainer.initialize();

export { iocContainer };
