mapboxgl.accessToken = 'pk.eyJ1IjoiYnJhbm9wIiwiYSI6ImNqbml2c2ZvMjBueHkzd3A3MmNzc3QwbHkifQ.3mV02gaD_z1IUN_Lw4WICg';
var map = new mapboxgl.Map({
    container: 'mapid', // HTML container id
    style: 'mapbox://styles/branop/cjokfml7v01f02rtdcu0qy5un',
    center: [17.2698, 48.2875], // starting position as [lng, lat]
    zoom: 13
});
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));

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

function clear_list(){
    $('#amenities-list').html('');

    if (map.getLayer('city-roads')){
        map.removeLayer('city-roads');
    }

    if (map.getSource('city-roads-source')){
        map.removeSource('city-roads-source');
    }

    if (map.getLayer('city-amenity-points')){
        map.removeLayer('city-amenity-points');
    }

    if (map.getSource('city-amenity-points-source')){
        map.removeSource('city-amenity-points-source');
    }

    if (map.getLayer('city-water-houses')){
        map.removeLayer('city-water-houses');
    }

    if (map.getSource('city-water-houses-source')){
        map.removeSource('city-water-houses-source');
    }
}



map.on('click', 'city-borders', function (e) {
    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(e.features[0].properties.name).addTo(map);
});

