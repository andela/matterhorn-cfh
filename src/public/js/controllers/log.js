angular.module('mean.system')
.controller('LogController', ['$scope', 'Global', 'game', '$timeout', '$http', '$window', '$location','$dialog', function ($scope, Global, game, $timeout, $http, $window, $location, $dialog) {
  $scope.show = 1;
  $scope.games = [];
  $scope.gameRank = [];
  $scope.donations = [];
  $scope.donors = [];

  $scope.abandonGame = () => {
    console.log($location.path('/'))
  };
  const setHttpHeader = () => {
    const token = $window.localStorage.getItem('token')
    $http.defaults.headers.common.Authorization = token;
  };
  setHttpHeader();

  $http.get('/api/donations')
  .then((res) => {
    const donation = res.data.donations;
    for (let i = 0; i < donation.length; i += 1) {
      $scope.donations.push(donation[i]);
    }
    console.log($scope.donations);
  });

  $http.get('/api/donors')
  .then((res) => {
    const donors = res.data.donors;
    console.log($scope.donors);
    for (let i=0; i < donors.length; i++) {
      if (donors[i].donor_consent === true) {
        $scope.donors.push(donors[i]);
      }
    }
    $scope.loadCarousel = true;
  });


  $http.get('/api/games/logs')
  .then((res) => {
    for (let i = 0; i < res.data.length; i += 1) {
      $scope.games.push(res.data[i]);
    }
  });
  
  $http.get('/api/leaderboard')
  .success((data) => {
    $scope.leaderBoard = data;
  })
  .error(() => {
    $scope.leaderBoard = false;
  })

  $http.get('/api/leaderboard/region')
  .then((response) => {
    $scope.gameRank = response.data.data;
  })

  $scope.parseStamp = (getStamp) => {
    const formattedStamp = new Date(getStamp);
    return formattedStamp.toUTCString({ hour12: true });
  }
}]);
