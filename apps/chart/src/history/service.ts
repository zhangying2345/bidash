/**
 * History Service
 */

import * as Mongoose from 'mongoose';
import * as Moment from 'moment';
import { injectable, inject } from 'inversify';
import { DatabaseService, EnvironmentService } from '../services';
import { IocSymbols } from '../ioc';
import { DataSourceModel } from './entity';

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
import * as Uuid from 'uuid';

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

  get getDataSourcesHander() {
    const handlers = [
      this.getDataSources.bind(this),
      this.getDataSourceById.bind(this)
    ];

    return handlers;
  }

  get postDataSourcesHander() {
    const handlers = [
      this.postDataSource.bind(this)
    ];

    return handlers;
  }

  get putDataSourcesHander() {
    const handlers = [
      this.putDataSource.bind(this)
    ];

    return handlers;
  }

  get deleteDataSourcesHander() {
    const handlers = [
      this.deleteDataSource.bind(this)
    ];

    return handlers;
  }

  get searchByNameHander() {
    const handlers = [
      this.searchByName.bind(this)
    ];

    return handlers;
  }

  //#endregion

  //#region private members
  private testFunction(req, rsp, next) {
    let test = new DataSourceModel({
      id: '1',
      name: 'test',
      dataSource: 'test'
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

  private getDataSourceById(req, rsp, next) {
    const id = req.query.id;
    var wherestr = {'id' : id};
    
    DataSourceModel.find(wherestr).exec()
    .then((resp) => {
      console.log('getDataSourceById:', resp);
      rsp.status(200).json({
        status: 200,
        message: 'ok',
        data: resp
      })
    }).catch((error) => next(error));
  }

  private getDataSources(req, rsp, next) {
    if (req.query.id) { return next(); }
    DataSourceModel.find({}).exec()
    .then((resp) => {
      console.log('getDataSources:', resp);
      resp = this.filterResp(resp);
      rsp.status(200).json({
        status: 200,
        message: 'ok',
        data: resp
      })
    }).catch((error) => next(error));
  }

  private postDataSource(req, rsp, next) {
    const body = req.body;

    this.addDataSource(body).then((resp) => {
      rsp.status(200).json({
        status: 200,
        message: 'ok',
        data: 'success'
      })
    }).catch((error) => next(error));
  }

  private putDataSource(req, rsp, next) {
    const body = req.body;

    this.modifyDataSource(body).then((resp) => {
      rsp.status(200).json({
        status: 200,
        message: 'ok',
        data: 'success'
      })
    }).catch((error) => next(error));
  }

  private deleteDataSource(req, rsp, next) {
    const delId = req.query.id;
    this.delDataItem(delId).then((resp) => {
      rsp.status(200).json({
        status: 200,
        message: 'ok',
        data: 'success'
      })
    }).catch((error) => next(error));
  }

  private addDataSource(postBody) {
    const dataSourceModel = new DataSourceModel({
      id: Uuid.v4(),
      name: postBody.name,
      dataSource: postBody.dataSource
    })
    return dataSourceModel.save();
  }

  private modifyDataSource(putBody) {
    const where = { id: putBody.id };
    const update = {
      name: putBody.name,
      dataSource: putBody.dataSource
    };
    return DataSourceModel.update(where, update).exec();
  }

  private searchByName(req, rsp, next) {
    const keyWord = req.query.name;
    const reg = new RegExp(keyWord, 'i');
    DataSourceModel.find({name : {$regex : reg}}).exec()
    .then((resp) => {
      rsp.status(200).json({
        status: 200,
        message: 'ok',
        data: resp
      })
    }).catch((error) => next(error));
  }

  private filterResp(resp) {
    if (!resp) { return; }
    const output = [];
    for (const respItem of resp) {
      const item = {
        id: respItem.id,
        name: respItem.name,
        dataSource: respItem.dataSource
      }
      output.push(item);
    }
    return output;
  }

  private delDataItem(delId) {
    const delItem = { id: delId };
    return DataSourceModel.remove(delItem).exec();
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
