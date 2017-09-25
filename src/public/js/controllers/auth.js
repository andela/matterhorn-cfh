angular.module('mean.system')
  .controller('authController', ['$scope', '$location', '$http', '$window',
    function ($scope, $location, $http, $window) {

      $scope.errorMessage = ''
      $scope.hideErrorMessage = 'hidden'


      $scope.signUp = () => {
        const payload = {
          name: $scope.name,
          email: $scope.email,
          password: $scope.password
        }

        $http.post('/api/auth/signup', payload)
          .then(
          (response) => {
            $window.localStorage.setItem('jwtToken', response.data.token)
            $location.path('/#!/')
            $window.location.reload()
          },
          (error) => {
            if (error.status === 409) {
              $scope.errorMessage = error.data.message
            }

            if (error.status === 500) {
              $scope.errorMessage = `An internal server error just occured.
                  Please try again.`
            }
          }
          );
      }
    }]);
