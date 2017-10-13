import mongoose from 'mongoose';

const { Schema } = mongoose;

const BoardSchema = new Schema({
  gameId: {
    type: String
  },
  username: {
    type: String
  },
  playerPoint: {
    type: Number
  },
  playerId: {
    type: String
  },
  date: Date
});

mongoose.model('Board', BoardSchema);
