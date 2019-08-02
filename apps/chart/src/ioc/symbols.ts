/**
 * IoC Symbols
 */

export const IocSymbols = {
  CliParser: Symbol('CliParser'),
  EnvironmentService: Symbol('EnvironmentService'),
  DatabaseService: Symbol('DatabaseService'),

  CheckAuthService: Symbol('CheckAuthService'),
  DeviceService: Symbol('DeviceService'),
  HistoryService: Symbol('HistoryService'),
  KafkaClientService: Symbol('KafkaClientService')

  // MetadataService: Symbol('MetadataService'),
  // FileService: Symbol('FileService'),
  // PageService: Symbol('PageService'),
};
