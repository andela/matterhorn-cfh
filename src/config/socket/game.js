import async from 'async';
import _ from 'underscore';

import { allQuestionsForGame } from '../../app/controllers/questions';
import { allAnswersForGame } from '../../app/controllers/answers';
import {
  create as createLeaderBoard
} from '../../app/controllers/leaderboard';

const guestNames = [
  'Disco Potato',
  'Silver Blister',
  'Insulated Mustard',
  'Funeral Flapjack',
  'Toenail',
  'Urgent Drip',
  'Raging Bagel',
  'Aggressive Pie',
  'Loving Spoon',
  'Swollen Node',
  'The Spleen',
  'Dingle Dangle'
];

/* eslint-disable
require-jsdoc,
class-methods-use-this,
no-underscore-dangle,
no-plusplus,
max-len,
no-console */
/**
*
*
* @class Game
*/
class Game {
  /**
  * Creates an instance of Game.
  * @param {any} gameID
  * @param {any} io
  * @memberof Game
  */
  constructor(gameID, io) {
    this.io = io;
    this.gameID = gameID;
    this.players = []; // Contains array of player models
    this.table = []; // Contains array of {card: card, player: player.id}
    this.winningCard = -1; // Index in this.table
    this.gameWinner = -1; // Index in this.players
    this.winnerAutopicked = false;
    this.czar = -1; // Index in this.players
    this.playerMinLimit = 3;
    this.playerMaxLimit = 12;
    this.pointLimit = 5;
    this.state = 'awaiting players';
    this.round = 0;
    this.questions = null;
    this.answers = null;
    this.curQuestion = null;
    this.timeLimits = {
      stateChoosing: 21,
      stateJudging: 16,
      stateResults: 6
    };
    // setTimeout ID that triggers the czar judging state
    // Used to automatically run czar judging if players don't pick before time limit
    // Gets cleared if players finish picking before time limit.
    this.choosingTimeout = 0;
    // setTimeout ID that triggers the result state
    // Used to automatically run result if czar doesn't decide before time limit
    // Gets cleared if czar finishes judging before time limit.
    this.judgingTimeout = 0;
    this.resultsTimeout = 0;
    this.guestNames = guestNames.slice();
    this.regionId = 0;
  }

  /**
  *
  *
  * @memberof Game
  * @return {object} payload
  */
  payload() {
    const players = [];
    this.players.forEach((player) => {
      players.push({
        hand: player.hand,
        points: player.points,
        username: player.username,
        avatar: player.avatar,
        premium: player.premium,
        socketID: player.socket.id,
        color: player.color,
        regionId: player.regionId,
        userID: player.userID,
        name: player.name
      });
    });
    return {
      gameID: this.gameID,
      players,
      czar: this.czar,
      state: this.state,
      round: this.round,
      gameWinner: this.gameWinner,
      winningCard: this.winningCard,
      winningCardPlayer: this.winningCardPlayer,
      winnerAutopicked: this.winnerAutopicked,
      table: this.table,
      pointLimit: this.pointLimit,
      curQuestion: this.curQuestion
    };
  }


  /**
  * @memberof Game
  * @returns {void}
  @param {string} msg
  */
  sendNotification(msg) {
    this.io.sockets.in(this.gameID).emit('notification', { notification: msg });
  }

  sendChat() {
    this.io.sockets.in(this.gameID).emit('newMessage');
  }
  // Currently called on each joinGame event from socket.js
  // Also called on removePlayer IF game is in 'awaiting players' state

  /**
  *
  * @returns {void}
  * @memberof Game
  */
  assignPlayerColors() {
    this.players.forEach((player, index) => {
      player.color = index;
    });
  }


  /**
  *
  * @returns {void}
  * @memberof Game
  */
  assignGuestNames() {
    const self = this;
    this.players.forEach((player) => {
      if (player.username === 'Guest') {
        const randIndex = Math.floor(Math.random() * self.guestNames.length);
        /* eslint-disable prefer-destructuring */
        player.username = self.guestNames.splice(randIndex, 1)[0];
        if (!self.guestNames.length) {
          self.guestNames = guestNames.slice();
        }
      }
    });
  }

  broadcastNotification() {
    this.io.sockets.emit('notificationReceived');
  }

