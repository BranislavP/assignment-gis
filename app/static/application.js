mapboxgl.accessToken = 'pk.eyJ1IjoiYnJhbm9wIiwiYSI6ImNqbml2c2ZvMjBueHkzd3A3MmNzc3QwbHkifQ.3mV02gaD_z1IUN_Lw4WICg';
var map = new mapboxgl.Map({
    container: 'mapid', // HTML container id
    //style: 'mapbox://styles/mapbox/streets-v10', // style URL
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



map.on('click', 'city-borders', function (e) {
    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(e.features[0].properties.name).addTo(map);
});

map.on('click', 'city-roads', function (e) {
    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(
        '<p>Type: ' + e.features[0].properties.highway + '</p>' +
        '<p>Length: ' + e.features[0].properties.len +' m</p>'
    ).addTo(map);
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
    });
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

        // add markers to map
        geojson.responseJSON.features.forEach(function(marker, idx) {

            create_element(marker, marker.properties.amenity + '-' + idx);

            // create a HTML element for each feature
            var el = document.createElement('div');
            el.className = 'marker ' + marker.properties.amenity_key;
            el.id = marker.properties.amenity + '-' + idx;

            var html_string = '<h5>Name: ';

            if(marker.properties.name) {
                html_string += marker.properties.name + '</h5><p>'
            }
            else {
                html_string += 'Not specified</h5><p>'

            }

            html_string += 'Type: ' + marker.properties.amenity + '</p>' + (marker.properties.distance ? '<p>Distance: ' + marker.properties.distance + ' m</p>' : ' ') ;

            if (marker.geometry.type === "Polygon") {
                coordinates = JSON.parse(marker.properties.centroid).coordinates
            }

            else {
                coordinates = marker.geometry.coordinates
            }

            // make a marker for each feature and add to the map
            marker = new mapboxgl.Marker(el)
                .setLngLat(coordinates)
                .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML(html_string))
                .addTo(map);
            markers.push(marker)
        });
    });
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

            create_road_element(road, 'road-' + idx);

            // create a HTML element for each feature
            var el = document.createElement('div');
            el.className = 'marker simple_marker';
            el.id = 'road-' + idx;

            var html_string = '<h5>Name: ';

            if(road.properties.name) {
                html_string += road.properties.name + '</h5><p>'
            }
            else {
                html_string += 'Not specified</h5><p>'

            }

            html_string += 'Type: ' + road.properties.highway + '</p>' + (road.properties.len ? '<p>Length: ' + road.properties.len + ' m</p>' : ' ') ;

            coordinates = JSON.parse(road.properties.centroid).coordinates;

            marker = new mapboxgl.Marker(el)
                .setLngLat(coordinates)
                .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML(html_string))
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

function clear_list(){
    $('#amenities-list').html('');

    if (map.getLayer('city-roads')){
        map.removeLayer('city-roads');
    }

    if (map.getSource('city-roads-source')){
        map.removeSource('city-roads-source');
    }
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
                '</tr></thead>' +
                '<tbody>' +
                '</tbody>' +
            '</table>' +
        '</div>'
    )
}

function create_element(feature, marker_id) {
    if (!$('#' + feature.properties.amenity + '_list').length) {
        create_amenity_list(feature.properties.amenity)
    }
    $('#' + feature.properties.amenity + '_list > tbody').append(
        '<tr onclick="show_marker(this)" data-marker_id="' + marker_id + '" class="">' +
            '<td>' + (feature.properties.name ? feature.properties.name : 'Not specified')  + '</td>' +
            '<td>' + (feature.properties.distance ? feature.properties.distance + ' m' : ' ') +'</td>' +
        '</tr>'
    )
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

function create_road_element(feature, marker_id) {
    if (!$('#road_list').length) {
        create_road_list()
    }
    $('#road_list > tbody').append(
        '<tr onclick="show_marker(this)" data-marker_id="' + marker_id + '" class="">' +
            '<td>' + (feature.properties.name ? feature.properties.name : 'Not specified')  + '</td>' +
            '<td>' + (feature.properties.len ? feature.properties.len + ' m' : ' ') +'</td>' +
            '<td>' + (feature.properties.highway ? feature.properties.highway : ' ') + '</td>' +
        '</tr>'
    )
}

function show_marker(elem) {
    $('.marker_selected').removeClass('marker_selected');
    id = $(elem).data('marker_id');
    marker = $('#' + id);
    marker.addClass('marker_selected');
    markers.forEach(function(marker) {
        marker._popup.remove();
        if(marker._element.id === id){
            map.flyTo({center: [marker._lngLat.lng, marker._lngLat.lat], zoom: 15   });
            marker._popup.addTo(map);
            //marker.click();
        }
    });
    //marker.openPopup();
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
    $('.select2').select2();
    $('.select2-amenity').select2();
    $('.select2-city-amenity').select2();
    $('.select2-city-roads').select2();
});
