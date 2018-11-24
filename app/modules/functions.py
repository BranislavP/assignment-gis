from geojson import Feature, Polygon, FeatureCollection, Point, LineString
import json
from .settings import SELECTABLE_AMENITIES, AMENITY_KEYS


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


def __features__(poly, row):
    properties = {}
    if row.get('name'):
        properties['name'] = row.get('name')
    if row.get('distance'):
        properties['distance'] = row.get('distance')
    if row.get('amenity') or row.get('shop'):
        properties['amenity'] = SELECTABLE_AMENITIES.get(row['amenity'])
        properties['amenity_key'] = AMENITY_KEYS.get(row['amenity'])
        if properties.get('amenity') is None:
            properties['amenity'] = 'shop'
            properties['amenity_key'] = 'shop'
        properties['shop'] = row.get('shop')
    if row.get('centroid'):
        properties['centroid'] = row.get('centroid')
    if row.get('len'):
        properties['len'] = row.get('len')
    if row.get('highway'):
        properties['highway'] = row.get('highway')
    if row.get('house'):
        properties['house'] = row['house']
    if row.get('number'):
        properties['number'] = row['number']
    if row.get('area'):
        properties['area'] = row['area']
    if row.get('building'):
        properties['building'] = row['building']
    return Feature(geometry=poly, properties=properties)

