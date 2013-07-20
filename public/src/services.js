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
    .service('gpsData', [
        function(){
            var gpsData = null;
            return {
                getGpsData: function(callback, errCallback){
                    if (!gpsData){
                        navigator.geolocation.getCurrentPosition(function(data){
                            gpsData = data;
                            callback(gpsData);
                        }, errCallback);
                    }
                    else{
                        callback(gpsData);
                    }
                }
            }
        }
    ])


}());
