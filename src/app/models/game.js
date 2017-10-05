import mongoose from 'mongoose';

const { Schema } = mongoose;

const GameSchema = new Schema({
  gameId: {
    type: String
  },
  gameOwner: {
    type: String
  },
  gameWinner: {
    type: String,
    default: '',
    trim: true
  },

  date: Date,

  gamePlayers: []
});

mongoose.model('Game', GameSchema);
