/**
 * History Service
 */

import * as Mongoose from 'mongoose';
import * as Moment from 'moment';
import { injectable, inject } from 'inversify';
import { DatabaseService, EnvironmentService } from '../services';
import { IocSymbols } from '../ioc';
import { HistoryModel } from './entity';

import { HttpApi } from '@bf/js-api-common';

import { Db as MongoDb, Collection as MongoCollection } from 'mongodb';

import { Observable, throwError as RxThrowError, combineLatest as RxCombineLatest } from 'rxjs';

import {
  map as RxMap, switchMap as RxSwitchMap,
  filter as RxFilter,
  retry as RxRetry, retryWhen as RxRetryWhen, repeat as RxRepeat,
  combineLatest as RxCombineLatestOp,
  concat as RxConcatOp, concatAll as RxConcatAll,
  take as RxTake, tap as RxTap,
  delay as RxDelay, delayWhen as RxDelayWhen,
  catchError as RxCatchError
} from 'rxjs/operators';

@injectable()
export class HistoryService {
  constructor(
    @inject(IocSymbols.DatabaseService) private dbService: DatabaseService,
  ) {
    console.log('HistoryService Cnt.');
    this.initialize();
  }

  initialize() {
    // TODO: update database collection for new version

    this.dbService.connectedEvent.on('connected-aliyun-mongo', this.onDashboardDbConnected.bind(this));
  }

  //#region GroupService API overrides
  get testFun() {
    const handlers = [
      this.testFunction.bind(this)
    ];

    return handlers;
  }

  //#endregion

  //#region private members
  private testFunction(req, rsp, next) {
    let test = new HistoryModel({
      name: 'test',
    });
    test.save((err, res) => {
      if (err) {
        console.log("Error:" + err);
      }
      else {
        console.log("Res:" + res);
        rsp.status(200).json({ item: 'response' });
      }
    })
  }

  

  //#region db connect callbacks
  private onDashboardDbConnected(db: MongoDb) {
    this.dashboardDb = db;
    console.log('connected-aliyun-mongo, connected');
  }
  //#endregion

  private dashboardDb: MongoDb;
  //#endregion
}
