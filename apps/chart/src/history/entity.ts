/**
 * Entity Model
 */

import * as Mongoose from 'mongoose';
import Schema = Mongoose.Schema;

const DataSourceSchema = new Schema({
  id: {type: String, index: true},
  name: {type: String},
  dataSource: {}
});

let DataSourceModel = Mongoose.model('dataSources', DataSourceSchema);
export { DataSourceModel };
