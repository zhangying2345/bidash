/**
 * History Service
 */

import * as Mongoose from 'mongoose';
import * as Moment from 'moment';
import { injectable, inject } from 'inversify';

import { DatabaseService, EnvironmentService, CheckAuthService } from '../services';
import { DeviceService } from '../device';
// import { IocSymbols } from '../services/inversify/types';
import { IocSymbols } from '../ioc';
import { HistoryData, HistorySchema } from './entity';

import { LazyService, HttpApi } from '@bf/js-api-common';

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

import { Time } from '@sip/js-core';

@injectable()
export class HistoryService implements LazyService {
  constructor(
    @inject(IocSymbols.DatabaseService) private dbService: DatabaseService,
    @inject(IocSymbols.CheckAuthService) private authService: CheckAuthService,
    @inject(IocSymbols.EnvironmentService) private envService: EnvironmentService,
    @inject(IocSymbols.DeviceService) private deviceService: DeviceService
  ) {
    console.log('HistoryService Cnt.');

    this.daDbClient = Mongoose.createConnection(this.envService.databaseConfig.da.url);

    this.initialize();
  }

  // override API from LazyService
  initialize() {
    // TODO: update database collection for new version

    this.dbService.connectedEvent.on('main-dashboard', this.onDashboardDbConnected.bind(this));
    this.dbService.connectedEvent.on('main-raw', this.onRawDbConnected.bind(this));
    this.dbService.connectedEvent.on('main-da', this.onDaDbConnected.bind(this));
  }

  //#region GroupService API overrides
  get insertHandlers() {
    const handlers = [
      this.authService.checkBearerAuth(),
      this.insertHistoryData()
    ];

    return handlers;
  }

  get getByQueryHandlers() {
    const handlers = [
      this.authService.checkBearerAuth(),
      this.getHistoryByFilter()
    ];

    return handlers;
  }

  get  getByPeriodQueryHandlers() {
    const handlers = [
      this.authService.checkBearerAuth(),
      this.getHistoryByPeriod()
    ];

    return handlers;
  }

  get removeDataHandlers() {
    const handlers = [
      this.authService.checkBearerAuth(),
      this.removeData()
    ];

    return handlers;
  }

  get getTableListHandlers() {
    const handlers = [
      this.authService.checkBearerAuth(),
      this.getTableListQuery()
    ];

    return handlers;
  }

  get getScpsLineHandlers() {
    const handlers = [
      this.authService.checkBearerAuth(),
      this.getScpsLine()
    ];

    return handlers;
  }

  get getScpsLineBasedHourHandlers() {
    const handlers = [
      this.authService.checkBearerAuth(),
      this.getScpsLineBasedHour()
    ];

    return handlers;
  }

  get getScpsTableHandlers() {
    const handlers = [
      this.authService.checkBearerAuth(),
      this.getScpsTable()
    ];

    return handlers;
  }
  //#endregion

  //#region private members
  private insertHistoryData() {
    return (req, rsp, next) => {
      this.insert(req.body.collectionName, req.body.data).then(response => {
        rsp.status(200).json({ item: response });
      }).catch(error => next(error));
    };
  }

  private getHistoryByFilter() {
    return (req, rsp, next) => {
      let filter = JSON.parse(req.query.filter);
      this.getByQuery(req.query.collectionName, filter).then(response => {
        rsp.status(200).json({ item: response });
      }).catch(error => next(error));
    };
  };

