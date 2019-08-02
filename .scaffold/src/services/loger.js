/**
 * Loger service
 */
'use strict';

const BaseService = require('./base-service');

class Loger extends BaseService {
  constructor(injector) {
    super(injector);

    // console.log('Loger Cnt.');
  }

  // only get other service, dont call any method from them
  resolveDependencies() {
    super.resolveDependencies();
  }

  // do initial tasks
  initialize() {
    super.initialize();

    if (!this.cliParser) { return; }

    if (this.cliParser.get('VV')) {
      this.cliParser.set('V', true);
    }

    if (this.cliParser.get('VVV')) {
      this.cliParser.set('V', true);
      this.cliParser.set('VV', true);
    }
  }

  // level 1, -V or --verbose
  log(message){
    if (!this.cliParser) { return; }
    if (!(this.cliParser.get('verbose') || this.cliParser.get('V'))) { return;}

    console.log(message);
  }

  // level 2, -VV
  logV(message){
    if (!this.cliParser) { return; }
    if (!this.cliParser.get('VV')) { return;}

    console.log(message);
  }

  // level 3, -VVV
  logVV(message){
    if (!this.cliParser) { return; }
    if (!this.cliParser.get('VVV')) { return;}

    console.log(message);
  }
}

module.exports = Loger;
