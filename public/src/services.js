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


}());