var markersArray = [];

$(document).ready(function() {
   // Initialize map on load.
  navigator.geolocation.getCurrentPosition(function(position) {
    initialize(position.coords.latitude, position.coords.longitude);
  });
});

var initialize = function() {
  var mapOptions = {
    center: new google.maps.LatLng(37.7577,-122.4376),
    zoom: 14,


    // Move the zoom controls
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
      style: google.maps.ZoomControlStyle.SMALL
    }
  };

  // Create a new Google map with the options above.
  var map = new google.maps.Map($("#map-canvas")[0], mapOptions);

  bindControls(map);
};

//Bind event listeners for search submission
//Find the container for search box and bind event on submit.
var bindControls = function(map){
google.maps.event.addDOMListener(searchContainer, "submit", function(event){
  event.preventDefault();
  search(map);
});

var searchButton = $("map-search-submit")[0];
google.maps.event.addDOMListener(searchButton, "click", function(event){
  event.preventDefault();
  search(map);
});
}
