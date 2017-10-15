angular.module('mean.system')
  .controller('authController', ['$rootScope', '$scope', '$cookies', '$location', '$http', '$window',
    function ($rootScope, $scope, $cookies, $location, $http, $window) {

      $scope.errorMessage = ''
      $scope.provider = '';
      $scope.profileId = '';

      $scope.signUp = () => {
        let payload;
        if ($cookies.profileId && $cookies.provider) {
          $scope.provider = $cookies.provider;
          $scope.profileId = $cookies.profileId;
           payload = {
            name: $scope.name,
            email: $scope.email,
            password: $scope.password,
            provider: $scope.provider,
            [$scope.provider]: { _id: $scope.profileId }
          }
        } else {
           payload = {
            name: $scope.name,
            email: $scope.email,
            password: $scope.password,
          }
        }
        $http.post('/api/auth/signup', payload)
          .then(
          (response) => {
            $scope.errorMessage = ''
            $window.localStorage.setItem('token', response.data.token)
            $location.path('/app')
            $rootScope.$broadcast('newUser');
          },
          (error) => {
            if (error.status === 409) {
              $scope.errorMessage = error.data.message
            }

            if (error.status === 500) {
              $scope.errorMessage = `An internal server error just occured.
                Please try again.`
            }

            if (error.status === 401) {
              $scope.errorMessage = error.data.message
            }
          }
          );
      }

      $scope.togglePassword = () => {
        $scope.typePassword = !$scope.typePassword;
      }
    }]);
