(function () {
  'use strict';

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
            alert('Um unwaste zu nutzen musst den Zugriff auf deinen Standort erlauben');
          }
        }

        navigator.geolocation.getCurrentPosition(success, error);

      }

    ])
    .controller('discoverController', [
      '$scope', '$http',
      function ($scope, $http) {

        $http.get('/api/wastepoint').success(function (data) {

          console.log(data);

          $scope.wastepoints = data;

        })

      }
    ])

}());