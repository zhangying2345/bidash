/**
 * Define the consts used in gulpfile.js
 */
'use strict';

const Path = require('path');

const NpmPackageConfig = require('../../package.json');

class Const {
  constructor(projectConfig) {
    this.projectConfig = projectConfig;
  }

  get npmPackageName() { return NpmPackageConfig.name; }
  get npmPackageVersion() { return NpmPackageConfig.version; }

  get scaffoldDir() { return Path.join(process.cwd(), './.scaffold'); }
  get projectConfigDir() { return Path.join(process.cwd(), './config'); }

  get srcDir() { return Path.join(process.cwd(), this.projectConfig.folders.srcDir); }
  get styleDir() { return Path.join(process.cwd(), this.projectConfig.folders.styleDir); }
  get libDir() { return Path.join(process.cwd(), this.projectConfig.folders.libDir); }
  get mockDir() { return Path.join(process.cwd(), this.projectConfig.folders.mockDir); }

  get distDir() { return Path.join(process.cwd(), this.projectConfig.folders.distDir); }
  get deployDistDir() { return Path.join(process.cwd(), this.projectConfig.folders.deployDistDir); }
  get bundleDistDir() { return Path.join(process.cwd(), this.projectConfig.folders.bundleDistDir); }
  get reportDistDir() { return Path.join(process.cwd(), this.projectConfig.folders.reportDistDir); }
  get apiDocDistDir() { return Path.join(process.cwd(), this.projectConfig.folders.apiDocDistDir); }
  get documentDistDir() { return Path.join(process.cwd(), this.projectConfig.folders.documentDistDir); }

  // port names used to store avaiable ports
  get portNames() {
    return {
      devServerPort: 'webpackDevServerPort',
      httpServerPort: 'httpServerPort',
      socketServerPort: 'socketServerPort'
    };
  }

  // Other Const for convenient
  get deployFilesDir() { return `${this.scaffoldDir}/deploy`; }

}

module.exports = Const;