map.on('mouseenter', 'city-borders', function () {
    map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'city-borders', function () {
    map.getCanvas().style.cursor = '';
});

map.on('click', 'city-amenity-points', function (e) {
    var html_string = '<h5>Name: ';

    if(e.features[0].properties.name) {
        html_string += e.features[0].properties.name + '</h5><p>'
    }
    else {
        html_string += 'Not specified</h5><p>'
    }

    html_string += 'Type: ' + (e.features[0].properties.shop !== "null" ? 'Shop - ' + e.features[0].properties.shop : e.features[0].properties.amenity) + '</p>'
        + (e.features[0].properties.distance ? '<p>Distance: ' + e.features[0].properties.distance + ' m</p>' : ' ') ;
    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(html_string).addTo(map);
});

map.on('mouseenter', 'city-amenity-points', function () {
    map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'city-amenity-points', function () {
    map.getCanvas().style.cursor = '';
});

map.on('click', 'city-roads', function (e) {
    var html_string = '<h5>Name: ';

    if(e.features[0].properties.name) {
        html_string += e.features[0].properties.name + '</h5><p>'
    }
    else {
        html_string += 'Not specified</h5><p>'

    }

    html_string += 'Type: ' + e.features[0].properties.highway + '</p>' + (e.features[0].properties.len ? '<p>Length: ' + e.features[0].properties.len + ' m</p>' : ' ') ;
    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(html_string).addTo(map);
});

map.on('mouseenter', 'city-roads', function () {
    map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'city-roads', function () {
    map.getCanvas().style.cursor = '';
});

map.on('click', 'city-water-houses', function (e) {
    var html_string = '<h5>Name: ';

    if(e.features[0].properties.name) {
        html_string += e.features[0].properties.name + '</h5><p>'
    }
    else {
        html_string += 'Not specified</h5><p>'
    }

    html_string += '<p>Address: ' + (e.features[0].properties.house ? e.features[0].properties.house : ' ')  + (e.features[0].properties.number ? e.features[0].properties.number : ' ') + ' </p>';

    html_string += 'Type: ' + e.features[0].properties.building + '</p>' + (e.features[0].properties.area ? '<p>Area: ' + e.features[0].properties.area + ' m2</p>' : ' ') ;
    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(html_string).addTo(map);
});

map.on('mouseenter', 'city-water-houses', function () {
    map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'city-water-houses', function () {
    map.getCanvas().style.cursor = '';
});


function remove_markers() {
    clear_list();
}

function add_marker_points_from_geojson(path, form_id) {
    var geojson = $.ajax({
        url: path,
        dataType: "json",
        type: "POST",
        data: $(form_id).serialize(),
        error: function(xhr) {
            alert(xhr.responseJSON.message);
        }
    });

    $.when(geojson).done(function() {
        clear_list();

        map.addSource('city-amenity-points-source', {
            'type': 'geojson',
            'data': geojson.responseJSON
        });

        map.addLayer({
            'id': 'city-amenity-points',
            'type': 'symbol',
            'source': 'city-amenity-points-source',
            "layout": {
                "icon-image": "{amenity_key}-15",
                "text-field": "{name} - {amenity}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-anchor": "top",
                "text-offset": [0, 1],
                "text-size": {
                    "stops": [
                        [17, 0],
                        [18, 12],
                    ]
                }
            },
            "paint": {
                "text-color": "#aaa",
            },
            "interactive": true

        });

        // add markers to map
        geojson.responseJSON.features.forEach(function(marker, idx) {
            create_element(marker);
        });
    });
}

function create_amenity_list(amenity) {
    $('#amenities-list').append(
        '<div class="row">' +
            '<div role="button" class="amenity-holder col-md-6 text-center btn btn-dark btn-sm" onclick="hide_or_show_child(this, \'.amenity-holder\', \'.found_amenities\')" data-child_id="' + amenity + '_list">' +
                '<h5>' + amenity.toUpperCase() + '<span class="pull-right"><i class="fas fa-angle-down"></i></span></h5>' +
            '</div>' +
        '</div>' +
        '<div class="row amenity-table-body">' +
            '<table style="display:none" class="found_amenities table table-striped table-hover" id="' + amenity + '_list">' +
                '<thead><tr>' +
                    '<th>Name</th>' +
                    '<th>Distance</th>' +
                    '<th>Type</th>' +
                '</tr></thead>' +
                '<tbody>' +
                '</tbody>' +
            '</table>' +
        '</div>'
    )
}

function create_element(feature) {
    if (!$('#' + feature.properties.amenity + '_list').length) {
        create_amenity_list(feature.properties.amenity)
    }
    if (feature.geometry.type === "Polygon") {
        coordinates = JSON.parse(feature.properties.centroid).coordinates
    }

    else {
        coordinates = feature.geometry.coordinates
    }
    $('#' + feature.properties.amenity + '_list > tbody').append(
        '<tr onclick="show_marker(this)" data-x="' + coordinates[0] + '" data-y="' + coordinates[1] + '" class="">' +
            '<td>' + (feature.properties.name ? feature.properties.name : 'Not specified')  + '</td>' +
            '<td>' + (feature.properties.distance ? feature.properties.distance + ' m' : ' ') + '</td>' +
            '<td>' + (feature.properties.shop ? feature.properties.shop : feature.properties.amenity) + '</td>' +
        '</tr>'
    )
}

function add_line_and_markers_from_geojson(path, form_id) {
    var geojson = $.ajax({
        url: path,
        dataType: "json",
        type: "POST",
        data: $(form_id).serialize(),
        error: function(xhr) {
            alert(xhr.responseJSON.message);
        }
    });

    $.when(geojson).done(function() {
        clear_list();

        map.addSource('city-roads-source', {
            'type': 'geojson',
            'data': geojson.responseJSON
        });

        map.addLayer({
            'id': 'city-roads',
            'type': 'line',
            'source': 'city-roads-source',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#F00',
                'line-width': 8,
            }
        });

        // add markers to map
        geojson.responseJSON.features.forEach(function(road, idx) {

            create_road_element(road);
        });
    });
}

function create_road_list() {
    $('#amenities-list').append(
        '<div class="row">' +
            '<div role="button" class="amenity-holder col-md-6 text-center btn btn-dark btn-sm" onclick="hide_or_show_child(this, \'.amenity-holder\', \'.found_amenities\')" data-child_id="road_list">' +
                '<h5>Road<span class="pull-right"><i class="fas fa-angle-down"></i></span></h5>' +
            '</div>' +
        '</div>' +
        '<div class="row amenity-table-body">' +
            '<table style="display:none" class="found_amenities table table-striped table-hover" id="road_list">' +
                '<thead><tr>' +
                    '<th>Name</th>' +
                    '<th>Length</th>' +
                    '<th>Type</th>' +
                '</tr></thead>' +
                '<tbody>' +
                '</tbody>' +
            '</table>' +
        '</div>'
    )
}

function create_road_element(feature) {
    if (!$('#road_list').length) {
        create_road_list()
    }
    coordinates = JSON.parse(feature.properties.centroid).coordinates;
    $('#road_list > tbody').append(
        '<tr onclick="show_marker(this)" data-x="' + coordinates[0] + '" data-y="' + coordinates[1] + '" class="">' +
            '<td>' + (feature.properties.name ? feature.properties.name : 'Not specified')  + '</td>' +
            '<td>' + (feature.properties.len ? feature.properties.len + ' m' : ' ') +'</td>' +
            '<td>' + (feature.properties.highway ? feature.properties.highway : ' ') + '</td>' +
        '</tr>'
    )
}



function add_water_houses_from_geojson(path, form_id) {
    var geojson = $.ajax({
        url: path,
        dataType: "json",
        type: "POST",
        data: $(form_id).serialize(),
        error: function(xhr) {
            alert(xhr.responseJSON.message);
        }
    });

    $.when(geojson).done(function() {
        clear_list();

        console.log(geojson);

        map.addSource('city-water-houses-source', {
            'type': 'geojson',
            'data': geojson.responseJSON
        });

        map.addLayer({
            'id': 'city-water-houses',
            'type': 'fill',
            'source': 'city-water-houses-source',
            'paint': {
                    'fill-color': '#844',
                    'fill-opacity': 0.5,
                    'fill-outline-color': '#f00',
                }
        });

        // add markers to map
        geojson.responseJSON.features.forEach(function(house, idx) {

            create_house_element(house);
        });
    });
}

function create_house_list() {
    $('#amenities-list').append(
        '<div class="row">' +
            '<div role="button" class="amenity-holder col-md-6 text-center btn btn-dark btn-sm" onclick="hide_or_show_child(this, \'.amenity-holder\', \'.found_amenities\')" data-child_id="house_list">' +
                '<h5>Water houses<span class="pull-right"><i class="fas fa-angle-down"></i></span></h5>' +
            '</div>' +
        '</div>' +
        '<div class="row amenity-table-body">' +
            '<table style="display:none" class="found_amenities table table-striped table-hover" id="house_list">' +
                '<thead><tr>' +
                    '<th>Name</th>' +
                    '<th>Area</th>' +
                    '<th>Address</th>' +
                    '<th>Type</th>' +
                '</tr></thead>' +
                '<tbody>' +
                '</tbody>' +
            '</table>' +
        '</div>'
    )
}

function create_house_element(feature) {
    if (!$('#house_list').length) {
        create_house_list()
    }
    coordinates = JSON.parse(feature.properties.centroid).coordinates;
    $('#house_list > tbody').append(
        '<tr onclick="show_marker(this)" data-x="' + coordinates[0] + '" data-y="' + coordinates[1] + '" class="">' +
            '<td>' + (feature.properties.name ? feature.properties.name : 'Not specified')  + '</td>' +
            '<td>' + (feature.properties.area ? feature.properties.area + ' m' : ' ') +'</td>' +
            '<td>' + (feature.properties.house ? feature.properties.house : ' ') + (feature.properties.number ? feature.properties.number : ' ') + '</td>' +
            '<td>' + (feature.properties.building ? feature.properties.building : ' ') + '</td>' +
        '</tr>'
    )
}




function show_marker(elem) {
    x = $(elem).data('x');
    y = $(elem).data('y');
    map.flyTo({center: [x, y], zoom: 18 });
}

function hide_or_show_child(elem, button_class, data_class) {
    child = $('#' + $(elem).data('child_id'));
    show = child.is(':hidden');
    $(data_class).hide();
    $(button_class).removeClass('active');
    if (show) {
        $(child).show();
        $(elem).addClass('active');
    }
    else {
        $(child).hide();
        $(elem).removeClass('active');
    }
}

$(document).ready(function() {
    $('.select2-amenity').select2();
    $('.select2-city-polygon').select2();
    $('.select2-city-amenity').select2();
    $('.select2-city-roads').select2();
    $('.select2-city-water-houses').select2();
});
