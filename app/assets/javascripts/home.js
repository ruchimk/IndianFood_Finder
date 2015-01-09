//Apple Maps style for Google Maps: https://gist.github.com/bndkn/b421ba760bcb3960b545
var appleMapsStyle = [{
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{
        "color": "#a2daf2"
    }]
}, {
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [{
        "color": "#f7f1df"
    }]
}, {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [{
        "color": "#d0e3b4"
    }]
}, {
    "featureType": "landscape.natural.terrain",
    "elementType": "geometry",
    "stylers": [{
        "visibility": "off"
    }]
}, {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{
        "color": "#bde6ab"
    }]
}, {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{
        "visibility": "off"
    }]
}, {
    "featureType": "poi.medical",
    "elementType": "geometry",
    "stylers": [{
        "color": "#fbd3da"
    }]
}, {
    "featureType": "poi.business",
    "stylers": [{
        "visibility": "off"
    }]
}, {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{
        "visibility": "off"
    }]
}, {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [{
        "visibility": "off"
    }]
}, {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [{
        "color": "#ffe15f"
    }]
}, {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{
        "color": "#efd151"
    }]
}, {
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [{
        "color": "#ffffff"
    }]
}, {
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [{
        "color": "black"
    }]
}, {
    "featureType": "transit.station.airport",
    "elementType": "geometry.fill",
    "stylers": [{
        "color": "#cfb2db"
    }]
}];

//Markers
var markersArray = [];
var resultsArray = [];

//Making map, searchContainer, and activeInfoWindow global
var map, activeInfowindow, startLatLng;
var searchContainer = $("#search-container")[0];

//Adding directions
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

// Initialize map on load.
($(document).ready(function() {
    navigator.geolocation.getCurrentPosition(function(position) {
        startLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
        initialize(position.coords.latitude, position.coords.longitude);
    });
});

//Initialize map centered at browser location; taking in lat long entered by user
function initialize(startingLat, startingLng) {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var mapOptions = {
        center: new google.maps.LatLng(startingLat, startingLng),
        zoom: 12,

        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: appleMapsStyle,

        //Hide Google map controls
        panControl: false,
        streetViewControl:false,

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
    delegateGetDirections()

    // Populate results and map with indian restaurants around user.
    $.get("/search", {
        lat: startingLat,
        lng: startingLng
    }, function(data) {
        parseResults(data);
    });
     directionsDisplay.setMap(map);
};

function delegateGetDirections() {
    $("#map-canvas").on("click", ".getDirections" ,function(){
        var end = $(this).data('location');
        var start = $("#startAddress").val()
        calcRoute(start, end)
    })
}
function calcRoute(start, end) {
    if(!start) {
        var start = startLatLng;
    }
    var request = {
            origin:start,
            destination:end,
            travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(result);
    }
  });
}

//Bind event listeners for each search
//https://developers.google.com/maps/documentation/javascript/examples/
function bindControls() {
    var searchContainer = $("#search-container");
    //AddDomListener is creating an event listener on searchContainer object on submit to execute search function
    google.maps.event.addDomListener(searchContainer, "submit", function(event) {
        event.preventDefault();
        search();
    });
    var searchButton = $("#map-search-submit");
    searchButton.click(function(event) {
        event.preventDefault();
        search();
    });
};

function search() {
    // Empty the arrays to prepare for new results.
    var searchLocation = $("#map-search input").val();
    clearMarkers();

    // Remove any previous results from DOM
    $("#search-results").fadeOut(200, function() {
        $(this).empty();
    });

    // Get ajax request to Google geocoder and parse coordinates
    //https://developers.google.com/maps/documentation/geocoding/
    $.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + searchLocation.split(" ").join("+") + "&key=" + "AIzaSyB9rk_HtKNk4sElLER6i9YARuQb8KbPT4s", function(data) {
        getCoordinates(data);
        map.setCenter({
            lat: data.results[0].geometry.location.lat,
            lng: data.results[0].geometry.location.lng
        })
    });
};

