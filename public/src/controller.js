(function () {
  'use strict';

  angular.module('uwController', [])
    .controller('startController', [
      '$scope', '$navigate',
      function ($scope, $navigate) {

        $scope.$navigate = $navigate;


      }
    ]);

}());