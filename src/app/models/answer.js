/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Answer Schema
 */
const AnswerSchema = new Schema({
  id: {
    type: Number
  },
  text: {
    type: String,
    default: '',
    trim: true
  },
  regionId: {
    type: Number,
    default: 0,
    trim: true
  },
  official: {
    type: Boolean
  },
  expansion: {
    type: String,
    default: '',
    trim: true
  }
});

/**
 * Statics
 */
AnswerSchema.statics = {
  load(id, cb) {
    this.findOne({
      id
    }).select('-_id').exec(cb);
  }
};

mongoose.model('Answer', AnswerSchema);
