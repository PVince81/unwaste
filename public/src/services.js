(function () {
  'use strict';

  angular.module('uwServices', ['ngResource'])

    .constant('serverUrl', 'http://localhost\\:300')

    .service('wastePoint', [
      '$resource',
      function ($resource, serverUrl) {
        return $resource(serverUrl + '/api/wastepoint', {}, {
          save: {method: 'POST'}
        });
      }
    ])

    .factory('user', [
      '$window', '$rootScope',
      function ($window, $rootScope) {
        var user;

        function getUser() {
          var storage = $window.localStorage.getItem('user');
          if (storage) {
            user = JSON.parse(storage);
          }
        }

        getUser();

        return {
          login: function (user) {
            user = {
              uid: user.uid,
              name: user.name
            };
            $window.localStorage.setItem('user', JSON.stringify(user));
            $rootScope.user = user;
          },

          getUserId: function () {
            return user && user.uid;
          },

          getUserName: function () {
            return user && user.name;
          },

          getData: function () {
            return user;
          },

          isLoggedIn: function () {
            return user && user.uid !== null;
          }
        };
      }
    ])


}());