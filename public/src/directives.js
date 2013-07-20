(function () {
  'use strict';
  var ICON_TRASH = 'assets/img/trashmark.png',
      ICON_CURRENT_POS = 'assets/img/locmark.png';

  angular.module('uwDirectives', ['uwServices'])
    .directive('mapelement', ['gpsData', function(gpsData){
        return {
            link: function(scope, element, attrs){
                var mapOptions = {
                      center: new google.maps.LatLng(-34.397, 150.644),
                      zoom: 20,
                      mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var map = new google.maps.Map(element[0], mapOptions),
                    currentPosMarker = null;

                gpsData.getGpsData(function(gpsData){
                    var coords = [gpsData.coords.latitude, gpsData.coords.longitude];
                    coords = new google.maps.LatLng(coords[0], coords[1]);
                    console.log('position changed', gpsData);

                    map.setCenter(coords);
                    if (!currentPosMarker){
                        currentPosMarker = new google.maps.Marker({
                              position: coords,
                              map: map,
                              title: 'You are here',
                              icon: ICON_CURRENT_POS
                          });
                    }
                    else{
                        currentPosMarker.setPosition(coords);
                    }
                });

                scope.$on('pointsChanged', function($event, points){
                    console.log('pointsChanged', points);
                    _.each(points, function(point){
                        var coords = [point.latitude, point.longitude];
                        coords = new google.maps.LatLng(coords[0], coords[1]);
                        new google.maps.Marker({
                              position: coords,
                              map: map,
                              icon: ICON_TRASH
                          });
                    });
                });
            }
        }
    }]);

}());