  private getHistoryByPeriod() {
    return (req, rsp, next) => {
      // mandatory
      const source = req.query.device;
      const type = req.query.type;
      if (!source || !type) { return next(HttpApi.paramsMissing('M:device, type; O:aggregate, from, to, dataPoints/scopes')); }

      // optional
      // default aggregate is raw
      const aggregate = req.query.aggregate ? req.query.aggregate.toLowerCase() : 'raw';
      const from = req.query.from;
      const to = req.query.to;
      const dataPointsParam = req.query.scopes || req.query.dataPoints;

      const deviceConfig = this.deviceService.getDataTypeConfig(source, type);
      const dbname = deviceConfig && deviceConfig.db;
      const collections = deviceConfig && deviceConfig.collections;

      // default collection is raw
      const collectionConfig = collections && collections.find((item) => (item.aggregate === aggregate));
      const collection = collectionConfig && collectionConfig.collection;

      if (collection) {
        // console.log(`db:${dbname}, collection:${collection}, aggregate:${aggregate}`);
      }

      let filter = null;
      if(from && to)
      {
        filter = {
          'timestamp': {'$gte': Moment(from).valueOf(), '$lte': Moment(to).valueOf()}
        };

        filter = {
          timestamp: {
            '$gte': from,
            '$lte': to
          }
        };
        // console.log(`filter: ${JSON.stringify(filter)}`);
      }

      let dataPoints: string[] = [];
      if(dataPointsParam){
        dataPoints = dataPointsParam.split(';');
      }

      // convert to ids
      dataPoints = dataPoints.map((item) => this.deviceService.getId(item));

      const sourceId = this.deviceService.getId(source);
      const typeId = this.deviceService.getId(type);
      switch(sourceId) {
        case 'product-line':
          switch(typeId) {
            case 'machine-status':
              this.getProductLineMachineStatus(rsp, next, filter, dataPoints, aggregate);
              break;
            default:
              HttpApi.sendResponse(rsp, 503, 'Service Unavailable');
              break;
          }
          break;
        default:
          this.getData$(dbname, collection, filter, aggregate, dataPoints).subscribe(
            (response) => {
              HttpApi.sendResponse(rsp, 200, 'ok', response);
            },
            (error) => {
              next(error);
            }
          );
          break;
      }
    };
  };

  private getProductLineMachineStatus(rsp, next, filter, dataPoints, aggregate) {
    const machineNames = dataPoints;
    const machineStatusDataPoints=['ConnectionLoss', 'Idle', 'Working'];
    const observers = machineNames.map((item) => {
      const deviceConfig = this.deviceService.getDataTypeConfig(item, 'machine-status');
      const dbName = deviceConfig && deviceConfig.db;
      const collections = deviceConfig && deviceConfig.collections;

      // default collection is raw
      const collectionConfig = collections && collections.find((item) => (item.aggregate === aggregate));
      const collection = collectionConfig && collectionConfig.collection;

      return this.getData$(dbName, collection, filter, aggregate, machineStatusDataPoints).pipe(
        RxMap((response) => {
          // console.log(`db: ${dbName}, collection: ${collection}, filter: ${JSON.stringify(filter)}, aggregate: ${aggregate}`);
          const machineName = this.deviceService.getTitle(item);
          const rspData = response[0];

          // if rspData is invalid, return empty object
          const obj = !rspData ? {} : {
            info: rspData.info,
            param: {
              name: machineName,
              timestamp: rspData.timestamp,
              value: rspData.param
            }
          };

          return obj;
        })
      );
    });

    RxCombineLatest(...observers).subscribe(
      (responses: any) => {
        const validRsps = responses.filter((item) => (Object.keys(item).length > 0) && item.param && item.info);

        // if no valid responses, return empty object
        if (validRsps.length < 1) {
          HttpApi.sendResponse(rsp, 204, 'There are no content');
          return;
        }

        const responseParams = validRsps.map((item) => item.param);
        responseParams.sort((a, b) => {
          return Moment(b.timestamp).valueOf() > Moment(a.timestamp).valueOf()
        });
        const timestamp = [...responseParams[0].timestamp];

        // data clean
        responseParams.forEach((item) => {
          const timestampGap = Math.abs(Moment(item.timestamp).valueOf() - Moment(timestamp).valueOf());
          const overGap = timestampGap > this.getDurationByAggregate(aggregate);
          if (overGap) {
            item.value = this.emptyMachineStatus;
          }
        });

        const first = validRsps[0];
        // change xAxis to 'Machine'
        first && ((first.info[0]).xAxis = 'Machine');

        const rspData = [{
          info: first.info,
          timestamp: timestamp,
          param: responseParams
        }];
        HttpApi.sendResponse(rsp, 200, 'ok', rspData);
      },
      (error) => {
        next(error);
      }
    );
  }


