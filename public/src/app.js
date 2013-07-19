(function () {
  'use strict';


  angular.module('unwaste', [
      'uwServices',
      'uwDirectives',
      'uwController',
      'ngResource',
      'ngMobile',
      'ajoslin.mobile-navigate'
    ])
    .config([
      '$routeProvider',
      function ($routeProvider) {

        $routeProvider
          .when('/', {
            templateUrl: '../templates/start.html',
            controller: 'startController',
            transition: 'slide'
          })
          .when('/discover', {
            templateUrl: '../templates/discover.html',
            transition: 'slide'
          })
          .when('/spot', {
            templateUrl: '../templates/spot.html',
            transition: 'slide'
          })
          .otherwise({redirectTo: '/'});
      }
    ])
    .run([
      '$rootScope', '$navigate',
      function ($rootScope, $navigate) {

        $rootScope.$navigate = $navigate;

      }
    ])


})();