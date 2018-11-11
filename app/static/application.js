/*ar mymap = L.map('mapid').setView([48.2875, 17.2698], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 3,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiYnJhbm9wIiwiYSI6ImNqbml2c2ZvMjBueHkzd3A3MmNzc3QwbHkifQ.3mV02gaD_z1IUN_Lw4WICg'
}).addTo(mymap);

var marker = L.marker([48.2875, 17.2698]).addTo(mymap);
marker.bindPopup("<b>Hello world!</b><br>I am a popup.");
var popup = L.popup();

/*function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

mymap.on('click', onMapClick);
*/
/*
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [17.275679, 48.286805]
    }
};

var myLayer = L.geoJSON().addTo(mymap);
myLayer.addData(geojsonFeature);

/*var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

L.geoJSON(myLines, {
    style: myStyle
}).addTo(mymap);
*/

mapboxgl.accessToken = 'pk.eyJ1IjoiYnJhbm9wIiwiYSI6ImNqbml2c2ZvMjBueHkzd3A3MmNzc3QwbHkifQ.3mV02gaD_z1IUN_Lw4WICg';
var map = new mapboxgl.Map({
    container: 'mapid', // HTML container id
    style: 'mapbox://styles/mapbox/streets-v10', // style URL
    center: [17.2698, 48.2875], // starting position as [lng, lat]
    zoom: 13
});
map.addControl(new mapboxgl.NavigationControl());

$('a#city-borders-layer').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if($(this).data('locked') !== 'true') {
        var clickedLayer = $(this).data('layer');
        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    }
    else {
        alert('Data not loaded!');
        console.log('Data not loaded!');
    }
});



map.on('click', 'city-borders', function (e) {
    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(e.features[0].properties.name).addTo(map);
});

map.on('mouseenter', 'city-borders', function () {
    map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'city-borders', function () {
    map.getCanvas().style.cursor = '';
});

var markers = [];


function remove_markers() {
    markers.forEach(function(marker) {
        marker.remove();
    })
}

function add_marker_points_from_geojson(path) {
        var geojson = $.ajax({
            url: path,
            dataType: "json",
            type: "POST",
            data: $('form#amenities-form').serialize(),
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });

    $.when(geojson).done(function() {
        // add markers to map
        geojson.responseJSON.features.forEach(function(marker) {

            // create a HTML element for each feature
            var el = document.createElement('div');
            el.className = 'marker';

            // make a marker for each feature and add to the map
            marker = new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML('<h5>' + marker.properties.name + '</h5><p>' + marker.properties.amenity + '</p>' +
                        '<p>Distance: ' + marker.properties.distance + '</p>'))
                .addTo(map);
            markers.push(marker)
        });
    });
}

$('div#location-setting').on('click', function(e) {
    var on = $(this).data('on');
    if(on === '1') {
        $(this).data('on', '0');
        $(this).removeClass('active');
    }
    else {
        $(this).data('on', '1');
        $(this).addClass('active');
    }
});

map.on('click', function(e) {
   var setting_location_el = $('#location-setting');
   if(setting_location_el.data('on') === '1') {
       setting_location_el.data('on', '0');
       setting_location_el.removeClass('active');
       var lng = e.lngLat.lng;
       var lat = e.lngLat.lat;
       $('#lng').val(lng);
       $('#lat').val(lat);
   }
});

$(document).ready(function() {
    $('.select2').select2();
});


/*var marker = new mapboxgl.Marker().setLngLat([17.2698, 48.2875]).setPopup(new mapboxgl.Popup().setHTML('<h3>Reykjavik Roasters</h3><p>A good coffee shop</p>')).addTo(map);

var popup = new mapboxgl.Popup({closeOnClick: false});

function onMapClick(e) {
    popup.remove();
    popup.setLngLat(e.lngLat)
        .setHTML("You clicked the map at " + e.lngLat.toString())
        .addTo(map);
}

map.on('click', onMapClick);*/
