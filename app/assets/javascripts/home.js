var markersArray = [];
var resultsArray = [];
//https://gist.github.com/bndkn/b421ba760bcb3960b545
var appleMapsStyle = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#a2daf2"}]},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"color":"#f7f1df"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#d0e3b4"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#bde6ab"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"geometry","stylers":[{"color":"#fbd3da"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffe15f"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efd151"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"black"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#cfb2db"}]}];
var map;
var searchContainer = $("#search-container")[0];


$(document).ready(function() {
   // Initialize map on load.
  navigator.geolocation.getCurrentPosition(function(position) {
    initialize(position.coords.latitude, position.coords.longitude);
  });
});

var initialize = function(startingLat, startingLng) {
  var mapOptions = {
    center: new google.maps.LatLng(37.7577,-122.4376),
    zoom: 13,

    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: appleMapsStyle,

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
  map = new google.maps.Map($("#map-canvas")[0], mapOptions);

  bindControls();

   // Populate results and map with indian restaurants around SF.
  $.post("/search", { lat: startingLat, lng: startingLng }, function(data) {
    parseResults(data);
  });
};

//Bind event listeners for each search

var bindControls = function(){
  //Find the container for search box and bind event on submit.
var searchContainer = $("#search-container")[0];
google.maps.event.addDomListener(searchContainer, "submit", function(event) {
  event.preventDefault();
  search();
});

var searchButton = $("map-search-submit")[0];
google.maps.event.addDomListener(searchButton, "click", function(event){
  event.preventDefault();
  search();
});
}

var search = function() {
  // Empty the arrays to prepare for new results.
  var resultsArray = [];
  var searchLocation = $("#map-search input").val();
  clearMarkers();

  // Remove any previous results from DOM
  $("#results").fadeOut(400, function() {
    $(this).empty();
  });

  // POST ajax request to Google geocoder and parse coordinates
  $.post("https://maps.googleapis.com/maps/api/geocode/json?address=" + searchLocation.split(" ").join("+") + "&key=" + Api_key, function(data) {
     getCoordinates(data);
  });

};

var getCoordinates = function(data) {
  var geoCoordinates = data.results[0].geometry.location;
  map.get(geoCoordinates);

  $.post("/search", geoCoordinates, function(data) {
    parseResults.log(data);
  });
};

var parseResults = function(data) {
  for (var i=0; i < data.businesses.length; i++) {
    var business = data.businesses[i];

    // Construct HTML for each listing and append to the DOM with fade in effect.
    $("#search-results").append("<div class='result'><img src='" + business.image_url +
      "'><div class='business-name'><a target= '_blank' href='" +
      business.url +"'>" +
      business.name + "</a></div>" +
      "<div class='business-address'><div>" +
      business.location.display_address[0] +
      "</div><div>" +
      business.location.display_address[business.location.display_address.length - 1] +
      "</div></div></div>").hide().fadeIn(400);

    resultsArray.push(business);
  }

  placeMarkers(resultsArray);
};

var placeMarkers = function(resultsArray) {
  for (var i=0; i<resultsArray.length; i++) {

    // If there are coordinates in the Yelp data, use those to place a marker on the map.
    if (resultsArray[i].location.coordinate) {
      var locationCoordinates = resultsArray[i].location.coordinate;
      var coordinates = { lat: locationCoordinates.latitude, lng: locationCoordinates.longitude };

      var marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        map: map,
        position: coordinates,
        title: resultsArray[i].name
      });

      // Save the marker object for deletion later.
      markersArray.push(marker);
    }
  }
};

//  Remove all markers from map by setting them to null.
var clearMarkers = function() {
  markersArray.forEach(function(marker) {
    marker.setMap(null);
  });

  markersArray = [];
};
