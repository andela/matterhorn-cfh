angular.module('mean.system')
.controller('LogController', ['$scope', 'Global', 'game', '$timeout', '$http', '$window', '$location','$dialog', function ($scope, Global, game, $timeout, $http, $window, $location, $dialog) {
  $scope.show = 1;
  $scope.games = [];
  $scope.gameRank = [];
  $scope.abandonGame = () => {
    console.log($location.path('/'))
  };
  const setHttpHeader = () => {
    const token = $window.localStorage.getItem('token')
    $http.defaults.headers.common.Authorization = token;
  };
  setHttpHeader();
  $http.get('/api/games/logs')
  .then((res) => {
    for (let i = 0; i < res.data.length; i += 1) {
      $scope.games.push(res.data[i]);
    }
  });

  $http.get('/api/leaderboard/region')
  .then((response) => {
    $scope.gameRank = response.data.data;
  })
}]);
