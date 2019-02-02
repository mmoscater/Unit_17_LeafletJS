function createMap(earthquakes) {
  
  // Create the tile layer that will be the background of our map
  var satmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap,
    "Satellite Map": satmap
  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create the map object with options
  var map = L.map("map-id", {
    center: [36.74, -110],
    zoom: 4,
    layers: [lightmap,satmap,earthquakes]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);
  legend.addTo(map);
}
function magColor(mag) {
  if(mag > 5){
    color = 'darkred'
  } else if (mag > 4) {
    color = 'red'
  } else if (mag > 3) {
    color = 'orange'
  } else if (mag > 2) {
    color = 'yellow'
  } else if (mag > 1) {
    color = 'yellowgreen'
  } else {
    color = 'green'
  }
  return color;
};
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            ' <i style="background:' + magColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '  <br>' : '+  ');
    }

    return div;
};

// legend.addTo(map);

function createMarkers(response) {

  // Pull the feature property off of response
  var quakes = response.features;
  // console.log(quakes);
  // Initialize an array to hold earthquake records
  var quakeMarkers = [];

  // Loop through the feature array
  for (var index = 0; index < quakes.length; index++) {
    var quake = quakes[index];
    console.log(quake.properties.mag)
    // For each eq, create a marker and bind a popup with the eq's properties
    var quakeMarker = L.circleMarker([quake.geometry.coordinates[1], quake.geometry.coordinates[0]],
      {radius: quake.properties.mag * 3,
      color: magColor(quake.properties.mag),
      weight: 1,
      fillOpacity: .8
      })
      .bindPopup("<b>Location:</b> " + quake.properties.place + 
      "<br><b>Magnitude:</b> " + quake.properties.mag);

    // Add the marker to the Markers array
    quakeMarkers.push(quakeMarker);
  }

  // Create a layer group made from the markers array, pass it into the createMap function
  createMap(L.layerGroup(quakeMarkers));
  // legend.addTo(map);
}


// Perform an API call to the USGS Earthquakes (Past 7 days) API to get station information. Call createMarkers when complete
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", createMarkers);
