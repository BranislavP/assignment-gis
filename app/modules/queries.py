def get_geojson_cities_query():
    return "SELECT DISTINCT ON(name) name, way_area, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) AS geom, 'polygon' AS type " \
           "FROM planet_osm_polygon " \
           "WHERE boundary = 'administrative' " \
           "AND admin_level = '9' " \
           "AND name is not null " \
           "ORDER BY name ASC, way_area DESC"


def get_geojson_amenities_query(lat, lng, distance, amenities):
       return "SELECT name, amenity, 'point' AS type, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) AS geom, ST_Distance_Sphere(ST_SetSRID(ST_MakePoint({0}, {1}),4326), ST_Transform(way, 4326)) AS distance, way " \
              "FROM planet_osm_point " \
              "WHERE amenity in {2} " \
              "AND ST_DWithin(ST_SetSRID(ST_MakePoint({0}, {1}),4326)::geography, ST_Transform(way, 4326)::geography, {3}) " \
              "ORDER BY amenity, distance".format(lng, lat, amenities, distance)
