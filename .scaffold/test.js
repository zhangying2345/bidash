/**
 * Define modules
 */
'use strict';

const {
  // services
  CliParser,
  Loger,
  ProjectConfig,

  // injector
  injector,
  Symbols
} = require('./index');

Loger.log('hello');
Loger.logV('hello level 2');
Loger.logVV('hello level 3');

Loger.log(ProjectConfig.packageName);
Loger.log(ProjectConfig.packageVersion);
Loger.log(ProjectConfig.scaffoldDir);
Loger.log(ProjectConfig.rootConfigDir);
Loger.log(ProjectConfig.configDir);
Loger.log(ProjectConfig.srcDir);
Loger.log(ProjectConfig.libDir);
Loger.log(ProjectConfig.mockDir);
Loger.log(ProjectConfig.distDir);
Loger.log(ProjectConfig.publishDistDir);
Loger.log(ProjectConfig.bundleDistDir);
Loger.log(ProjectConfig.reportDistDir);
Loger.log(ProjectConfig.apiDocDistDir);
Loger.log(ProjectConfig.documentDistDir);
