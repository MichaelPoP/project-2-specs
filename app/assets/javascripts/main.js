var result, map, Lat, Lng, myLatLng, latitude, longitude, city, state, neighborhood, weather, wuCity, wuNeighborhood, wuStationID, placesArray = [], placesMarker, mapClickHood;

function initialize() {
  $("#map-canvas").empty();
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
    overviewMapControl: true,
    disableDoubleClickZoom: true,
    mapTypeControlOptions: {
    mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    }
  }; 


  var styleArray = 
    [
    {
        "featureType": "administrative.locality",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#2c2e33"
            },
            {
                "saturation": 7
            },
            {
                "lightness": 19
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#ffffff"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 100
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#ffffff"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 100
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#bbc0c4"
            },
            {
                "saturation": -93
            },
            {
                "lightness": 31
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [
            {
                "hue": "#bbc0c4"
            },
            {
                "saturation": -93
            },
            {
                "lightness": 31
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels",
        "stylers": [
            {
                "hue": "#bbc0c4"
            },
            {
                "saturation": -93
            },
            {
                "lightness": -2
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#e9ebed"
            },
            {
                "saturation": -90
            },
            {
                "lightness": -8
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#e9ebed"
            },
            {
                "saturation": 10
            },
            {
                "lightness": 69
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#e9ebed"
            },
            {
                "saturation": -78
            },
            {
                "lightness": 67
            },
            {
                "visibility": "simplified"
            }
        ]
    }
  ];

var styledMap = new google.maps.StyledMapType(styleArray,
    {name: "Styled Map"});
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');
  var featureStyle = {
    clickable: true,
   fillColor: '#33cc33',
   strokeColor: '#336633',
   strokeWeight: 0.3,
   fillOpacity: 0.2
  };

  map.data.setStyle(featureStyle); 
  map.data.addListener('mouseover', function(event) {
   map.data.overrideStyle(event.feature, {fillColor: '#ffffff'}); // update
   document.getElementById('info-box').textContent = event.feature.getProperty('NAME');
  });
  map.data.addListener('mouseout', function(event) {
   map.data.overrideStyle(event.feature, {fillColor: '#33cc33'});
  });
  map.data.addListener('click', function(event) {
        // startAPICalls();
        // initPlaces();
        // map.setZoom(13);
        mapClickHood = event.feature.k.NAME;  
  });
  map.data.addListener('dblclick', function(event) {
   // event.feature.setProperty({fillColor: 'gold'});
    placeMarker(event.latLng);
  });
  function placeMarker(location) {
  var image = 'STAR.png';
  var marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: image
  });

  map.setCenter(location);
  }
}  //END OF INTIALIZE FUNCTION

google.maps.event.addDomListener(window, 'load', initialize);

