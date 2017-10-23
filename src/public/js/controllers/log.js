angular.module('mean.system')
.controller('LogController', ['$scope', 'Global', 'game', '$timeout', '$http', '$window', '$location','$dialog', function ($scope, Global, game, $timeout, $http, $window, $location, $dialog) {
  $scope.show = 1;
  $scope.currentPage =1;
  $scope.dataLimit = 3;
  $scope.pageSize = 3;
  $scope.pageStart = 0;
  $scope.pageEnd = 3;
  $scope.games = [];
  $scope.mags = [];
  $scope.gameRank = [];
  $scope.donations = [];
  $scope.paginationCounters = [];
  $scope.leaderboardData = [];

  $scope.showNextItems = () => {
    if ($scope.pageEnd < $scope.games.length) {
      $scope.currentPage === $scope.pageStart ? $scope.currentPage +=2 : $scope.currentPage +=1
      $scope.pageStart = ($scope.currentPage - 1) * $scope.dataLimit;
      $scope.pageEnd = ($scope.currentPage * $scope.dataLimit);
      $scope.mags = $scope.games.slice($scope.pageStart, $scope.pageEnd);
    }
  }

  $scope.showPrevItems = () => {
    if ($scope.pageStart > 1) {
      $scope.currentPage === $scope.pageStart ? $scope.currentPage -=2 : $scope.currentPage -=1
      $scope.pageStart = ($scope.currentPage - 1) * $scope.dataLimit;
      $scope.pageEnd = $scope.currentPage * $scope.dataLimit;
      $scope.mags = $scope.games.slice($scope.pageStart, $scope.pageEnd);
    }
  }

  $scope.pageNavigation = (numCounter) => {
    $scope.pageStart = (numCounter - 1) * $scope.dataLimit;
    $scope.pageEnd = numCounter * $scope.dataLimit;
    $scope.mags = $scope.games.slice($scope.pageStart, $scope.pageEnd);
    $scope.currentPage = numCounter;
  }

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
  });

  let pageNumber = 0
  $http.get('/api/games/logs')
  .then((res) => {
    for (let i = 0; i < res.data.length; i += 1) {
      $scope.games.push(res.data[i]);
      if (i % 3 === 0) {
        pageNumber += 1;
        $scope.paginationCounters.push(pageNumber);
      }
    }
    $scope.mags = $scope.games.slice($scope.pageStart, $scope.pageEnd);
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

  $http.get('/api/leaderboard').then((response) => {
    $scope.leaderboardData = (response.data);
     });

}]);
