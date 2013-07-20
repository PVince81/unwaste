(function () {
  'use strict';
  var ICON_TRASH = 'assets/img/trashmark.png',
    ICON_CURRENT_POS = 'assets/img/locmark.png';

  angular.module('uwDirectives', ['uwServices'])

    .directive('imageUpload', [
      function () {
        return {
          replace: true,
          templateUrl: '../templates/image-upload.html',
          scope: {
            height: '@',
            width: '@'
          },
          controller: [
            '$scope',
            function ($scope) {

              function resizeImage(image, width, height) {
                var context;
                var canvas = document.createElement('canvas');
                var scale = width / image.width;
                canvas.width = width;
                canvas.height = height;

                context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, width, image.height * scale);

                return canvas.toDataURL();
              }

              function readFileAsDataURL(path, callback) {
                var reader = new FileReader();
                reader.onload = function (e) {
                  callback(e.target.result);
                };
                reader.readAsDataURL(path);
              }

              function getImageFromDataURL(dataURL, callback) {
                var image = new Image();
                image.onload = function () {
                  callback(image);
                };
                image.src = dataURL;
              }

              function loadImage(url, callback) {
                readFileAsDataURL(url, function (dataURL) {
                  getImageFromDataURL(dataURL, function (image) {
                    callback(resizeImage(image, $scope.width || image.width, $scope.height || image.height));
                  })
                });
              };

              $scope.openFile = function (input) {
                loadImage(input.files[0], function (imageData) {
                  $scope.$apply(function () {

                    $scope.imageData = imageData;

                    $scope.$emit('imageSelected', imageData);
                  })
                });
              };
            }
          ]
        }
      }
    ])

    .directive('mapelement', ['$navigate', '$rootScope', 'gpsData', function ($navigate, $rootScope, gpsData) {
      return {
        link: function (scope, element, attrs) {
          var mapOptions = {
            center: new google.maps.LatLng(-34.397, 150.644),
            zoom: 20,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          var map = new google.maps.Map(element[0], mapOptions),
            currentPosMarker = null;

          gpsData.getGpsData(function (gpsData) {
            var coords = [gpsData.coords.latitude, gpsData.coords.longitude];
            coords = new google.maps.LatLng(coords[0], coords[1]);
            console.log('position changed', gpsData);

            map.setCenter(coords);
            if (!currentPosMarker) {
              currentPosMarker = new google.maps.Marker({
                position: coords,
                map: map,
                title: 'You are here',
                icon: ICON_CURRENT_POS
              });
            }
            else {
              currentPosMarker.setPosition(coords);
            }
          });

          scope.$on('pointsChanged', function ($event, points) {
            console.log('pointsChanged', points);
            _.each(points, function (point) {
              var coords = [point.latitude, point.longitude];
              coords = new google.maps.LatLng(coords[0], coords[1]);
              var marker = new google.maps.Marker({
                position: coords,
                map: map,
                icon: ICON_TRASH
              });
              google.maps.event.addListener(marker, 'click', function() {
                  $rootScope.$apply(function(){
                      $navigate.go('/detail/' + point.id);
                  });
              });
            });
          });
        }
      }
    }]);


}());
