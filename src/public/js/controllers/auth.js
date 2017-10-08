angular.module('mean.system')
  .controller('authController', ['$scope', '$location', '$http', '$window',
    function ($scope, $location, $http, $window) {

      $scope.errorMessage = ''

      $scope.signUp = () => {
        const payload = {
          name: $scope.name,
          email: $scope.email,
          password: $scope.password
        }

        $http.post('/api/auth/signup', payload)
          .then(
          (response) => {
            $scope.errorMessage = ''
            $window.localStorage.setItem('token', response.data.token)
            $window.localStorage.setItem('userName', response.data.user.name)
            $location.path('/#!/')
            $scope.loadNotifcations();
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

      $scope.setHttpHeader = () => {
        const token = $window.localStorage.getItem('token')
        $http.defaults.headers.common.Authorization = token;
      };

      $scope.loadNotifcations = () => {
        $scope.setHttpHeader();

        $http.get('/api/notifications')
          .then((reponse) => {
            $scope.allNotifications = response.data;
            $scope.countNotify = response.data.length;
            console.log($scope.allNotifications, $scope.countNotify)
          },
          (error) => {

          });
      }



      $scope.togglePassword = () => {
        $scope.typePassword = !$scope.typePassword;
      }
    }]);
