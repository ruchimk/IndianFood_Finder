# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

var markersArray = [];
var inactive = false;

$(document).ready(function() {
  // Initialize map on load.
  navigator.geolocation.getCurrentPosition(function(position) {
    initialize(position.coords.latitude, position.coords.longitude);
  });
});

var initialize = function(startingLat, startingLng) {
  var mapOptions = {
    center: new google.maps.LatLng(startingLat, startingLng),
    zoom: 12,

    // Hide Google map controls
    panControl: false,
    streetViewControl: false,

    // Move the zoom controls
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
      style: google.maps.ZoomControlStyle.SMALL
    }
  };

  // Create a new Google map with the options above.
  var map = new google.maps.Map($("#map-canvas")[0], mapOptions);
};
