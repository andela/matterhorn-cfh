/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Rank Schema
 */
const RankSchema = new Schema({
  id: {
    type: Number
  },
  location: {
    type: String,
    default: '',
    trim: true
  },
  wins: {
    type: Number,
    default: 0
  }
});

/**
 * Statics
 */
RankSchema.statics = {
  load(id, cb) {
    this.findOne({
      id
    }).select('-_id').exec(cb);
  }
};

mongoose.model('Rank', RankSchema);
