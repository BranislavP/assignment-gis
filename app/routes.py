from flask import render_template, jsonify, request
from app import app
from flask_sqlalchemy import SQLAlchemy
from .modules.functions import transform_data_to_geojson
from .modules import queries
from .modules.forms import AmenityDistanceForm, amenity_city_form, city_roads_form, city_water_houses_form
from .modules.exceptions import InvalidUsage


db = SQLAlchemy(app)

@app.route('/')
@app.route('/index')
def index():
    form = AmenityDistanceForm()
    city_query_results = db.engine.execute(queries.get_cities_possibility()).fetchall()
    city_form = amenity_city_form(city_query_results)
    roads_form = city_roads_form(city_query_results)
    water_form = city_water_houses_form(city_query_results)
    return render_template('index.html', title='Home', form=form, city_form=city_form, roads_form=roads_form, water_form=water_form)


@app.route('/cities_geojson')
def cities_geojson():
    result = db.engine.execute(queries.get_geojson_cities_query()).fetchall()
    print('Database done!')
    polygons = transform_data_to_geojson([geo for geo in result])
    return jsonify(polygons)


@app.route('/amenities_from_point', methods=['POST'])
def amenities_from_point():
    lng = request.form.get('lng')
    lat = request.form.get('lat')
    amenities = request.form.getlist('amenities')
    distance = request.form.get('distance')
    if lng and lat and distance and amenities:
        amenities.append('EMPTY_HACK')
        result = db.engine.execute(queries.get_geojson_amenities_query(lat=lat, lng=lng, amenities=tuple(amenities), distance=distance)).fetchall()
        print('Database done!')
        points = transform_data_to_geojson([geo for geo in result])
        return jsonify(points)
    else:
        raise InvalidUsage('There were uninitialized parameters!', status_code=418)


@app.route('/amenities_in_city', methods=['Post'])
def amenities_in_city():
    city = request.form.get('cities')
    amenities = request.form.getlist('amenities')
    if city and amenities:
        amenities.append('EMPTY_HACK')
        result = db.engine.execute(queries.get_geojson_amenities_in_city(city_name=city, amenities=tuple(amenities))).fetchall()
        print('Database done!')
        points = transform_data_to_geojson([geo for geo in result])
        return jsonify(points)
    else:
        raise InvalidUsage('There were uninitialized parameters!', status_code=418)


@app.route('/roads_leaving_city', methods=['POST'])
def roads_leaving_city():
    city = request.form.get('cities')
    if city:
        result = db.engine.execute(queries.get_geojson_roads_leaving_city(city_name=city)).fetchall()
        print('Database done!')
        points = transform_data_to_geojson([geo for geo in result])
        return jsonify(points)
    else:
        raise InvalidUsage('There were uninitialized parameters!', status_code=418)


@app.route('/city_water_houses', methods=['POST'])
def city_water_houses():
    city = request.form.get('cities')
    if city:
        result = db.engine.execute(queries.get_water_houses_in_city(city_name=city)).fetchall()
        print('Database done!')
        polygons = transform_data_to_geojson([geo for geo in result])
        return jsonify(polygons)
    else:
        raise InvalidUsage('There were uninitialized parameters!', status_code=418)


@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response
