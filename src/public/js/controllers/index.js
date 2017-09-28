angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', '$cookieStore', '$cookies', '$location', '$http', '$window','socket', 'game',  'AvatarService', function ($scope,Global, $cookieStore, $cookies, $location, $http, $window, socket,  game, AvatarService) {
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
    $scope.setToken = () => {
      $http.get('/users/token')
        .success((data) => {
          if (data.cookie) {
            $window.localStorage.setItem('token', data.cookie);
          } else {
            $scope.showMessage = data.message;
          }
        })
        .error(() => {
          $scope.showMessage = "Failed to authenticate user";
        });
    }
    $scope.signIn = () => {
       $http.post('api/auth/login', JSON.stringify($scope.formData))
        .success((data) => {
       if (data.success === true) {
         $window.localStorage.setItem('token', data.token);
         $window.location.href = '/';
       } else {
         $scope.showMessage = data.message;
       }
       })
      .error(() => {
             $scope.showMessage = "Wrong email and/or password";
      });
    }

    $scope.signOut = () => {
      $http.get('/logout')
      .success(() => {
       $window.location.href = '/';
     }) 
      angular.forEach($cookies, function (v, k) {
        $cookieStore.remove(k);
    });
      $window.localStorage.removeItem("token");
      // $cookieStore.remove('token');
      $window.location.href = '/';
    }

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then(function(data) {
        $scope.avatars = data;
      });
}]);
