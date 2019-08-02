/**
 * The Interface of Routes for different version of API
 */

import { RequestHandler } from 'express';

export interface ApiHandler {
  method: string;
  url: string;
  handlers: RequestHandler[];
}

export interface Routes {
  apiHandlers: ApiHandler[];
}

export class RoutesBase implements Routes {
  constructor(router, apiPrefix, apiVer, cwd, httpServer?) {
    this.router = router;
    this.apiPrefixBase = apiPrefix;
    this.apiPrefix = apiPrefix + apiVer;
    this.cwd = cwd;
    this.httpServer = httpServer;
  }

  apiHandlers;

  protected router;
  protected apiPrefix;
  protected apiPrefixBase;
  protected cwd;
  protected httpServer;
}