  private get emptyMachineStatus() {
    const emptyValue = [{
      "name": "ConnectionLoss",
      "value": "0.0"
    }, {
      "name": "Idle",
      "value": "0.0"
    }, {
      "name": "Working",
      "value": "0.0"
    }];
    return emptyValue;
  }

  private removeData() {
    return (req, rsp, next) => {
      this.remove(req.body.collectionName, req.body.dataName)
        .then(removedData => rsp.status(200).json({ item: 200 }))
        .catch(error => next(error));
    };
  };

  private getTableListQuery() {
    return (req, rsp, next) => {
      this.getTableList().then(response => {
        let historyCollectionList = [];
        for (let i in response.data) {
          // if (response.data[i].name.indexOf('mongodb') !== -1)
          historyCollectionList.push(response.data[i].name);
        }
        rsp.status(200).json({ item: historyCollectionList });
      }).catch(error => next(error));
    };
  }

  private getScpsLine() {
    return (req, rsp, next) => {
      this.getScpsLineAsync(req.query.collectionName).then(response => {
        rsp.status(200).json({ item: response });
      }).catch(error => next(error));
    };
  };

  private getScpsLineBasedHour() {
    return (req, rsp, next) => {
      this.getScpsLineBasedHourAsync(req.query.collectionName).then(response => {
        rsp.status(200).json({ item: response });
      }).catch(error => next(error));
    };
  };

  private getScpsTable() {
    return (req, rsp, next) => {
      this.getScpsTableAsync(req.query.collectionName).then(response => {
        rsp.status(200).json({ item: response });
      }).catch(error => next(error));
    };
  };

  private getTimeByOffset(offset) {
    let data = new Date(new Date().getTime() + 8 * 3600000 - (offset * 24 * 3600 * 1000));
    let start = (data.toISOString().slice(0, 10) + 'T00:00:00.000+0800').toString();
    let end = (data.toISOString().slice(0, 10) + 'T23:59:59.999+0800').toString();
    return [start, end]
  }

  private getTimeByOffsetBasedHour(offset) {
    let data = new Date(new Date().getTime() + 8 * 3600000 - (offset * 3600 * 1000));
    let start = (data.toISOString().slice(0, 13) + ':00:00.000+0800').toString();
    let end = (data.toISOString().slice(0, 13) + ':59:59.999+0800').toString();
    return [start, end]
  }

  private dateTransferBasedHour(date) {
    var monthsInEng = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let d = new Date(new Date(date).getTime() + 8 * 3600000);
    let day = d.getDate() < 10 ? '0' + (d.getDate()) : (d.getDate());
    let hour = d.getHours() < 10 ? '0' + (d.getHours()) : (d.getHours());
    return hour + '-' + day + '-' + monthsInEng[d.getMonth()];
  }

  private dateTransfer(date) {
    var monthsInEng = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let d = new Date(new Date(date).getTime() + 8 * 3600000);
    // let month = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
    let day = d.getDate() < 10 ? '0' + (d.getDate()) : (d.getDate());
    return day + '-' + monthsInEng[d.getMonth()];
  }

  private sortTimestamp(a, b) {
    return a.timestamp - b.timestamp;
  }