  /**
  *
  * @returns {void}
  * @memberof Game
  */
  prepareGame() {
    this.state = 'game in progress';

    this.io.sockets.in(this.gameID).emit(
      'prepareGame',
      {
        playerMinLimit: this.playerMinLimit,
        playerMaxLimit: this.playerMaxLimit,
        pointLimit: this.pointLimit,
        timeLimits: this.timeLimits
      }
    );

    const self = this;
    async.parallel(
      [
        this.getQuestions,
        this.getAnswers
      ],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        if (this.regionId) {
          self.questions = results[0].filter(result => parseInt(result.regionId, 10) === parseInt(this.regionId, 10));
          self.answers = results[1].filter(result => parseInt(result.regionId, 10) === parseInt(this.regionId, 10));
        } else {
          self.questions = results[0];
          self.answers = results[1];
        }
        self.startGame();
      }
    );
  }

  startGame() {
    this.shuffleCards(this.questions);
    this.shuffleCards(this.answers);
    this.changeCzar(this);
    this.sendUpdate();
  }


  sendUpdate() {
    this.io.sockets.in(this.gameID).emit('gameUpdate', this.payload());
  }


  stateChoosing(self) {
    self.state = 'waiting for players to pick';
    // console.log(self.gameID,self.state);
    self.table = [];
    self.winningCard = -1;
    self.winningCardPlayer = -1;
    self.winnerAutopicked = false;
    self.curQuestion = self.questions.pop();
    if (!self.questions.length) {
      self.getQuestions((err, data) => {
        if (this.regionId) {
          self.questions = data.filter(result => parseInt(result.regionId, 10) === this.regionId);
        }
      });
    }
    self.round++;
    self.dealAnswers();
    self.sendUpdate();

    self.choosingTimeout = setTimeout(() => {
      self.stateJudging(self);
    }, self.timeLimits.stateChoosing * 1000);
  }

  selectFirst() {
    if (this.table.length) {
      this.winningCard = 0;
      const winnerIndex = this._findPlayerIndexBySocket(this.table[0].player);
      this.winningCardPlayer = winnerIndex;
      this.players[winnerIndex].points++;
      this.winnerAutopicked = true;
      this.stateResults(this);
    } else {
      // console.log(this.gameID,'no cards were picked!');
      this.stateChoosing(this);
    }
  }

  stateJudging(self) {
    self.state = 'waiting for czar to decide';

    if (self.table.length <= 1) {
      // Automatically select a card if only one card was submitted
      self.selectFirst();
    } else {
      self.sendUpdate();
      self.judgingTimeout = setTimeout(() => {
        // Automatically select the first submitted card when time runs out.
        self.selectFirst();
      }, self.timeLimits.stateJudging * 1000);
    }
  }

  stateResults(self) {
    self.state = 'winner has been chosen';
    console.log(self.state);
    let winner = -1;
    for (let i = 0; i < self.players.length; i++) {
      if (self.players[i].points >= self.pointLimit) {
        winner = i;
      }
    }
    self.sendUpdate();
    self.resultsTimeout = setTimeout(() => {
      if (winner !== -1) {
        self.stateEndGame(winner);
      } else {
        // self.stateChoosing(self);
        self.changeCzar(self);
      }
    }, self.timeLimits.stateResults * 1000);
  }

  stateEndGame(winner) {
    this.state = 'game ended';
    this.gameWinner = winner;

    const gameWinnerId =
      this.players[winner].userID; // winner ID

    const gamewinnerName =
      this.players[winner].username; // winner name

    createLeaderBoard(gameWinnerId, gamewinnerName);

    this.sendUpdate();
  }

  stateDissolveGame() {
    this.state = 'game dissolved';
    this.sendUpdate();
  }

  getQuestions(cb) {
    allQuestionsForGame((data) => {
      cb(null, data);
    });
  }

  getAnswers(cb) {
    allAnswersForGame((data) => {
      cb(null, data);
    });
  }

  shuffleCards(cards) {
    let shuffleIndex = cards.length;
    let temp;
    let randNum;

    while (shuffleIndex) {
      randNum = Math.floor(Math.random() * shuffleIndex--);
      temp = cards[randNum];
      cards[randNum] = cards[shuffleIndex];
      cards[shuffleIndex] = temp;
    }

    return cards;
  }

  dealAnswers(maxAnswers) {
    maxAnswers = maxAnswers || 10;
    const storeAnswers = (err, data) => {
      if (this.regionId) {
        this.answers = data.filter(result => parseInt(result.regionId, 10) === this.regionId);
      }
    };
    for (let i = 0; i < this.players.length; i++) {
      while (this.players[i].hand.length < maxAnswers) {
        this.players[i].hand.push(this.answers.pop());
        if (!this.answers.length) {
          this.getAnswers(storeAnswers);
        }
      }
    }
  }

  _findPlayerIndexBySocket(thisPlayer) {
    let playerIndex = -1;
    _.each(this.players, (player, index) => {
      if (player.socket.id === thisPlayer) {
        playerIndex = index;
      }
    });
    return playerIndex;
  }

  pickCards(thisCardArray, thisPlayer) {
    // Only accept cards when we expect players to pick a card
    if (this.state === 'waiting for players to pick') {
      // Find the player's position in the players array
      const playerIndex = this._findPlayerIndexBySocket(thisPlayer);
      console.log('player is at index', playerIndex);
      if (playerIndex !== -1) {
        // Verify that the player hasn't previously picked a card
        let previouslySubmitted = false;
        _.each(this.table, (pickedSet) => {
          if (pickedSet.player === thisPlayer) {
            previouslySubmitted = true;
          }
        });
        if (!previouslySubmitted) {
          // Find the indices of the cards in the player's hand (given the card ids)
          const tableCard = [];
          for (let i = 0; i < thisCardArray.length; i++) {
            let cardIndex = null;
            for (let j = 0; j < this.players[playerIndex].hand.length; j++) {
              if (this.players[playerIndex].hand[j].id === thisCardArray[i]) {
                cardIndex = j;
              }
            }
            console.log('card', i, 'is at index', cardIndex);
            if (cardIndex !== null) {
              tableCard.push(this.players[playerIndex].hand.splice(cardIndex, 1)[0]);
            }
            console.log('table object at', cardIndex, ':', tableCard);
          }
          if (tableCard.length === this.curQuestion.numAnswers) {
            this.table.push({
              card: tableCard,
              player: this.players[playerIndex].socket.id
            });
          }
          console.log('final table object', this.table);
          if (this.table.length === this.players.length - 1) {
            clearTimeout(this.choosingTimeout);
            this.stateJudging(this);
          } else {
            this.sendUpdate();
          }
        }
      }
    } else {
      console.log('NOTE:', thisPlayer, 'picked a card during', this.state);
    }
  }

  getPlayer(thisPlayer) {
    const playerIndex = this._findPlayerIndexBySocket(thisPlayer);
    if (playerIndex > -1) {
      return this.players[playerIndex];
    }
    return {};
  }

  removePlayer(thisPlayer) {
    const playerIndex = this._findPlayerIndexBySocket(thisPlayer);

    if (playerIndex !== -1) {
      // Just used to send the remaining players a notification
      const playerName = this.players[playerIndex].username;

      // If this player submitted a card, take it off the table
      for (let i = 0; i < this.table.length; i++) {
        if (this.table[i].player === thisPlayer) {
          this.table.splice(i, 1);
        }
      }

      // Remove player from this.players
      this.players.splice(playerIndex, 1);

      if (this.state === 'awaiting players') {
        this.assignPlayerColors();
      }

      // Check if the player is the czar
      if (this.czar === playerIndex) {
        // If the player is the czar...
        // If players are currently picking a card, advance to a new round.
        if (this.state === 'waiting for players to pick') {
          clearTimeout(this.choosingTimeout);
          this.sendNotification('The Czar left the game! Starting a new round.');
          return this.stateChoosing(this);
        } else if (this.state === 'waiting for czar to decide') {
          // If players are waiting on a czar to pick, auto pick.
          this.sendNotification('The Czar left the game! First answer submitted wins!');
          this.pickWinning(this.table[0].card[0].id, thisPlayer, true);
        }
      } else {
        // Update the czar's position if the removed player is above the current czar
        if (playerIndex < this.czar) {
          this.czar--;
        }
        this.sendNotification(`${playerName} has left the game.`);
      }

      this.sendUpdate();
    }
  }

  pickWinning(thisCard, thisPlayer, autopicked) {
    autopicked = autopicked || false;
    const playerIndex = this._findPlayerIndexBySocket(thisPlayer);
    if ((playerIndex === this.czar || autopicked)
      && this.state === 'waiting for czar to decide') {
      let cardIndex = -1;
      _.each(this.table, (winningSet, index) => {
        if (winningSet.card[0].id === thisCard) {
          cardIndex = index;
        }
      });
      if (cardIndex !== -1) {
        this.winningCard = cardIndex;
        const winnerIndex = this._findPlayerIndexBySocket(this.table[cardIndex].player);
        this.sendNotification(`${this.players[winnerIndex].username} has won the round!`);
        this.winningCardPlayer = winnerIndex;
        this.players[winnerIndex].points++;
        clearTimeout(this.judgingTimeout);
        this.winnerAutopicked = autopicked;
        this.stateResults(this);
      }
    } else {
      this.sendUpdate();
    }
  }

  killGame() {
    clearTimeout(this.resultsTimeout);
    clearTimeout(this.choosingTimeout);
    clearTimeout(this.judgingTimeout);
  }


  changeCzar(self) {
    self.state = 'czar pick card';
    self.table = [];
    if (self.czar >= self.players.length - 1) {
      self.czar = 0;
    } else {
      self.czar += 1;
    }
    self.sendUpdate();
  }

  startNextRound(self) {
    if (self.state === 'czar pick card') {
      self.stateChoosing(self);
    } else if (self.state === 'czar left game') {
      self.changeCzar(self);
    }
  }
}

export default Game;
