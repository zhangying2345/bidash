/**
 * Here implements the Http Server supply
 *
 * [More descriptions for this component in multiple line]
 *
 * @flow
 */

import * as Http from 'http';
// import * as Https from 'https';
import * as Express from 'express';
import * as BodyParser from 'body-parser';
// import * as Cors from 'cors';
import * as Loger from 'morgan';
import * as Multer from 'multer';
// import * as Fs from 'fs';
import * as Path from 'path';

// gzip
import * as Compression from 'compression';

// X-Express-Time
import * as ResponseTime from 'response-time';

import 'reflect-metadata';

// module-alias
require(`module-alias/${'register'}`);

import { EnvironmentService, DatabaseService } from './services';

import { iocContainer, IocSymbols } from './ioc';

import { ApiHandler } from '@bf/js-api-common';

import { RoutesV1 } from './routes-v1';

class Server {
  constructor() {
    this.envService = iocContainer.get<EnvironmentService>(IocSymbols.EnvironmentService);

    this.cwd = this.envService.config.cwd;
    console.log('this.cwd: ' + this.cwd);

    this.httpServerConfig = this.envService.httpServerConfig;

    // trigger DatabaseService constructor
    iocContainer.get<DatabaseService>(IocSymbols.DatabaseService);

    this.app = Express();
    this.router = Express.Router();

    this.setApp();
    this.setRoutes();
  }

  // start the server
  run() {
    const server = Http.createServer(this.app);
    server.listen(this.httpServerConfig.port, () => {
      console.log('Express server listening on port ' + this.httpServerConfig.port);
    });
  }

  //# private memebers
  private onRouterRoot(req, rsp, next) {
    // console.log('onRouterRoot. Method: ' + req.method);

    //console.log('HEADERS: ' + JSON.stringify(req.headers, null, 2));

    if (req.method === 'OPTIONS') {
      // rsp.header('Access-Control-Allow-Origin', '*'); // implement CORS
      rsp.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
      rsp.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

      rsp.sendStatus(200);
    } else {
      next();
    }
  }

  private onGetRoot(req, rsp) {
    // console.log('router.get /');
    // rsp.header('Access-Control-Allow-Origin', '*'); // implement CORS

    console.log(`http version: ${req.httpVersion}`);
    // console.log('http request headers: ' + JSON.stringify(req.headers, null, 2));

    rsp.send(
      '<h2>Welcome to BF API Dashboard Server</h2><br/>' +
      'Please access /api to check APIs in swagger UI'
    );
  }

  private setApp() {
    // for parsing application/json
    this.app.use(BodyParser.json({ limit: '5mb' }));
    // for parsing application/x-www-form-urlencoded
    this.app.use(BodyParser.urlencoded({ extended: true, limit: '5mb' }));

    // Loger middleware
    this.app.use(Loger('dev'));

    // this.app.use(Cors());

    // multer middleware
    this.app.use(Multer({ dest: 'uploads/' }).array('images'));

    // X-Response-Time
    // this.app.use(ResponseTime(6));

    // gzip compression
    this.app.use(Compression());

    // error handler
    // this.app.use(ErrorHandler.handler404);
    // this.app.use(ErrorHandler.prodErrorHandler);

    // we must put this line in last, after using express middlewares, like body-parser
    this.app.use('/', this.router);
  }

  private setRoutes() {
    // To handle CORS, in modern browser, they will send 'OPTIONS' firstly
    this.router.use(this.onRouterRoot.bind(this));
    // show response when client request the root path
    this.router.get('/', this.onGetRoot.bind(this));

    // test it is alive
    this.router.get(`${this.apiPrefix}/ping`, (req, rsp) => {
      rsp.send('I am alive');
    });

    // return swagger-ui portal
    const swaggerUrl = Path.join(this.cwd, '../swagger-ui');
    this.router.use(`${this.apiPrefix}`, Express.static(swaggerUrl));

    // APIs
    const apis = [
      new RoutesV1(this.router, this.apiPrefix, this.cwd).apiHandlers, // API v1 routes
      // new RoutesV2(this.router, this.apiPrefix, this.cwd).apiHandlers, // API v2 routes
      // append more in below
    ];
    apis.forEach((item) => {
      this.loadRouters(item);
    });
  }

  private loadRouters(apiHandlers: ApiHandler[]) {
    apiHandlers.forEach((item) => {
      try {
        let path = item.url;
        // if first letter isn't '/', add it
        if (path[0] !== '/') {
          path = '/' + path;
        }
        switch (item.method.toLowerCase()) {
          case 'use':
            this.router.use(path, item.handlers);
          case 'post':
            this.router.post(path, item.handlers);
            break;
          case 'delete':
            this.router.delete(path, item.handlers);
            break;
          case 'put':
            this.router.put(path, item.handlers);
            break;
          case 'get':
          default:
            this.router.get(path, item.handlers);
            break;
        }
      } catch (err) {
        console.error(err.message);
      }
    });
  }

  private app: Express.Application;
  private router: Express.Router;
  private cwd: string;
  private apiPrefix: string = '/api';
  private envService;
  private httpServerConfig;
  // private dbService;
  //#endregion
}

// start server
new Server().run();