$(document).ready(function() {

  $('#myModal').on('shown.bs.modal', function () {
    $('#myInput').focus();
  });

  function clearData() {
    $("#city-summary").empty();
    $("#people").empty();
    $("#characteristics").empty();
    $("#ages").empty();
    $("#kids").empty();
    $("#relationships").empty();
    $("#charts").empty();
    $("#weather").empty();
  }

  $("#search-input").submit(function(e) {
    e.preventDefault();
    $(".info-div").removeClass("overflow");
    $(".hood-div").addClass("overflow");
    $("#hoods").empty();
    city = $("#city").val();
    state = $("#state").val();
    mapCall();
    clearData();

    if (state == "CA") {
    hoodBounds('/CaliZillowSimp.json');
    } else if (state == "CO") {
    hoodBounds('/ZillowColorado2.json');
    } else if (state == "NY") {
    hoodBounds('/ZillowNewYork.json');
    }
  });
  
  $("#map-canvas").on("click", function(e) {
    e.preventDefault();
    $(".fav").show();
    neighborhood = mapClickHood;
    console.log(mapClickHood);
    var clickLocation = mapClickHood.split(' ').join('+') + "+" + city.split(' ').join('+');
    console.log(clickLocation);
    result = encodeURI("https://maps.googleapis.com/maps/api/geocode/json?address=" + clickLocation +  "&key=AIzaSyDE6F79FbnrSc9hZlurECTyBJoEyHCj-Nc&z=15");
    $.getJSON(result, function(clickData) {
          latitude = clickData.results[0].geometry.location.lat; // json result stored in variable
          longitude = clickData.results[0].geometry.location.lng;
          console.log(latitude + " " + longitude);
          // map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
          map.setCenter(new google.maps.LatLng(latitude,longitude));
          // map.setZoom(13);
          console.log(latitude);      
        }).done(
        function() {
          console.log("DONE FUNCTION HIT!!!");
          console.log(latitude);
          startAPICalls();
          initPlaces();
        }); //end done function
  }); //end click listener
  $("#hoods").on("click", "#neighborhood", function(e) {
    e.preventDefault();
    $(".fav").show();
    $(".info-div").addClass("overflow");
    neighborhood = $(this).text();
    var clickLocation = $(this).text().split(' ').join('+') + "+" + city.split(' ').join('+');
    result = encodeURI("https://maps.googleapis.com/maps/api/geocode/json?address=" + clickLocation +  "&key=AIzaSyDE6F79FbnrSc9hZlurECTyBJoEyHCj-Nc&z=15");
    $.getJSON(result, function(clickData) {
          latitude = clickData.results[0].geometry.location.lat; // json result stored in variable
          longitude = clickData.results[0].geometry.location.lng;
          console.log(latitude + " " + longitude);
          // map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
          map.setCenter(new google.maps.LatLng(latitude,longitude));
          map.setZoom(13);
          console.log(latitude);      
        }).done(
        function() {
          console.log("DONE FUNCTION HIT!!!");
          console.log(latitude);
          startAPICalls();
          initPlaces();
          checkFav();
        }); //end done function
  }); //end click listener
function hoodBounds(url) {
  $.getJSON(url, function(hoods) {
    map.data.forEach(function(feature) {
        //If you want, check here for some constraints.
        map.data.remove(feature);

    });
    for (i = 0; i < hoods.features.length; i++) {
      if (city == hoods.features[i].properties.CITY) {
        $("#hoods").append("<a id='neighborhood' href='javascript:void(0)'>" + hoods.features[i].properties.NAME + "</a><br />");
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

  function startAPICalls() {
    var url = "/search.json";
    $.getJSON(url, {city:city, state:state, neighborhood:neighborhood}, function(data) {
      zillow = data.zillowData;
      console.log(zillow);
      weather = data.weatherData.location.nearby_weather_stations.pws.station;
      // zillowAPIData();
      // findWUStation();
      // weatherCall();
    });
  }

  // function findWUStation() {
  //   for (i = 0; i < weather.length; i++) {
  //     wuCity = weather[i].city.toLowerCase();
  //     wuNeighborhood = weather[i].neighborhood.toLowerCase();
  //     if (wuNeighborhood.indexOf(neighborhood.toLowerCase()) !== -1) {
  //       wuStationID = weather[i].id;
  //       console.log(wuCity + " " + wuNeighborhood + " " + wuStationID);
  //       break;
  //     }
  //   }
  // }

  // function weatherCall() {
  //   if (!wuStationID) {
  //     $("#weather").append("<p class='bolded'> Weather Info</p>");
  //     $("#weather").append("<p>No weather stations for this neighborhood!</p>");
  //   } else {
  //     var wuURL = "https://api.wunderground.com/api/acf7fb055f9d4a5d/conditions/q/pws:" + wuStationID + ".json";
  //     $.getJSON(wuURL, function(data) {
  //       weather = data.current_observation;
  //       $("#weather").append("<p class='bolded'> Weather Info</p>");
  //       $("#weather").append("<p>Current Temperature: " + weather.temperature_string + "</p>");
  //       $("#weather").append("<p><img src='" + weather.icon_url + "'></p>");
  //       $("#weather").append("<p>" + weather.weather + "</p>");
  //       $("#weather").append("<p>Wind direction: " + weather.wind_dir + "</p>");
  //       $("#weather").append("<p>Wind speed: " + weather.wind_gust_mph + "</p>");
  //     });
  //   }
  // }

  function zillowAPIData() {
    
    clearData();

    var livesHere = zillow.demographics.response.pages.page[2].segmentation.liveshere;
    $("#city-summary").append("<p class='bolded'> Resident Psychographics</p>");
    for (i = 0; i < livesHere.length; i++) {
      $("#city-summary").append("<p><i>" + livesHere[i].title + "</i></p>");
      $("#city-summary").append("<p>" + livesHere[i].description + "</p>");
    }
    
    var people = zillow.demographics.response.pages.page[2].tables.table[0].data.attribute;
    console.log(people);
    $("#people").append("<p class='bolded'> Resident Demographics</p>");
      $("#people").append("<p><i>" + people[0].name + "</i><p>");
      $("#people").append("<p>$" + Math.round(people[0].values.neighborhood.value) + "</p>");
      $("#people").append("<p><i>" + people[1].name + "</i><p>");
      $("#people").append("<p>" + (people[1].values.neighborhood.value * 100).toFixed(2) + "%</p>");
      $("#people").append("<p><i>" + people[2].name + "</i><p>");
      $("#people").append("<p>" + (people[2].values.neighborhood.value * 100).toFixed(2) + "%</p>");
      $("#people").append("<p><i>" + people[3].name + "</i><p>");
      $("#people").append("<p>" + (people[3].values.neighborhood.value) + "</p>");
      $("#people").append("<p><i>" + people[4].name + "</i><p>");
      $("#people").append("<p>" + (people[4].values.neighborhood.value * 100).toFixed(2) + "%</p>");
      $("#people").append("<p><i>" + people[5].name + "</i><p>");
      $("#people").append("<p>" + ((people[5].values.neighborhood.value * 100) / 100).toFixed(2) + "</p>");
      $("#people").append("<p><i>" + people[6].name + "</i><p>");
      $("#people").append("<p>" + Math.round(people[6].values.neighborhood.value) + "</p>");

    var kids = zillow.demographics.response.pages.page[2].tables.table[3];
    $("#kids").append("<p class='bolded'> Households with Children</p>");
      $("#kids").append("<p><i>Percentage WITH children</i></p>");
      $("#kids").append("<p>" + (kids.data.attribute[1].value * 100).toFixed(2) + "%</p>");
      $("#kids").append("<p><i>Percentage WITHOUT children</i></p>");
      $("#kids").append("<p>" + (kids.data.attribute[0].value * 100).toFixed(2) + "%</p>");
    

    var characteristics = zillow.demographics.response.pages.page[2].uniqueness.category;
    $("#characteristics").append("<p class='bolded'> Resident Characteristics</p>");
    $("#characteristics").append("<p><i>" + characteristics[1].type + "</i></p>");
    for (n = 0; n < characteristics[1].characteristic.length; n++) {
          $("#characteristics").append("<p>" + characteristics[1].characteristic[n] + "</p>");
    }
    $("#characteristics").append("<p><i>" + characteristics[2].type + "</i></p>");
    for (n = 0; n < characteristics[2].characteristic.length; n++) {
          $("#characteristics").append("<p>" + characteristics[2].characteristic[n] + "</p>");
    }

    var ages = zillow.demographics.response.pages.page[2].tables.table[1];
    $("#ages").append("<p class='bolded'> Age demographics by decade</p>");
    for (i = 0; i < ages.data.attribute.length; i++) {
      $("#ages").append("<p><i>" + ages.data.attribute[i].name + "</i></p>");
      $("#ages").append("<p>" + (100 * ages.data.attribute[i].value).toFixed(2) + "%</p>");
    }

    var relationships = zillow.demographics.response.pages.page[2].tables.table[4];
    $("#relationships").append("<p class='bolded'> Relationship Status</p>");
    for (i = 0; i < relationships.data.attribute.length; i++) {
      $("#relationships").append("<p><i>" + relationships.data.attribute[i].name + "</i></p>");
      $("#relationships").append("<p>" + (100 * relationships.data.attribute[i].value).toFixed(2) + "%</p>");
    }

    var charts = zillow.demographics.response.charts.chart;
    $("#charts").append("<p class='bolded'> Home Value Information</p>");
      $("#charts").append("<p><i>" + charts[1].name + "</i></p>");
      $("#charts").append("<p><img src=" + charts[1].url + "></div>");
      $("#charts").append("<p><i>" + charts[3].name + "</i></p>");
      $("#charts").append("<p><img src=" + charts[3].url + "></p>");
      $("#charts").append("<p><i>" + charts[5].name + "</i></p>");
      $("#charts").append("<p><img src=" + charts[5].url + "></p>");
      $("#charts").append("<p><i>" + charts[6].name + "</i></p>");
      $("#charts").append("<p><img src=" + charts[6].url + "></p>");  
      $("#charts").append("<p><i>" + charts[7].name + "</i></p>");
      $("#charts").append("<p><img src=" + charts[7].url + "></p>");
    }
function initPlaces() {
  console.log("check!");
  console.log(result);
  // console.log(results);
  console.log(latitude);
  console.log(longitude);
  var loc = new google.maps.LatLng(latitude,longitude);
  var request = {
    location: loc,
    radius: 1700,
    types: ["airport", "restaurant", "campground", "doctor", "hardware_store", "grocery_or_supermarket", "movie_theater", "place_of_worship", "shopping_mall", "stadium", "train_station", "zoo"]
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
  function openInfoWindow() {
    infowindow.setContent('<div style="color:black; font-family:arial; width: 90px; font-variant: small-caps; font-weight: 800">' + this.title + '</div>');
    // console.log("infowindow",infowindow);
    // console.log("placesMarker",this);
    infowindow.open(map, this);
    $(this).css("background-color", "#94BF74");
  }

  function checkFav() {
    $("#fav").removeClass("favorited");
    $.ajax({
      url: '/checkfav',
      method: 'GET',
      data: {
        neighborhood: neighborhood,
        city: city
      },
      success: function(data) {
        if (data.is_fav) {
          console.log(data.is_fav);
          $("#fav").addClass("favorited");
        }
      }
    });
  }

    $("#fav").click(function() {
      self = $(this);
      $.ajax({
        url: '/favorites',
        method: 'POST',
        data: {
          neighborhood: neighborhood,
          city: city,
          state: state
        },
        success: function(data) {
          if (data.is_fav) {
            self.toggleClass("favorited");
          } else {
            self.toggleClass("favorited");
          }
        }
      }
    );
    });

    $("#comment").submit(function() {
      $.ajax({
        url: '/comment',
        method: 'POST',
        data: {
          content: content,
          user_id: user_id,
          state: state
        }
      }
    );
    });
  
  // $(".floatleft").click(window.location.reload());
  
  // google.maps.event.addDomListener(".floatleft", 'click', initialize);

});

