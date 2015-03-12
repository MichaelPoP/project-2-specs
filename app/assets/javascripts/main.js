var result, map, Lat, Lng, myLatLng, latitude, longitude, city, state, neighborhood, weather, wuCity, wuNeighborhood, wuStationID, placesArray = [], placesMarker;

function initialize() {
  var markers = [];
  var rendererOptions = {
    draggable: true
  };
  var mapOptions = {
    zoom: 7,
    center: new google.maps.LatLng(37.7749300 , -122.4194200),
    panControl: true,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    overviewMapControl: true
  }; 

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var featureStyle = {
    clickable: true,
    fillColor: 'green',
    strokeColor: '#E9DBE8',
    strokeWeight: 1,
    fillOpacity: 0.3
  };
  map.data.setStyle(featureStyle); 
  map.data.addListener('mouseover', function(event) {
   map.data.overrideStyle(event.feature, {fillColor: 'red'});
   document.getElementById('info-box').textContent = event.feature.getProperty('NAME');
 });
  map.data.addListener('mouseout', function(event) {
   map.data.overrideStyle(event.feature, {fillColor: 'green'});
 });
  map.data.addListener('click', function(event) {
   event.feature.setProperty({fillColor: 'gold'});
   // map.setZoom(14);
 });
}  //END OF INTIALIZE FUNCTION

google.maps.event.addDomListener(window, 'load', initialize);

