angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', '$location', '$http', '$window','socket', 'game',  'AvatarService', function ($scope,Global,$location, $http, $window, socket,  game, AvatarService) {
    $scope.global = Global;
    $scope.formData = {};

    $scope.playAsGuest = () => {
      game.joinGame();
      $location.path('/app');
    }

    $scope.showError = () => {
      if ($location.search().error) {
        return $location.search().error;
      } else {
        return false;
      }
    }

    $scope.signIn = () => {
       $http.post('api/auth/login', JSON.stringify($scope.formData))
        .success((data) => {
          console.log(data)
       if (data.success === true) {
         $window.localStorage.setItem('user-token', data.token);
         $window.location.href = '/';
       } else {
         $scope.showMessage = data.message;
      }
    })
  }

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then(function(data) {
        $scope.avatars = data;
      });


}]);
