/** eslint-disable */
import consoleStamp from 'console-stamp';
import mongoose from 'mongoose';
import Game from './game';
import Player from './player';
import { all } from '../../app/controllers/avatars';

const User = mongoose.model('User');
consoleStamp(console, 'm/dd HH:MM:ss');


const avatars = all();
// Valid characters to use to generate random private game IDs
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

module.exports = (io) => {
  let game = '';
  const allGames = {};
  const allPlayers = {};
  const gamesNeedingPlayers = [];
  let gameID = 0;

  io.sockets.on('connection', (socket) => {
    console.log(`${socket.id} Connected`);
    socket.emit('id', { id: socket.id });

    socket.on('pickCards', (data) => {
      console.log(socket.id, 'picked', data);
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickCards(data.cards, socket.id);
      } else {
        console.log('Received pickCard from', socket.id, 'but game does not appear to exist!');
      }
    });

    socket.on('pickWinning', (data) => {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickWinning(data.card, socket.id);
      } else {
        console.log('Received pickWinning from', socket.id, 'but game does not appear to exist!');
      }
    });

    const fireGame = (player, gameSocket) => {
      if (gamesNeedingPlayers.length <= 0) {
        gameID += 1;
        const gameIDStr = gameID.toString();
        game = new Game(gameIDStr, io);
        allPlayers[gameSocket.id] = true;
        game.players.push(player);
        allGames[gameID] = game;
        gamesNeedingPlayers.push(game);
        gameSocket.join(game.gameID);
        gameSocket.gameID = game.gameID;
        console.log(gameSocket.id, 'has joined newly created game', game.gameID);
        game.assignPlayerColors();
        game.assignGuestNames();
        game.sendUpdate();
      } else {
        game = gamesNeedingPlayers[0]; //eslint-disable-line
        allPlayers[gameSocket.id] = true;
        game.players.push(player);
        console.log(gameSocket.id, 'has joined game', game.gameID);
        gameSocket.join(game.gameID);
        gameSocket.gameID = game.gameID;
        game.assignPlayerColors();
        game.assignGuestNames();
        game.sendUpdate();
        game.sendNotification(`${player.username} has joined the game!`);
        if (game.players.length >= game.playerMaxLimit) {
          gamesNeedingPlayers.shift();
          game.prepareGame();
        }
      }
    };

    const createGameWithFriends = (player, socket) => {
      let isUniqueRoom = false;
      let uniqueRoom = '';
      // Generate a random 6-character game ID
      while (!isUniqueRoom) {
        uniqueRoom = '';
        for (let i = 0; i < 12; i++) {
          uniqueRoom += chars[Math.floor(Math.random() * chars.length)];
        }
        if (!allGames[uniqueRoom] && !(/^\d+$/).test(uniqueRoom)) {
          isUniqueRoom = true;
        }
      }
      console.log(socket.id, 'has created unique game', uniqueRoom);
      const game = new Game(uniqueRoom, io);
      allPlayers[socket.id] = true;
      game.players.push(player);
      allGames[uniqueRoom] = game;
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
    };

    const getGame = (player, socketGame, requestedGameId, createPrivate) => {
      requestedGameId = requestedGameId || '';
      createPrivate = createPrivate || false;
      console.log(socketGame.id, 'is requesting room', requestedGameId);
      if (requestedGameId.length && allGames[requestedGameId]) {
        console.log('Room', requestedGameId, 'is valid');
        const game = allGames[requestedGameId];
        // Ensure that the same socket doesn't try to join the same game
        // This can happen because we rewrite the browser's URL to reflect
        // the new game ID, causing the view to reload.
        // Also checking the number of players, so node doesn't crash when
        // no one is in this custom room.
        if (game.state === 'awaiting players' && (!game.players.length ||
          game.players[0].socketGame.id !== socketGame.id)) {
          // Put player into the requested game
          console.log('Allowing player to join', requestedGameId);
          allPlayers[socketGame.id] = true;
          game.players.push(player);
          socketGame.join(game.gameID);
          socketGame.gameID = game.gameID;
          game.assignPlayerColors();
          game.assignGuestNames();
          game.sendUpdate();
          game.sendNotification(`${player.username} has joined the game!`);
          if (game.players.length >= game.playerMaxLimit) {
            gamesNeedingPlayers.shift();
            game.prepareGame();
          }
        } else {
          // TODO: Send an error message back to this user saying the game has already started
        }
      } else {
        // Put players into the general queue
        console.log('Redirecting player', socketGame.id, 'to general queue');
        if (createPrivate) {
          createGameWithFriends(player, socketGame);
        } else {
          fireGame(player, socketGame);
        }
      }
    };

    const joinGame = (socket, data) => {
      const player = new Player(socket);
      data = data || {};
      player.userID = data.userID || 'unauthenticated';
      if (data.userID !== 'unauthenticated') {
        User.findOne({
          _id: data.userID
        }).exec((err, user) => {
          if (err) {
            console.log('err', err);
            return err; // Hopefully this never happens.
          }
          if (!user) {
            // If the user's ID isn't found (rare)
            player.username = 'Guest';
            player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
          } else {
            player.username = user.name;
            player.premium = user.premium || 0;
            player.avatar = user.avatar || avatars[Math.floor(Math.random() * 4) + 12];
          }
          getGame(player, socket, data.room, data.createPrivate);
        });
      } else {
        // If the user isn't authenticated (guest)
        player.username = 'Guest';
        player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
        getGame(player, socket, data.room, data.createPrivate);
      }
    };
    socket.on('joinGame', (data) => {
      if (!allPlayers[socket.id]) {
        joinGame(socket, data);
      }
    });

    const exitGame = (socket) => {
      console.log(socket.id, 'has disconnected');
      if (allGames[socket.gameID]) { // Make sure game exists
        const game = allGames[socket.gameID];
        console.log(socket.id, 'has left game', game.gameID);
        delete allPlayers[socket.id];
        if (game.state === 'awaiting players' ||
          game.players.length - 1 >= game.playerMinLimit) {
          game.removePlayer(socket.id);
        } else {
          game.stateDissolveGame();
          for (let j = 0; j < game.players.length; j++) {
            game.players[j].socket.leave(socket.gameID);
          }
          game.killGame();
          delete allGames[socket.gameID];
        }
      }
      socket.leave(socket.gameID);
    };

    socket.on('joinNewGame', (data) => {
      exitGame(socket);
      joinGame(socket, data);
    });

    socket.on('startGame', () => {
      if (allGames[socket.gameID]) {
        const thisGame = allGames[socket.gameID];
        console.log('comparing', thisGame.players[0].socket.id, 'with', socket.id);
        if (thisGame.players.length >= thisGame.playerMinLimit) {
          // Remove this game from gamesNeedingPlayers so new players can't join it.
          gamesNeedingPlayers.forEach((game, index) => {
            if (game.gameID === socket.gameID) {
              return gamesNeedingPlayers.splice(index, 1);
            }
          });
          thisGame.prepareGame();
          thisGame.sendNotification('The game has begun!');
        }
      }
    });

    socket.on('czarCardSelected', () => {
      allGames[socket.gameID].startNextRound(allGames[socket.gameID]);
    });

    socket.on('leaveGame', () => {
      exitGame(socket);
    });

    socket.on('disconnect', () => {
      console.log('Rooms on Disconnect ', io.sockets.manager.rooms);
      exitGame(socket);
    });
  });
};