function getCoordinates(data) {
    var geoCoordinates = data.results[0].geometry.location;
    map.get(geoCoordinates);
    $.get("/search", geoCoordinates, function(data) {
        parseResults(data);
    });
};

function parseResults(data) {
    for (var i = 0; i < data.businesses.length; i++) {
        var business = data.businesses[i];
        // Construct HTML for each listing and append to the DOM with fade in effect.
        $("#search-results").append(buildInfoSideTemplate(business, i)).hide().fadeIn(200);
        resultsArray.push(business);
    }
    placeMarkers(resultsArray);
};

function placeMarkers(resultsArray) {
    for (var i = 0; i < resultsArray.length; i++) {
        // If there are coordinates in the Yelp data, use those to place a marker on the map.
        //https://github.com/Yelp/yelp-ruby
        if (resultsArray[i].location.coordinate) {
            var locationCoordinates = resultsArray[i].location.coordinate;
            var coordinates = {
                lat: locationCoordinates.latitude,
                lng: locationCoordinates.longitude
            };

            var marker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,
                map: map,
                position: coordinates,
                title: resultsArray[i].name,
                clickable: true
            });

            // Save the marker object for deletion later.
            markersArray.push(marker);

            //Create InfoWindow for marker
            var infoWindow = buildInfoWindow(marker, resultsArray[i])

            resultsArray[i].marker = marker
            resultsArray[i].infoWindow = infoWindow
        }
    }
};

//  Remove all markers from map by setting them to null.
function clearMarkers() {
    markersArray.forEach(function(marker) {
        marker.setMap(null);
    });
    markersArray = [];
};

function buildInfoWindow (marker, business) {
    var infoWindow = new google.maps.InfoWindow({
        content: buildInfoWindowTemplate(business)
    });
    google.maps.event.addListener(marker, 'click', function() {
        if (activeInfowindow) {
            activeInfowindow.close();
        }
        infoWindow.open(map, marker);
        activeInfowindow = infoWindow;
    });
    return infoWindow;
}

function buildInfoSideTemplate(business, index) {
    return "<div class='search-result'><img src='" + business.image_url +
        "' class='businessImg'><div class='business-name' onclick='openInfoWindow(" + index + ")'>" +
        business.name + "</div>" +
        "<div class='business-address'><div>" +
        business.location.display_address[0] +
        "</div><div>" +
        business.location.display_address[business.location.display_address.length - 1] +
        "</div><div class='phone'><a href='tel:" +
        business.display_phone + "'>Call " + business.display_phone + "</a></div></div>"
}

function buildInfoWindowTemplate(business) {
    return "<div class='search-result-info-window'><img src='" + business.image_url +
        "' class='businessImg'><div class='business-name-url'><a target= '_blank' href='" +
        business.url + "'>" +
        business.name + "</a></div>" +
        "<div class='snippet_text'>" + "Rating:" +
        business.rating + "</div><div>" +
        "<img src='" + business.rating_img_url + "'></div><div>"+
        Number((business.distance * 0.00062).toFixed(2)) +" Miles away" +
         "</div><button class='getDirections' data-location='"+business.location.display_address[0] + " "
         + business.location.display_address[business.location.display_address.length - 1] + "'>Get Directions</button></div>"
}

function openInfoWindow(index) {
    if (activeInfowindow) {
        activeInfowindow.close();
    }
    var marker = resultsArray[index].marker;
    activeInfowindow = resultsArray[index].infoWindow;
    activeInfowindow.open(map, marker);
}

//Used function expressions instead of function declerations because they
//are not hoisted and can be handy when errors are thrown.The console will tell you what the function
// is instead of stating anonymous aka stack trace.
//http://stackoverflow.com/questions/10081593/are-named-functions-or-anonymous-functions-preferred-in-javascript
