angular.module('mean.system')
  .controller('GameController', ['socket', '$rootScope', '$scope', '$window', '$timeout', 'Global', 'game', '$firebaseObject', '$firebaseArray', '$timeout', '$http', '$window', '$location', 'MakeAWishFactsService', '$dialog', function (socket, $rootScope, $scope, $window,  $timeout, Global, game, $firebaseObject, $firebaseArray, $timeout, $http, $window, $location, MakeAWishFactsService, $dialog) {
    $scope.hasPickedCards = false;
    $scope.winningCardPicked = false;
    $scope.showTable = false;
    $scope.modalShown = false;
    $scope.game = game;
    $scope.notify = false;
    $scope.messages = {};
    $scope.global = Global;
    $scope.messages = [];
    $scope.pickedCards = [];
    var makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    $scope.makeAWishFact = makeAWishFacts.pop();
    $scope.friendsId = [];
    $scope.inviteList = [];
    $scope.notifications = [];
    $scope.regionId = parseInt(sessionStorage.getItem('userRegion'), 10);
    $scope.regionName = regions($scope.regionId);
    $scope.showRegionName = false;

    $scope.showRegionModal = function () {
      return swal({
        title: "Choose your region",
        input: "select",
        inputOptions: regions(),
        inputValue: $scope.regionId,
        inputValidator: function (value) {
          return new Promise(function (resolve, reject) {
            if (parseInt(value, 10) > 0) {
              resolve()
            } else {
              reject('Please choose your region')
            }
          })
        },
        showCancelButton: true,
        confirmButtonColor: '#009688',
        cancelButtonColor: '#D0021B',
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Start Game'
      })
      .then((regionId) => {
        if (regionId) {
          if (game.players.length < game.playerMinLimit) {
            return swal({
              title: 'You cannot start a game now!',
              text: `You need ${game.playerMinLimit - game.players.length} more players`
            });
          } else {
            $window.sessionStorage.setItem('userRegion', regionId);
            $scope.regionName = regions(regionId);
            $scope.showRegionName = true;
            game.startGame();
          }
        }
      })
      .catch(() => {})
    };

    $scope.setHttpHeader = () => {
      const token = $window.localStorage.getItem('token')
      $http.defaults.headers.common.Authorization = token;
    };

    setTimeout(function () {
      $scope.username = $scope.game.players[$scope.game.playerIndex].username;
      var chatRef = new Firebase(`https://matterhorn-cfh.firebaseio.com/chat/${game.gameID}`)

      $scope.messages = $firebaseArray(chatRef.limitToLast(15));
    }, 1000);

    var indicator = $("div.chat-close").text();

    $scope.submitChat = function () {
      var date = new Date(),
        time = date.toString().split(' ')[4]
        
      const sender = $scope.game.players[$scope.game.playerIndex].username;
      var message = document.getElementById('message').value,
        avatar = $scope.game.players[$scope.game.playerIndex].avatar;
      $scope.messages.$add({ message, gameId: game.gameID, sender, time, avatar })
        .then(() => game.newChat())

      document.getElementById('message').value = "";
    };

    $scope.pickCard = function (card) {
      if (!$scope.hasPickedCards) {
        if ($scope.pickedCards.indexOf(card.id) < 0) {
          $scope.pickedCards.push(card.id);
          if (game.curQuestion.numAnswers === 1) {
            $scope.sendPickedCards();
            $scope.hasPickedCards = true;
          } else if (game.curQuestion.numAnswers === 2 &&
            $scope.pickedCards.length === 2) {
            //delay and send
            $scope.hasPickedCards = true;
            $timeout($scope.sendPickedCards, 300);
          }
        } else {
          $scope.pickedCards.pop();
        }
      }
    };
    
    $scope.pointerCursorStyle = function () {
      if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
        return { 'cursor': 'pointer' };
      } else {
        return {};
      }
    };
    
    
    $scope.sendPickedCards = function () {
      game.pickCards($scope.pickedCards);
      $scope.showTable = true;
    };
    
    $scope.cardIsFirstSelected = function (card) {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[0];
      } else {
        return false;
      }
    };
    
    $scope.cardIsSecondSelected = function (card) {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[1];
      } else {
        return false;
      }
    };
    
    
    $scope.firstAnswer = function ($index) {
      if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
        return true;
      } else {
        return false;
      }
    };
    
    $scope.secondAnswer = function ($index) {
      if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
        return true;
      } else {
        return false;
      }
    };
    
    $scope.showFirst = function (card) {
      return game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;
    };
    
    $scope.showSecond = function (card) {
      return game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;
    };
    
    // model that triggers czar modal
    $scope.shuffleCards = () => {
      const card = $(`#${event.target.id}`);
      $('#cardModal').show();
      card.addClass('animated flipOutY');
      setTimeout(() => {
        $scope.startNextRound();
        card.removeClass('animated flipOutY');
        $('#cardModal').hide();
      }, 500);
    };

    $scope.startNextRound = () => {
      if ($scope.isCzar()) {
        game.startNextRound();
      }
    };
    $scope.isCzar = function () {
      return game.czar === game.playerIndex;
    };
    
    $scope.isPlayer = function ($index) {
      return $index === game.playerIndex;
    };
    
    $scope.isCustomGame = function () {
      return !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players';
    };
    
    $scope.isPremium = function ($index) {
      return game.players[$index].premium;
    };
    
    $scope.currentCzar = function ($index) {
      return $index === game.czar;
    };
    
    $scope.winningColor = function ($index) {
      if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
        return $scope.colors[game.players[game.winningCardPlayer].color];
      } else {
        return '#f9f9f9';
      }
    };
    
    $scope.pickWinning = function (winningSet) {
      if ($scope.isCzar()) {
        game.pickWinning(winningSet.card[0]);
        $scope.winningCardPicked = true;
      }
    };
    
    $scope.winnerPicked = function () {
      return game.winningCard !== -1;
    };
    
    
    $scope.startGame = function () {

      if (game.players.length < game.playerMinLimit) {
        swal({
          title: "You cannot start game now!",
          text: `You need ${game.playerMinLimit - game.players.length} more players`,
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Ok'
        });
      } else {
        swal({
          title: "Are you sure??",
          text: "Clicking the Start button will start the game for every users in this session",
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Go back',
          confirmButtonText: 'Start Game'
        })
          .then((willPlay) => {
            if (willPlay) {
              game.startGame();
            }
          })
          .catch(() => swal("Game was not started"))
      }
    };

    $scope.invitePlayers = () => {
      const inviteModal = $('#invitePlayers');
      inviteModal.modal('open');
      $scope.getFriendsList();
    };

    $scope.viewFriends = () => {
      $scope.getFriendsList();
    };

    $scope.searchusers = () => {
      const searchTerm = $scope.searchTerm
      if (searchTerm.length >= 1) {
        $http.get(`/api/search/users/${searchTerm}`)
          .success((data) => {
            $scope.searchResults = data;
          })
          .error(() => {
            $scope.showResults = false;
          })
      } else {
        $scope.searchResults = [];
      }
    };

    $scope.addFriend = (friend) => {
      const payload = {
        friendId: friend._id,
        friendName: friend.name
      };

      $scope.setHttpHeader();
      $http.put('/api/user/friend', payload)
        .then(
        (response) => {
          $scope.getFriendsList();
        },
        (error) => {
          $scope.getFriendsList();
        });
    };

    $scope.getFriendsList = () => {
      $scope.setHttpHeader();
      $http.get('/api/user/friends')
        .then(
        (response) => {
          $scope.friendsList = response.data;
          $scope.friendsId = response.data.map(friend => friend.friendId)
        },
        (error) => {
          $scope.friendsList = [];
        });
    };

    $scope.sendNotification = (friend) => {
      let myFriends;
      if (friend) {
        myFriends = [friend._id];
      } else {
        myFriends = $scope.friendsList.map(friend => friend.friendId)
      }

      $scope.inviteList = [...$scope.inviteList, ...myFriends];

      const payload = {
        link: $location.url(),
        myFriends
      };
      $scope.setHttpHeader();
      $http.post('/api/notification', payload)
        .then(
        (response) => {
          game.broadcastNotification();
        });
    };

    socket.on('notificationReceived', () => {
      $scope.loadNotifications();
    });

    $scope.loadNotifications = () => {
      $scope.setHttpHeader();
      $http.get('/api/notifications')
        .then(
        (response) => {
          $scope.notifications = response.data.notifications;
        },
        (error) => {
          $scope.notifications = $scope.notifications;
        }
        )
    };

    $scope.loadNotifications();

    $scope.readNotification = (item) => {
      $http.put(`/api/notification/${item._id}`)
        .then(
        (response) => {
          $scope.loadNotifications();
        },
        (error) => {
          $scope.loadNotifications();
        });
    };

    $scope.isUser = () => {
      const token = $window.localStorage.getItem('token');

      if (token) {
        return true
      } else {
        return false
      }
    };
    $scope.abandonGame = function () {
      game.leaveGame();
      $location.path('/');
    };
    
    // Catches changes to round to update when no players pick card
    // (because game.state remains the same)
    $scope.$watch('game.round', function () {
      $scope.hasPickedCards = false;
      $scope.showTable = false;
      $scope.winningCardPicked = false;
      $scope.makeAWishFact = makeAWishFacts.pop();
      if (!makeAWishFacts.length) {
        makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      }
      $scope.pickedCards = [];
    });
    
    // In case player doesn't pick a card in time, show the table
    $scope.$watch('game.state', function () {
      if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
        $scope.showTable = true;
      }

    // When game ends, delete chat data then send game data to the database
      if ($scope.game.state === 'game ended' || $scope.game.state === 'game dissolved') {
        var chatRef = new Firebase(`https://matterhorn-cfh.firebaseio.com/chat/${game.gameID}`);
        $scope.messages.$remove(chatRef)
          .then(() => {
            const gameData = {
              gameId: $scope.game.gameID,
              gameOwner: $scope.game.players[0].username,
              gameWinner: $scope.game.players[game.gameWinner].username,
              gamePlayers: $scope.game.players
            };
            $http.post(`/api/games/${game.gameID}/start`, gameData);
          });

      };
    });
    if ($scope.game.players.length < 1) {

    }

    $scope.setToken = () => {
      $http.get('/users/token')
      .success((data) => {
        if (data.cookie) {
          $window.sessionStorage.setItem('token', data.cookie);
        } else {
          $scope.showMessage = data.message;
        }
      })
      .error(() => {
        $scope.showMessage = "Failed to authenticate user";
      });
    }
    $scope.$watch('game.gameID', function () {
      if (game.gameID && game.state === 'awaiting players') {
        if (!$scope.isCustomGame() && $location.search().game) {
          // If the player didn't successfully enter the request room,
          // reset the URL so they don't think they're in the requested room.
          $location.search({});
        } else if ($scope.isCustomGame() && !$location.search().game) {
          // Once the game ID is set, update the URL if this is a game with friends,
          // where the link is meant to be shared.
          $location.search({ game: game.gameID });
          if (!$scope.modalShown) {
            setTimeout(function () {
              var link = document.URL;
              var txt = 'Give the following link to your friends so they can join your game: ';
              $('#lobby-how-to-play').text(txt);
              $('#oh-el').css({ 'text-align': 'center', 'font-size': '22px', 'background': 'white', 'color': 'black' }).text(link);
            }, 200);
            $scope.modalShown = true;
          }
        }
      }
    });
    
    if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
      console.log('joining custom game');
      game.joinGame('joinGame', $location.search().game);
    } else if ($location.search().custom) {
      game.joinGame('joinGame', null, true);
    } else {
      game.joinGame();
    }

    $scope.tour = introJs();

    $scope.tour.setOptions({
      steps: [
        {
          intro: `Hi there. Welcome to Cards for Humanity Game.
          Ready to do some good? Let me take you on a tour √`
        },
        {
          element: '#player-count-container',
          intro: 'The game needs a minimum number of 3 players to start.'
        },
        {
          element: '#start-game-button',
          intro: 'You can invite other players from here and also add friends to invite to future games.'
        },
        {
          element: '#play-game',
          intro: 'Click this button to start the game if there are at least 3 players.'
        },
        {
          element: '#question-container',
          intro: 'When the game starts, the questions are displayed here.'
        },
        {
          element: '#inner-timer-container',
          intro: `You have 20 seconds to submit an awesome answer. After time out, the CZAR selects his favorite answer. Whoever submits CZAR's favorite answer wins that round.`
        },
        {
          element: '#inner-info',
          intro: 'The answer cards will be displayed here.',
        },
        {
          element: '#game-players',
          intro: 'The players are displayed here. The first player who gets the highest score wins the game.'
        },
        {
          element: '#live-chat',
          intro: 'You can chat with other players in the game.'

        },
        {
          element: '#notifications-container',
          intro: 'Your notifications will appear here.',
          posotion: 'top'
        },
        {
          element: '#leave-game',
          intro: 'Done playing? Click this button to leave the game.'
        },
        {
          element: '#tour-container',
          intro: 'Click here to take this awesome tour again.'
        }
      ],
      showStepNumbers: true,
      disableInteraction: true,
      skipLabel: 'Skip Tour',
      overlayOpacity: 0.5,
      showBullets: false
    });

    $scope.tour.onbeforechange(function (targetElement) {
      if (targetElement.id === 'game-players') {
        $('#live-chat header').trigger('click');
      }
    });

    $scope.startTour = () => $scope.tour.start();

    $rootScope.$on('newUser', function (event) {
      $timeout(function () {
        $scope.startTour();
      }, 2000);

      $scope.tour.onexit(function () {
        swal({
          text: "Do you want to go to the homepage or start a new game session",
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Go to Home Page',
          confirmButtonText: 'Start a New Game'
        })
          .then(() => {
            $window.location.reload();
          })
          .catch(() => {
            $location.path('/');
          })
      });
    })
  }]);
  