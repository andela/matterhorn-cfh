import mongoose from 'mongoose';

const { Schema } = mongoose;

const LeaderBoardSchema = new Schema({
  score: {
    type: Number,
    default: 0
  },
  winnerName: {
    type: String,
    default: ''
  },
  winnerId: {
    type: String,
    default: ''
  }
});

mongoose.model('LeaderBoard', LeaderBoardSchema);
