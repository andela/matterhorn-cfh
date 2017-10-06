angular.module('mean.system')
.controller('LogController', ['$scope', 'Global', 'game', '$timeout', '$http', '$window', '$location','$dialog', function ($scope, game, $http, $window, $location, $dialog) {
  $scope.showHistory = true;
  $scope.showLeaderboard = false;
  $scope.showDonations = false;
  $scope.game = game;

  // setTimeout(function() {
  //   var chatRef = new Firebase(`https://matterhorn-cfh.firebaseio.com/chat/${game.gameID}`)

  //   $scope.messages = $firebaseArray(chatRef.limitToFirst(10));
  //  }, 1000);

  $scope.abandonGame = function () {
    game.leaveGame();
    $location.path('/');
  };

  // Catches changes to round to update when no players pick card
  // (because game.state remains the same)
  // $scope.$watch('game.round', function () {
  //   $scope.hasPickedCards = false;
  //   $scope.showTable = false;
  //   $scope.winningCardPicked = false;
  //   $scope.makeAWishFact = makeAWishFacts.pop();
  //   if (!makeAWishFacts.length) {
  //     makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
  //   }
  //   $scope.pickedCards = [];
  // });

}]);
