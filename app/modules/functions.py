from geojson import Feature, Polygon, FeatureCollection, Point, LineString
import json
from .settings import SELECTABLE_AMENITIES


def transform_data_to_geojson(data):
    return FeatureCollection([transform_row_to_geojson(row) for row in data])


def transform_row_to_geojson(row):
    if row['type'] == 'polygon':
        poly = Polygon(json.loads(row['geom'])['coordinates'])
        return __features__(poly, dict(row))
    elif row['type'] == 'line':
        poly = LineString(json.loads(row['geom'])['coordinates'])
        return __features__(poly, dict(row))
    else:
        poly = Point(json.loads(row['geom'])['coordinates'])
        return __features__(poly, dict(row))


def __point_feature__(poly, row):
    return Feature(geometry=poly, properties={'name': row['name'], 'distance': row['distance'], 'amenity': SELECTABLE_AMENITIES.get(row['amenity']), 'amenity_key': row['amenity']})


def __features__(poly, row):
    properties = {}
    if row.get('name'):
        properties['name'] = row.get('name')
    if row.get('distance'):
        properties['distance'] = row.get('distance')
    if row.get('amenity'):
        properties['amenity'] = SELECTABLE_AMENITIES.get(row['amenity'])
        properties['amenity_key'] = row['amenity']
    if row.get('centroid'):
        properties['centroid'] = row.get('centroid')
    if row.get('len'):
        properties['len'] = row.get('len')
    if row.get('highway'):
        properties['highway'] = row.get('highway')
    return Feature(geometry=poly, properties=properties)

