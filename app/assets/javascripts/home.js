var markersArray = [];
//https://gist.github.com/bndkn/b421ba760bcb3960b545
var appleMapsStyle = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#a2daf2"}]},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"color":"#f7f1df"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#d0e3b4"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#bde6ab"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"geometry","stylers":[{"color":"#fbd3da"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffe15f"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efd151"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"black"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#cfb2db"}]}];

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
