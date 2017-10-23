angular
  .module('mean.system')
  .controller('authController', [
    '$rootScope',
    '$scope',
    '$cookies',
    '$location',
    '$http',
    '$window',
    function ($rootScope, $scope, $cookies, $location, $http, $window) {
      $scope.errorMessage = ''
      $scope.displayIntro = true;

      $scope.country = geoplugin_countryName();

      if ($cookies.provider) {
        $scope.displayIntro = false;
        $scope.socialMessage = "There is no CFH account linked to this account. Please input your details below."
      }

      $scope.signUp = () => {
        let payload;

        if ($cookies.provider && $cookies.profileId) {
          const mainId = {
            provider: $cookies.provider
          }
          mainId._id = $cookies.profileId
          payload = {
            name: $scope.name,
            password: $scope.name,
            email: $cookies.email,
            location: $scope.country,
            [mainId.provider]: mainId._id,
            provider: $cookies.provider
          }
          $http
            .post('/api/auth/social', payload)
            .then((response) => {
              $scope.errorMessage = ''
              $window
                .localStorage
                .setItem('userId', response.data.user.id);
              $window
                .localStorage
                .setItem('token', response.data.token)
              $location.path('/app')
              $rootScope.$broadcast('newUser');
            }, (error) => {
              if (error.status === 409) {
                $scope.socialMessage = error.data.message
              }
            })
        } else {
          payload = {
            name: $scope.name,
            email: $scope.email,
            password: $scope.password,
            location: $scope.country
          }

          $http
            .post('/api/auth/signup', payload)
            .then((response) => {
              $scope.errorMessage = ''
              $window
                .localStorage
                .setItem('userId', response.data.user.id);
              $window
                .localStorage
                .setItem('token', response.data.token)
              $location.path('/app')
              $rootScope.$broadcast('newUser');
            }, (error) => {
              if (error.status === 409) {
                $scope.errorMessage = error.data.message
              }

              if (error.status === 500) {
                $scope.errorMessage = `An internal server error just occured.
                Please try again.`
              }

              if (error.status === 401) {
                console.log(error.data.message, '==========')
                $scope.errorMessage = error.data.message
              }
            });
        }

        $scope.togglePassword = () => {
          $scope.typePassword = !$scope.typePassword;
        }
      }
    }
  ]);