$(document).ready(function() {

  $("#search-input").submit(function(e) {
    e.preventDefault();
    city = $("#city").val();
    state = $("#state").val();
    // neighborhood = $("#neighborhood").val();
    
    mapCall();
    clearData();
    hoodBounds();
  });

  $("#hoods").on("click", "#neighborhood", function(e) {
    e.preventDefault();
    neighborhood = $(this).text();
    console.log(neighborhood);
    var clickLocation = $(this).text().split(' ').join('+') + "+" + city.split(' ').join('+');
    result = encodeURI("https://maps.googleapis.com/maps/api/geocode/json?address=" + clickLocation +  "&key=AIzaSyDE6F79FbnrSc9hZlurECTyBJoEyHCj-Nc&z=15");
    $.getJSON(result, function(clickData) {
          latitude = clickData.results[0].geometry.location.lat; // json result stored in variable
          longitude = clickData.results[0].geometry.location.lng;
          console.log(latitude + " " + longitude);
          map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
          map.setCenter(new google.maps.LatLng(latitude,longitude));
          map.setZoom(15);
          console.log(latitude);      
        }).done(
        function() {
          console.log("DONE FUNCTION HIT!!!");
          console.log(latitude);
          startAPICalls();
          initPlaces();
        }); //end done function
      }); //end click listener

function hoodBounds() {
  $.getJSON('/CaliZillowSimp.json', function(hoods) {
    for (i = 0; i < hoods.features.length; i++) {
      if (city == hoods.features[i].properties.CITY) {
        $("#hoods").append("<li><a id='neighborhood' href='javascript:void(0)'>" + hoods.features[i].properties.NAME + "</a></li>");
        $.post('/save',  {
          name: hoods.features[i].properties.NAME,
          city: hoods.features[i].properties.CITY,
          state: hoods.features[i].properties.STATE
        });
      }
    }
    map.data.addGeoJson(hoods);
  }); 
}

function mapCall() {
  var location = city + "+" + state;
  var url = encodeURI("https://maps.googleapis.com/maps/api/geocode/json?address=" + location + "&key=AIzaSyDE6F79FbnrSc9hZlurECTyBJoEyHCj-Nc");
    // getJSON function below to retrieve the lat/lng from google's geocode api
    $.getJSON(url, function(data) {
      var Lat = data.results[0].geometry.location.lat; // json result stored in variable
      var Lng = data.results[0].geometry.location.lng; // json result stored in variable
      map.panTo(new google.maps.LatLng(Lat,Lng));
      map.setZoom(12);
    });
  }

  function clearData() {
    $("#hoods").empty();
    $("#city-summary").empty();
    $("#people").empty();
    $("#characteristics").empty();
    $("#ages").empty();
    $("#kids").empty();
    $("#relationships").empty();
    $("#charts").empty();
  }

  function startAPICalls() {
    var url = "/search.json";
    $.getJSON(url, {city:city, state:state, neighborhood:neighborhood}, function(data) {
      zillow = data.zillowData;
      weather = data.weatherData.location.nearby_weather_stations.pws.station;
      zillowAPIData();
      // findWUStation();
      // weatherCall();

    });
  }

  function findWUStation() {
    for (i = 0; i < weather.length; i++) {
      wuCity = weather[i].city.toLowerCase();
      wuNeighborhood = weather[i].neighborhood.toLowerCase();
      if (wuNeighborhood.indexOf(neighborhood.toLowerCase()) !== -1) {
        wuStationID = weather[i].id;
        console.log(wuCity + " " + wuNeighborhood + " " + wuStationID);

        break;
      }
    }
  }

  function weatherCall() {
    console.log(wuStationID);
    var wuURL = "https://api.wunderground.com/api/acf7fb055f9d4a5d/conditions/q/pws:" + wuStationID + ".json";
    $.getJSON(wuURL, function(data) {
      weather = data.current_observation;
      $("#weather").append("<p>Current Temperature: " + weather.temperature_string + "</p>");
      $("#weather").append("<p>Current Temperature: " + weather.feelslike_string + "</p>");
      $("#weather").append("<p><img src='" + weather.icon_url + "'></p>");
      $("#weather").append("<p>" + weather.icon + "</p>");
      $("#weather").append("<p>" + weather.weather + "</p>");
      $("#weather").append("<p>" + weather.wind_dir + "</p>");
      $("#weather").append("<p>" + weather.wind_gust_mph + "</p>");
      $("#weather").append("<p>" + weather.wind_gust_kph + "</p>");
      $("#weather").append("<p>" + weather.wind_dir + "</p>");
      $("#weather").append("<p>Powered by<img src='" + weather.image.url + "'></p>");
    });
  }

  function zillowAPIData() {
    console.log(zillow);
    var livesHere = zillow.demographics.response.pages.page[2].segmentation.liveshere;
    $("#city-summary").append("<h5>Summary</h5>");
    for (i = 0; i < livesHere.length; i++) {
      $("#city-summary").append("<p>" + livesHere[i].title + "</p>");    
      $("#city-summary").append("<p>" + livesHere[i].description + "</p>");
    }
    var charts = zillow.demographics.response.charts.chart;
    for (i = 0; i < charts.length; i++) {
      $("#charts").append("<h5>" + charts[i].name + "</h5>");
      $("#charts").append("<div><img src=" + charts[i].url + "></div>");
    }
    var people = zillow.demographics.response.pages.page[2].tables.table[0].data.attribute;
    $("#people").append(zillow.demographics.response.pages.page[2].tables.table[0].name);
    for (i = 0; i < people.length; i++) {
      // People data
      $("#people").append("<li>" + people[i].name + "</li>");
      $("#people").append("<p>" + people[i].values.neighborhood.value + "</p>");
    }
    var ages = zillow.demographics.response.pages.page[2].tables.table[1];
    $("#ages").append("<li>" + ages.name + "</li>");
    for (i = 0; i < ages.data.attribute.length; i++) {
      $("#ages").append("<li>" + ages.data.attribute[i].name + "</li>");
      $("#ages").append("<p>" + ages.data.attribute[i].value + "</p>");
    }
    var kids = zillow.demographics.response.pages.page[2].tables.table[3];
    $("#kids").append("<li>" + kids.name + "</li>");
    for (i = 0; i < kids.data.attribute.length; i++) {
      $("#kids").append("<p>" + kids.data.attribute[i].name + "</p>");
      $("#kids").append("<p>" + kids.data.attribute[i].value + "</p>");
    }
    var relationships = zillow.demographics.response.pages.page[2].tables.table[4];
    $("#relationships").append("<li>" + relationships.name);
    for (i = 0; i < relationships.data.attribute.length; i++) {
      $("#relationships").append("<p>" + relationships.data.attribute[i].name + "</p>");
      $("#relationships").append("<p>" + Math.round(100 * relationships.data.attribute[i].value) + "%</p>");
    }
    var characteristics = zillow.demographics.response.pages.page[2].uniqueness.category;
    $("#characteristics").append("<h5>Neighborhood Characteristics</h5>");
    for (i = 0; i < characteristics.length; i++) {
      $("#characteristics").append("<tr>");
      $("#characteristics").append("<th>" + characteristics[i].type + "</th>");
      $("#characteristics").append("</tr>");
      for (n = 0; n < characteristics[i].characteristic.length; n++) {
        $("#characteristics").append("<tr>");
        $("#characteristics").append("<th>" + characteristics[i].type + "</th>");
        $("#characteristics").append("</tr>");
        for (n = 0; n < characteristics[i].characteristic.length; n++) {
          $("#characteristics").append("<tr>");
          $("#characteristics").append("<td>" + characteristics[i].characteristic[n] + "</td>");
          $("#characteristics").append("</tr>");
        }
      }
    }
  }






// function addMarker() {
//   var myLatlng = new google.maps.LatLng(startLat, startLng);
//   var mapOptions = {
//     zoom: 15,
//     center: myLatlng
//   };
//   // var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
//   var marker = new google.maps.Marker({
//     draggable: true,
//     animation: google.maps.Animation.DROP,
//     position: myLatlng,
//     icon: "map_marker_start.png"
//   });


//   // To add the marker to the map, call setMap();
//   marker.setMap(map);
//   // Event listener for click on the marker to invoke bouncing animation on marker
//   google.maps.event.addListener(marker, 'click', toggleBounce);
//   // Event listener to load Places results
//   google.maps.event.addListener(marker, "dblclick", initPlaces);

//   google.maps.event.addListener(map, 'click', function(event) {
//     clickAddMarker(event.latLng);
//   });
function initPlaces() {
  console.log("check!");
  console.log(result);
  // console.log(results);
  console.log(latitude);
  console.log(longitude);
  var loc = new google.maps.LatLng(latitude,longitude);
  var request = {
    location: loc,
    radius: 1000,
    types: ["bar", "restaurant"]
  };
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, markPlaces);
  markPlaces();
}  

function markPlaces(result, status) {
    // $(".placesList").css("visibility", "visible");
    // $(".listItems").empty();
    console.log(result);
    console.log(status);
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var x = 0; x < placesArray.length; x++) {
        placesArray[x].setMap(null);
      }
      placesArray = [];
      for (var i = 0; i < result.length; i++) {
        var position = new google.maps.LatLng(result[i].geometry.location.k, result[i].geometry.location.D);
        var gpmarker = new google.maps.MarkerImage(result[i].icon, null, null, null, new google.maps.Size(25, 25));
        placesMarker = new google.maps.Marker({
          map: map,
          icon: gpmarker,
          title: result[i].name,
          position: position,
          draggable: false,
        });
        var placeTitle = result[i].name;
        var placeImage = result[i].icon;
        var placeRating = result[i].rating;
        var placeVicinity = result[i].vicinity;
        placesArray.push(placesMarker);
        infowindow = new google.maps.InfoWindow({
          content: result[i].name
        });
        google.maps.event.addListener(placesMarker, 'click', openInfoWindow);
        $(".listItems").append("<div class='item'><img class='placesMarker' src='" + placeImage + "'><h4>" + placeTitle + "</h4><p>Address: " + placeVicinity + "</p><p>Rating: " + placeRating + "</p></div>");
      }
    } else {
      $(".listItems").append("<div class='item'>Nothing nearby! Try another location!</div>");
    }
    // $(".instructPanel > img").attr("src", "map_places_marker_bar.png");
    // $(".instructPanel > div").text("Info about the places marked can be seen in the panel on the right!");
  }
  console.log(placesArray);


});
