from geojson import Feature, Polygon, FeatureCollection, Point
import json


def transform_data_to_geojson(data):
    return FeatureCollection([transform_row_to_geojson(row) for row in data])


def transform_row_to_geojson(row):
    if row['type'] == 'polygon':
        poly = Polygon(json.loads(row['geom'])['coordinates'])
        return __polygon_feature__(poly, row)
    else:
        poly = Point(json.loads(row['geom'])['coordinates'])
        return __point_feature__(poly, row)


def __point_feature__(poly, row):
    return Feature(geometry=poly, properties={'name': row['name'], 'distance': row['distance'], 'amenity': row['amenity']})


def __polygon_feature__(poly, row):
    return Feature(geometry=poly, properties={'name': row['name']})
