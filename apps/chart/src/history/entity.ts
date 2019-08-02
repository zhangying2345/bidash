/**
 * Entity Model
 */

import * as Mongoose from 'mongoose';


import Schema = Mongoose.Schema;

export interface HistoryData {
  timestamp: String,
  macAddr: String,
  ipAddr: String,
  ipPort: String,
  deviceName: String,
  info: any,
  param: [Mongoose.Schema.Types.Mixed]
}

export interface IHistoryData extends HistoryData, Mongoose.Document{ };

const HistorySchema = new Schema({
  timestamp: { type: String, index: true } ,
  macAddr: String,
  ipAddr: String,
  ipPort: String,
  deviceName: String,
  info: [{}],
  param: [Mongoose.Schema.Types.Mixed]
});

var HistoryModel;
HistoryModel = Mongoose.model<IHistoryData>('History', HistorySchema);

export { HistoryModel, HistorySchema };
