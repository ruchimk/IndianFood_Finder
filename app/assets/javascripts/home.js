//https://gist.github.com/bndkn/b421ba760bcb3960b545
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

//All the markers
var markersArray = [];
var resultsArray = [];

//Making map, searchContainer, and activeInfoWindow global
var map;
var searchContainer = $("#search-container")[0];
var activeInfowindow;


// Initialize map on load.
$(document).ready(function() {
    navigator.geolocation.getCurrentPosition(function(position) {
        initialize(position.coords.latitude, position.coords.longitude);
    });
});

//Initialize map centered at SF; taking in lat long entered by user
var initialize = function(startingLat, startingLng) {
    var mapOptions = {
        center: new google.maps.LatLng(startingLat, startingLng),
        zoom: 10,

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

    // Populate results and map with indian restaurants around user.
    $.post("/search", {
        lat: startingLat,
        lng: startingLng
    }, function(data) {
        parseResults(data);
    });
};

//Bind event listeners for each search
//https://developers.google.com/maps/documentation/javascript/examples/
var bindControls = function() {
    //Find the container for search and bind event on submit.
    var searchContainer = $("#search-container");
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

var search = function() {
    // Empty the arrays to prepare for new results.
    var searchLocation = $("#map-search input").val();
    clearMarkers();

    // Remove any previous results from DOM
    $("#search-results").fadeOut(200, function() {
        $(this).empty();
    });

    // POST ajax request to Google geocoder and parse coordinates
    //https://developers.google.com/maps/documentation/geocoding/
    $.post("https://maps.googleapis.com/maps/api/geocode/json?address=" + searchLocation.split(" ").join("+") + "&key=" + "AIzaSyB9rk_HtKNk4sElLER6i9YARuQb8KbPT4s", function(data) {
        getCoordinates(data);
        map.setCenter({
            lat: data.results[0].geometry.location.lat,
            lng: data.results[0].geometry.location.lng
        })
    });

};

var getCoordinates = function(data) {
    var geoCoordinates = data.results[0].geometry.location;
    map.get(geoCoordinates);

    $.post("/search", geoCoordinates, function(data) {
        parseResults(data);
        console.log(data);
    });
};

var parseResults = function(data) {
    for (var i = 0; i < data.businesses.length; i++) {
        var business = data.businesses[i];
        // Construct HTML for each listing and append to the DOM with fade in effect.
        $("#search-results").append(buildInfoSideTemplate(business, i)).hide().fadeIn(200);
        resultsArray.push(business);
    }
    placeMarkers(resultsArray);
};

var placeMarkers = function(resultsArray) {
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
                title: resultsArray[i].name
            });

            // Save the marker object for deletion later.
            markersArray.push(marker);

            //Create InfoWindow for marker
            var infoWindow = buildInfoWindow(marker, resultsArray[i])
            resultsArray[i].infoWindow = infoWindow
            resultsArray[i].marker = marker
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

var buildInfoWindow = function(marker, business) {
    var infoWindow = new google.maps.InfoWindow({
        content: '<p id="hook">' + buildInfoWindowTemplate(business) + '</p>' //need to append function 'buildInfoWindowTemplate(business)' in p tags to style infowindow;http://stackoverflow.com/questions/5634991/styling-google-maps-infowindow
    });

    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(map, marker);
        var l = $('#hook').parent().parent().parent().siblings();
        for (var i = 0; i < l.length; i++) {
            if ($(l[i]).css('z-index') == 'auto') {
                $(l[i]).css('border-radius', '16px 16px 16px 16px');
                $(l[i]).css('border', '2px solid red');
            }
        }
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
        "</div></div>" +
        business.phone +
        "</div>"
}

function buildInfoWindowTemplate(business) {
    return "<div class='search-result-info-window'><img src='" + business.image_url +
        "' class='businessImg'><div class='business-name-url'><a target= '_blank' href='" +
        business.url + "'>" +
        business.name + "</a></div>" +
        "<div class='snippet_text'>" +
        business.snippet_text + "</div><div>" +
        "<img src='" + business.rating_img_url + "'></div></div>"
}

function openInfoWindow(index) {
    if (activeInfowindow) {
        activeInfowindow.close();
    }
    var marker = resultsArray[index].marker;
    activeInfowindow = resultsArray[index].infoWindow;
    activeInfowindow.open(map, marker)
}
