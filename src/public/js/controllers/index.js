angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', '$cookieStore', '$cookies', '$location', '$http', '$window','socket', 'game',  'AvatarService', function ($scope,Global, $cookieStore, $cookies, $location, $http, $window, socket,  game, AvatarService) {
<<<<<<< HEAD
  
=======

  $scope.scrollTo = function(id){
      // Scroll
    $('html,body').animate({
        scrollTop: $("#"+id).offset().top}, 'slow');
  }
>>>>>>> cd9118260507ad37ce43f17d85119cc95a3297f3
    $scope.checkAuth = () => {
          if ($cookies.token) {
          $window.localStorage.setItem('token', $cookies.token);
        }
    };
    $scope.checkAuth();
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
       if (data.success === true) {
         $window.localStorage.setItem('token', data.token);
         $window.location.href = '/';
       } else {
         $scope.showMessage = data.message;
       }
       })
      .error(() => {
             $scope.showMessage = "Oops! Invalid email and/or password";
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
