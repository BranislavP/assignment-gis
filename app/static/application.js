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

        clear_list();

        // add markers to map
        geojson.responseJSON.features.forEach(function(marker, idx) {

            create_element(marker, marker.properties.amenity + '-' + idx);

            // create a HTML element for each feature
            var el = document.createElement('div');
            el.className = 'marker';
            el.id = marker.properties.amenity + '-' + idx;

            var html_string = '<h5>Name: ';

            if(marker.properties.name) {
                html_string += marker.properties.name + '</h5><p>'
            }
            else {
                html_string += 'Not specified</h5><p>'

            }

            html_string += 'Type: ' + marker.properties.amenity + '</p>' + '<p>Distance: ' + marker.properties.distance + ' m</p>';

            // make a marker for each feature and add to the map
            marker = new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
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
}

function create_amenity_list(amenity) {
    $('#amenities-list').append('<div class="row"><div role="button" class="amenity-holder col-md-6 text-center btn btn-info btn-sm" onclick="hide_or_show_child(this)" data-child_id="' + amenity + '_list"><h5>' + amenity.toUpperCase() + '</h5></div></div><div class="row"><div style="display:none" id="' + amenity + '_list"></div></div>')
}

function create_element(feature, marker_id) {
    if (!$('#' + feature.properties.amenity + '_list').length) {
        create_amenity_list(feature.properties.amenity)
    }
    $('#' + feature.properties.amenity + '_list').append(
        '<p onclick="show_marker(this)" data-marker_id="' + marker_id + '" class="' + feature.properties.amenity + '">Name: ' +
        (feature.properties.name ? feature.properties.name : 'Not specified') +
        ', Distance: ' + feature.properties.distance + ' m</p>'
    )
}

function show_marker(elem) {
    $('.marker_selected').removeClass('marker_selected');
    marker = $('#' + $(elem).data('marker_id'));
    marker.addClass('marker_selected');
}

function hide_or_show_child(elem) {
    child = $('#' + $(elem).data('child_id'));
    if (child.is(':hidden')) {
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
});
