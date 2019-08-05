import { Container, interfaces } from 'inversify';
import { IocSymbols } from './symbols';

import {
  EnvironmentService, DatabaseService,
} from '../services';

import { CliParser } from '@bf/js-api-common';
import { HistoryService } from '../history';

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
    this.container.bind<HistoryService>(IocSymbols.HistoryService).to(HistoryService);
}
get<TService>(symbol: symbol) {
  return this.container.get<TService>(symbol) as TService;
}

protected container: Container;
}
const iocContainer = new IoCContainer();
iocContainer.initialize();

export { iocContainer };
