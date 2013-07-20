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
          .when('/detail/:id', {
            templateUrl: '../templates/detail.html',
            transition: 'slide'
          })
          .when('/spot', {
            templateUrl: '../templates/spot.html',
            transition: 'slide'
          })
          .when('/login', {
            templateUrl: '../templates/login.html',
            transition: 'slide'
          })
          .otherwise({redirectTo: '/'});
      }
    ])
    .run([
      '$rootScope', '$location', '$navigate', 'user',
      function ($rootScope, $location, $navigate, user) {

        $rootScope.$navigate = $navigate;

        if(!user.isLoggedIn()) {
          $location.path('/login');
        } else {
          $rootScope.$user = user.getData();
          console.log($rootScope.$user);
        }
      }
    ])

})();