  private insert(collection: string, historyData: HistoryData): Promise<any> {
    //TODO: Validation
    var response: any = {};
    let HistoryModel;
    try {
      // Throws an error if 'Name' hasn't been registered
      HistoryModel = Mongoose.model(collection)
    } catch (e) {
      HistoryModel = Mongoose.model(collection, HistorySchema, collection);
    }

    // Kill callback function
    let promise = new Promise<any>(function (resolve, reject) {

      var metadata = new HistoryModel({
        timestamp: historyData.timestamp,
        macAddr: historyData.macAddr,
        ipAddr: historyData.ipAddr,
        ipPort: historyData.ipPort,
        deviceName: historyData.deviceName,
        info: historyData.info,
        param: historyData.param
      });
      metadata.save(function (err, result) {
        if (err) {
          response.err = { 'err': err };
          response.code = 409;
          response.data = undefined;
        } else {
          response.err = undefined;
          response.code = 200;
          response.data = result;
        }
        resolve(response);
      });
    });
    return promise;
  }


  private getByQuery(collection: string, filter: any): Promise<any> {
    let response: any = {};
    let HistoryModel;
    try {
      // Throws an error if 'Name' hasn't been registered
      HistoryModel = Mongoose.model(collection)
    } catch (e) {
      HistoryModel = Mongoose.model(collection, HistorySchema, collection);
    }
    let promise = new Promise<HistoryData>((resolve, reject) => {
      HistoryModel.find(filter).sort({ 'timestamp': 1 }).exec(function (error, result) {
        // HistoryModel.find(filter, (error, result) => {
        if (error) {
          response.err = { 'err': error };
          response.code = 409;
          response.data = undefined;
        } else {
          response.err = undefined;
          response.code = 200;
          response.data = result;
        }
        resolve(response);
      })
    });
    return promise;
  }

  private filterResult(result: any, dataPoints: any){
    if(dataPoints.length == 0 || result.length == 0){
      return result;
    }
    let newResult = [];
    for(let message of result){
      let param = null;
      let filterParam = [];
      try{
        param = message.param;
      }catch(err){
        console.log(err.message);
      }

      dataPoints.forEach((dataPoint) => {
        const scopeId = this.deviceService.getId(dataPoint);
        let match = true;
        for(const property of param){
          let propertyName = null;
          try{
            propertyName = property.name;
          }catch(err){
            console.log(err.message);
          }
          match = (propertyName === scopeId);
          if(match){
            filterParam.push(property);
            break;
          } else {
            continue;
          }
        }

        if (!match) {
          // if don't find the scope param, set it to 0
          const scopeParam = {
            name: scopeId,
            value: '0'
          };
          filterParam.push(scopeParam);
        }
      });

      if (filterParam.length > 0){
        message.param = filterParam;
        newResult.push(message);
      }

    }
    return newResult;
  }

  private getDaByFrequency(model: any, filter: any, dataPoints:any, offset: number){
    let data = [];
    let low = filter.timestamp.$gte;
    let high = filter.timestamp.$lte;
    let tmp = low;
    let threshold = low;
    let response: any = {};
    let promise = new Promise<HistoryData>((resolve, reject) => {
      while( tmp <= high ){
        let filterTmp = { 'timestamp': { '$gte': tmp , '$lte': (tmp + offset) } };

        model.find(filterTmp).sort({ 'timestamp': -1 }).limit(1).exec((error, result) => {
          threshold = threshold + offset;
          if (error) {
            response.err = { 'err': error };
            response.code = 409;
            response.data = undefined;
            resolve(response);
          }
          if(result[0]){
            data.push(result[0]);
          }
          if( threshold > high ){
            console.log(data.length);
            response.err = undefined;
            response.code = 200;
            if(dataPoints && dataPoints.length > 0){
              response.data = this.filterResult(data, dataPoints);
            }
            else{
              response.data = data;
            }
            resolve(response);
          }
        });
        tmp = tmp + offset;
      }
    });

    return promise;
  }

