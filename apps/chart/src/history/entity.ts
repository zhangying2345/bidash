/**
 * Entity Model
 */

import * as Mongoose from 'mongoose';
import Schema = Mongoose.Schema;

const HistorySchema = new Schema({
  name: {type: String},
});

let HistoryModel = Mongoose.model('Hist', HistorySchema);
export { HistoryModel };
