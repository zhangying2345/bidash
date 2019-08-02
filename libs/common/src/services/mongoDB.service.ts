/**
 * Database Service
 */

import {
  MongoClient, Db as MongoDb, Collection as MongoCollection,
  MongoClientOptions
} from 'mongodb';

import { injectable } from 'inversify';

@injectable()
export class MongoDBService {
  constructor() {
    console.log('MongoDBService Cnt.');
  }

  //#region public APIs

  // connect to mongoDB server in async
  async getDatabaseAsync(url: string, dbName: string, options?: MongoClientOptions): Promise<MongoDb> {
    // find in cache
    if (this.dbCache.has(dbName)) {
      // console.log('find database in cache');
      return this.dbCache.get(dbName);
    }

    options = {
      ...{ // default options
        useNewUrlParser: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 10000, // 10s
        autoReconnect : true,
        poolSize: 10,
        loggerLevel: 'info'
      },
      ...(options ? options : {})
    };
    const client: MongoClient = await MongoClient.connect(url, options);
    console.log(`Connected to mongodb: ${url}`);

    const db: MongoDb = client.db(dbName);
    this.dbCache.set(dbName, db);

    return db;
  }

  async getCollectionAsync(db: MongoDb, collectionName: string) {
    if (!db) { return; }

    // find in cache
    if (this.collectionCache.has(collectionName)) {
      // console.log('find database collection in cache');
      return this.collectionCache.get(collectionName);
    }

    const promise = new Promise<MongoCollection>((resolve, reject) => {
      db.collection(collectionName, async(error, collection: MongoCollection) => {
        if (error) {
          // create the collection
          // const options = {};
          console.log(`Create ${collectionName} in database ${db.databaseName}.`);
          const newCollection = await db.createCollection(collectionName);
          this.collectionCache.set(collectionName, newCollection);
          resolve(newCollection);
        }

        this.collectionCache.set(collectionName, collection);
        console.log(`Get collection: ${collectionName} in database ${db.databaseName}.`);
        resolve(collection);
      });
    });

    return promise;
  }
  //#endregion

  //#region private members
  private dbCache: Map<string, MongoDb> = new Map();
  private collectionCache: Map<string, MongoCollection> = new Map();
  //#endregion
}
