(function () {
  'use strict';


  angular.module('unwaste', [
      'uwServices',
      'uwDirectives',
      'uwController',
      'ngMobile',
      'ajoslin.mobile-navigate'
    ])
    .config([
      '$routeProvider',
      function ($routeProvider) {

        $routeProvider
          .when('/', {templateUrl: '../templates/start.html'})
          .otherwise({redirectTo: '/'});
      }
    ])


})();