  private getDataByOffset$(model: any, filter: any, offset: number, dataPoints?: string[]) {
    const observable = Observable.create((observer) => {
      let response;
      const data = [];
      let begin = filter.timestamp.$gte;
      const end = filter.timestamp.$lte;

      while (begin <= end) {
        const filter = { 'timestamp': { '$gte': begin , '$lte': (begin + offset) } };

        model.find(filter).sort({ 'timestamp': -1 }).limit(1).exec((error, result) => {
          // threshold = threshold + offset;
          if (error) {
            observer.error(error.message);
            return;
          }
          if(result[0]){
            data.push(result[0]);
          }
        });
        begin = begin + offset;
      }

      console.log(data.length);
      if(dataPoints && dataPoints.length > 0) {
        const rspData = this.filterResult(data, dataPoints);
        response = rspData;
      }
      else{
        response = data;
      }
      observer.next(response);
    });

    return observable;
  }

  private getLatestData$(model, dataPoints?: string[]) {
    const observable = Observable.create((observer) => {
      let response;

      // find the latest record
      model.find().sort({'timestamp':-1}).limit(1).exec((error, result) => {
        if (error) {
          observer.error(error.message);
        } else {
          if(dataPoints && (dataPoints.length > 0)) {
            const filterOut = this.filterResult(result, dataPoints);
            response = filterOut;
          }
          else{
            response = result;
          }
        }
        observer.next(response);
      });
    });

    return observable;
  }

  private getDataInAscending$(model, filter, dataPoints?: string[]) {
    const observable = Observable.create((observer) => {
      let response;

      // sort in ascending
      model.find(filter).sort({'timestamp': 1}).exec((error, result) => {
        if (error) {
          observer.error(error.message);
        } else {
          if(dataPoints && (dataPoints.length > 0)) {
            const filterOut = this.filterResult(result, dataPoints);
            response = filterOut;
          }
          else{
            response = result;
          }
        }
        observer.next(response);
      });
    });

    return observable;
  }

  private getDurationByAggregate(aggregate: string) {
    switch(aggregate) {
      case 'second': return Time.second;
      case 'minute': return Time.minute;
      case 'hour': return Time.hour;
      case 'day': return Time.day;
      case 'week': return Time.week;
      default: return -1;
    }
  }

  private getData$(dbname: string, collectionName: string, filter?: any, interval?: string, dataPoints?: string[]): Observable<any> {
    if ( !dbname || !collectionName) {
      return RxThrowError('invalid db name or collection name');
    }

    let historyModel;
    const isDaDb = (dbname === 'da');
    try {
      historyModel = isDaDb ? this.daDbClient.model(collectionName) : Mongoose.model(collectionName);
    } catch (e) {
      historyModel = isDaDb ? this.daDbClient.model(collectionName, HistorySchema, collectionName) : Mongoose.model(collectionName, HistorySchema, collectionName);
    }

    if (filter) {
      // const offset = this.getOffsetByPeriod(interval);
      // if ( -1 === offset) {
      return this.getDataInAscending$(historyModel, filter, dataPoints);
      // }
      // return this.getDataByOffset$(historyModel, filter, offset, dataPoints);
    } else {
      // get latest record
      return this.getLatestData$(historyModel, dataPoints);
    }
  }

