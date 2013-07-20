(function () {
  'use strict';

  function updateMap($scope, gpsData, points){
    if (!gpsData){
        return;
    }
  }

  angular.module('uwController', ['uwServices'])
    .controller('startController', [
      '$scope',
      function ($scope) {

      }
    ])
    .controller('spotController', [
      '$scope', '$http',
      function ($scope, $http) {

        function success(data) {

          $http.post('/api/wastepoint', {
            latitude: data.coords.latitude,
              longitude: data.coords.longitude,
              timestamp: Date.now()
          }).success(function () {

            console.log(data);

          });

        }

        function error(err) {
          if (err.code == 1) {
            alert('You need to allow location access to use Unwaste');
          }
        }

        navigator.geolocation.getCurrentPosition(success, error);

      }

    ])
    .controller('discoverController', [
      '$scope', '$http', 'gpsData',
      function ($scope, $http, gpsData) {
        function error(err) {
          if (err.code == 1) {
            alert('You need to allow location access to use Unwaste');
          }
        }
        function success(gpsData){
            var url = '/api/wastepoint?latitude=' + gpsData.coords.latitude + '&longitude=' + gpsData.coords.longitude;
            $scope.gpsData = gpsData;
            $http.get(url).success(function (data) {
              angular.extend($scope, {
                  center: {
                      latitude: gpsData.coords.latitude, // initial map center latitude
                      longitude: gpsData.coords.longitude, // initial map center longitude
                  },
                  markers: [], // an array of markers,
                  zoom: 8, // the zoom level
              });
              console.log('points loaded:', data);

              $scope.wastepoints = data;
              $scope.$broadcast('pointsChanged', data);
            });
        };
        gpsData.getGpsData(success, error);
      }
    ])
    .controller('loginController', [
      '$scope', '$http', '$navigate', 'user',
      function ($scope, $http, $navigate, user) {

        $scope.registerUser = function () {

          $http.post('/api/register', { login: $scope.login, pw: $scope.pw})
            .error(function () {
              console.log(arguments);
            })
            .success(function (response) {
              if (response.success) {
                $scope.successMessage = 'Der Benutzer wurde erfolgreich angelegt';
              } else {
                $scope.errorMessage = response.error || 'Ein Fehler ist aufgetreten!';
              }
            })
        }

        $scope.loginUser = function (url) {

          $http.post('/api/authenticate', { login: $scope.login, pw: $scope.pw})
            .error(function () {
              console.log(arguments);
            })
            .success(function (response) {
              if (response.success) {

                user.login({
                  uid: response.uid,
                  name: $scope.login
                });

                $navigate.go('/');
              } else {
                $scope.errorMessage = response.error || 'Ein Fehler ist aufgetreten!';
              }
            });

          return false;
        }
      }
    ])
    .controller('mapController', [
        '$scope', 'gpsData',
        function($scope, gpsData) {

        }
    ])

}());
