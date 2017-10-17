import mongoose from 'mongoose';

const LeaderBoard = mongoose.model('LeaderBoard');

const sortLeaderBoardResult = (data) => {
  data.sort((firstValue, secondValue) => secondValue.score - firstValue.score);
  return data;
};


export const create = ({ gameWinnerId, gameWinnerName }) => {
  if (gameWinnerId === 'unauthenticated') {
    return false;
  }
  LeaderBoard
    .find({ winnerId: gameWinnerId }, (err, response) => {
      if (err) {
        return response.status(500).json({ err });
      }
      LeaderBoard.update(
        { winnerId: gameWinnerId }, { winnerId: gameWinnerId, winnerName: gameWinnerName, $inc: { score: 1 } },
        { upsert: true }, (err) => {
          if (err) {
            return response.status(500).json({ err });
          }
        }
      );
    });
};

export const getLeaderBoard = (req, res) => {
  LeaderBoard.find({}, (err, leaderBoards) => {
    if (err) {
      return res.status(500).json({ err });
    }
    return res
      .status(200)
      .json(sortLeaderBoardResult(leaderBoards));
  });
};