  private getDaByQuery(collectionName: string, filter: any, period: string, dbname: string, dataPoints: any): Promise<any> {
    let response: any = {};
    let historyModel;
    let promise;
    if (dbname === 'da') {
      try {
        // Throws an error if 'Name' hasn't been registered
        historyModel = this.daDbClient.model(collectionName)
      } catch (e) {
        historyModel = this.daDbClient.model(collectionName, HistorySchema, collectionName);
      }
    }
    else{
      try {
        // Throws an error if 'Name' hasn't been registered
        historyModel = Mongoose.model(collectionName)
      } catch (e) {
        historyModel = Mongoose.model(collectionName, HistorySchema, collectionName);
      }
    }

    if(filter){
      switch(period){
        case 'second':{
          promise = this.getDaByFrequency(historyModel, filter, dataPoints, 1000);
        }
        break;

        case 'minute':{
          promise = this.getDaByFrequency(historyModel, filter, dataPoints, 60*1000);
        }
        break;

        case 'hour':{
          promise = this.getDaByFrequency(historyModel, filter, dataPoints, 60*60*1000);
        }
        break;

        case 'day':{
          promise = this.getDaByFrequency(historyModel, filter, dataPoints, 24*60*60*1000);
        }
        break;

        case 'week':{
          promise = this.getDaByFrequency(historyModel, filter, dataPoints, 7*24*60*60*1000);
        }
        break;

        default:{
          promise = new Promise<HistoryData>((resolve, reject) => {
            historyModel.find(filter).sort({ 'timestamp': 1 }).exec((error, result) => {
              // HistoryModel.find(filter, (error, result) => {
              if (error) {
                response.err = { 'err': error };
                response.code = 409;
                response.data = undefined;
              } else {
                response.err = undefined;
                response.code = 200;
                if(dataPoints && dataPoints.length > 0){
                  response.data = this.filterResult(result, dataPoints);
                }
                else{
                  response.data = result;
                }
              }
              resolve(response);
            })
          });
          return promise;
        }
      }
    }
    else{
      promise = new Promise<HistoryData>((resolve, reject) => {
        historyModel.find({}).sort({'timestamp':-1}).limit(1).exec((error, result) => {
          // HistoryModel.find(filter, (error, result) => {
          if (error) {
            response.err = { 'err': error };
            response.code = 409;
            response.data = undefined;
          } else {
            response.err = undefined;
            response.code = 200;
            if(dataPoints && dataPoints.length > 0){
              response.data = this.filterResult(result, dataPoints);
            }
            else{
              response.data = result;
            }
          }
          resolve(response);
        })
      })
    }
    return promise;
  }

  private getScpsLineBasedHourAsync(collection: string): Promise<any> {
    let count = 0;
    let data = [];
    let response: any = {};
    let HistoryModel;
    try {
      // Throws an error if 'Name' hasn't been registered
      HistoryModel = Mongoose.model(collection)
    } catch (e) {
      HistoryModel = Mongoose.model(collection, HistorySchema, collection);
    }
    let promise = new Promise<HistoryData>((resolve, reject) => {
      for (let i = 7 * 24; i >= 0; i--) {
        HistoryModel.find({ 'timestamp': { '$gte': new Date(this.getTimeByOffsetBasedHour(i)[0]).getTime(), '$lte': new Date(this.getTimeByOffsetBasedHour(i)[1]).getTime() } }).sort({ 'timestamp': -1 }).limit(1).exec((error, result) => {
          count++;
          if (result[0]) {
            data.push(result[0]);
          } else {
            let obj = {
              '_id': '',
              'macAddr': '',
              'ipAddr': '',
              'ipPort': '',
              'deviceName': null,
              'info': [{
                'xAxis': '',
                'yAxis': ''
              }],
              'param': [
                {
                  'value': null,
                  'name': this.dateTransferBasedHour(this.getTimeByOffsetBasedHour(i)[0])
                }
              ],
              'timestamp': [
                new Date(this.getTimeByOffsetBasedHour(i)[0]).getTime().toString()
              ]
            }
            data.push(obj);
          }
          if (count == (7 * 24 + 1)) {
            data.sort(this.sortTimestamp);
            response.code = 200;
            response.data = data;
            resolve(response);
          }
        })
      }
    });
    return promise;
  }


