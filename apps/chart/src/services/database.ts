/**
 * Database Service
 */

import { EventEmitter } from 'events';

import { Observable } from 'rxjs';
// import { Subscription } from 'rxjs/Subscription';
// import { of as RxOf } from 'rxjs/observable/of';
// import { timer as RxTimer } from 'rxjs/observable/timer';
// import { combineLatest as RxCombineLatest } from 'rxjs/observable/combineLatest';
// import { forkJoin as RxForkJoin } from 'rxjs/observable/forkJoin';

// import { ErrorObservable as RxError } from 'rxjs/observable/ErrorObservable';
// import { _throw as RxThrow } from 'rxjs/observable/throw';

// import {
//   map as RxMap, switchMap as RxSwitchMap, filter as RxFilter,
//   retry as RxRetry, retryWhen as RxRetryWhen, repeat as RxRepeat,
//   combineLatest as RxCombineLatestOp,
//   concat as RxConcatOp, concatAll as RxConcatAll,
//   take as RxTake, tap as RxTap, delay as RxDelay, delayWhen as RxDelayWhen,
//   catchError as RxCatchError
// } from 'rxjs/operators';

import { MongoClient, Db as MongoDb, Collection as MongoCollection } from 'mongodb';

// remove Mongosse in future
import * as Mongoose from 'mongoose';
import * as Grid from 'gridfs-stream';

import { injectable, inject } from 'inversify';

// import { IocSymbols } from './inversify/types';
import { IocSymbols } from '../ioc';
import { EnvironmentService } from './environment/environment.service';

interface MongoDBItem {
  name: string;
  // connection: MongoDb;
  collections?: string[];
}

interface MongoClientItem {
  name: string;
  url: string;
  dbs: MongoDBItem[];
}

@injectable()
export class DatabaseService {
  constructor( @inject(IocSymbols.EnvironmentService) envService: EnvironmentService ) {

    console.log('DatabaseService Cnt.');
    this.envService = envService;
    // this.dbConfig = this.envService.databaseConfig;

    this.initialize();
  }

  initialize() {
    const clients = this.envService.mongoDBsConfig as MongoClientItem[];
    clients.forEach((item) => this.connectAsync(item));

    // deprecated in future in below
    const mongoConnectUrl = `${clients[0].url}/${clients[0].dbs[0].name}`;
    Mongoose.connect(mongoConnectUrl);
    // console.log(this.dbConfig.dashboard.url);

    this.connection = Mongoose.connection;
    this.connection.on('error', this.onDbConnectError.bind(this));
    this.connection.once('open', this.onDbOpen.bind(this));
    this.connection.on('disconnected', this.onDbDisconnected.bind(this));
  }

  getDbCollection$(db: MongoDb, collectionName: string, dbName?: string) {
    if (!db) { return; }

    const observable = Observable.create((observer) => {
      db.collection(collectionName, (error, collection: MongoCollection) => {
        if (error) {
          observer.error(error);
          return;
        }
        const dbCollection = collection;
        console.log(`Database, ${dbName} -> ${collectionName}, connected`);

        observer.next(dbCollection);
      });
    });

    return observable;
  }

  get gfs() { return this._gfs; }
  // get db() { return this.connection.db; }

  connectedEvent = new EventEmitter();
  //#endregion

  //#region private members
  private onDbConnectError(err) {
    console.error('Connection error:', err.message);

    // fix issue when db server not started yet
    setTimeout(() => {
      // Mongoose.connect(this.dbConfig.dashboard.url);
    }, 10000);
  }

  private onDbOpen() {
    // this._gfs = Grid(this.connection.db, Mongoose.mongo);
    console.info('Connected to DB!');
    this.connectedEvent.emit('connected-aliyun-mongo');
  }

  private onDbDisconnected() {
    console.log('db disconnected');
  }

  private connectAsync(client: MongoClientItem) {
    const url = client.url;
    const clientName = client.name;
    const dbs = client.dbs;
    const options = {
      useNewUrlParser: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 10000, // 10s
      autoReconnect : true,
      poolSize: 10,
      loggerLevel: 'info'
    };
    MongoClient.connect(url, options)
      .then((client: MongoClient) => {
        console.log(`Connected to db: ${url}`);
        dbs.forEach((item) => {
          const dbName = item.name;
          const db: MongoDb = client.db(dbName);

        // send event
          this.connectedEvent.emit(`${clientName}-${dbName}`, db);
        });

      })
      .catch((err) => {
        console.log(err);

        // fix issue when db server not started yet
        setTimeout(() => {
          this.connectAsync(client);
        }, 10000); // 10s interval
      })
  }

  private connection;
  private _gfs;
  private envService;
  // private dbConfig;
  //#endregion
}