  private getScpsLineAsync(collection: string): Promise<any> {
    let count = 0;
    let data = [];
    let response: any = {};
    let HistoryModel;
    try {
      // Throws an error if 'Name' hasn't been registered
      HistoryModel = Mongoose.model(collection)
    } catch (e) {
      HistoryModel = Mongoose.model(collection, HistorySchema, collection);
    }
    let promise = new Promise<HistoryData>((resolve, reject) => {
      for (let i = 6; i >= 0; i--) {
        HistoryModel.find({ 'timestamp': { '$gte': new Date(this.getTimeByOffset(i)[0]).getTime(), '$lte': new Date(this.getTimeByOffset(i)[1]).getTime() } }).sort({ 'timestamp': -1 }).limit(1).exec((error, result) => {
          count++;
          if (result[0]) {
            data.push(result[0]);
          } else {
            let obj = {
              '_id': '',
              'macAddr': '',
              'ipAddr': '',
              'ipPort': '',
              'deviceName': null,
              'info': [{
                'xAxis': '',
                'yAxis': ''
              }],
              'param': [
                {
                  'value': null,
                  'name': this.dateTransfer(this.getTimeByOffset(i)[0])
                }
              ],
              'timestamp': [
                new Date(this.getTimeByOffset(i)[0]).getTime().toString()
              ]
            }
            data.push(obj);
          }
          if (count == 7) {
            data.sort(this.sortTimestamp);
            response.code = 200;
            response.data = data;
            resolve(response);
          }
        })
      }
    });
    return promise;
  }

  private getScpsTableAsync(collection: string): Promise<any> {
    let response: any = {};
    let HistoryModel;
    try {
      // Throws an error if 'Name' hasn't been registered
      HistoryModel = Mongoose.model(collection)
    } catch (e) {
      HistoryModel = Mongoose.model(collection, HistorySchema, collection);
    }
    let promise = new Promise<HistoryData>((resolve, reject) => {
      HistoryModel.find({ 'timestamp': { '$gte': new Date(this.getTimeByOffset(0)[0]).getTime(), '$lte': new Date(this.getTimeByOffset(0)[1]).getTime() } }).sort({ 'timestamp': -1 }).limit(1).exec(function (error, result) {
        if (error) {
          response.err = { 'err': error };
          response.code = 409;
          response.data = undefined;
        } else {
          response.err = undefined;
          response.code = 200;
          response.data = result;
        }
        resolve(response);
      })
    });
    return promise;
  }


  private remove(collection: string, dataName: String): Promise<any> {
    let response: any = {};
    let HistoryModel;
    try {
      // Throws an error if 'Name' hasn't been registered
      HistoryModel = Mongoose.model(collection)
    } catch (e) {
      HistoryModel = Mongoose.model(collection, HistorySchema, collection);
    }
    let promise = new Promise<HistoryData>((resolve, reject) => {
      HistoryModel.remove({ dataName: dataName }, (error, result) => {
        if (error) {
          response.err = { 'err': error };
          response.code = 409;
          response.data = undefined;
        } else {
          response.err = undefined;
          response.code = 200;
          response.data = result;
        }
        resolve(response);
      })
    });
    return promise;
  }

  private getTableList(): Promise<any> {
    let response: any = {};
    let promise = new Promise<HistoryData>((resolve, reject) => {
      this.dbService.db.listCollections().toArray(function (err, names) {
        if (err) {
        } else {
          response.err = undefined;
          response.code = 200;
          response.data = names;
        }
        resolve(response);
      });
    });
    return promise;
  }

  //#region db connect callbacks
  private onDashboardDbConnected(db: MongoDb) {
    this.dashboardDb = db;
    console.log('HistoryService, database: main -> dashboard, connected');
  }

  private onRawDbConnected(db: MongoDb) {
    console.log('HistoryService, database: main -> raw, connected');
    this.rawDb = db;
  }

  private onDaDbConnected(db: MongoDb) {
    console.log('HistoryService, database: main -> da, connected');
    this.daDb = db;
  }
  //#endregion

  private daDbClient;

  private dashboardDb: MongoDb;
  private rawDb: MongoDb;
  private daDb: MongoDb;
  private dbCollection: MongoCollection;
  //#endregion
}
