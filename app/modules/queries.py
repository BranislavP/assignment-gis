def get_geojson_cities_query():
    return "SELECT DISTINCT ON(name) name, way_area, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) AS geom, 'polygon' AS type " \
           "FROM planet_osm_polygon " \
           "WHERE boundary = 'administrative' " \
           "AND admin_level = '9' " \
           "AND name is not null " \
           "ORDER BY name ASC, way_area DESC"


def get_geojson_amenities_query(lat, lng, distance, amenities):
    return "SELECT name, amenity, 'point' AS type, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) AS geom, ST_Distance_Sphere(ST_SetSRID(ST_MakePoint({0}, {1}),4326), ST_Transform(way, 4326)) AS distance, way, ST_AsGeoJSON(ST_Transform(ST_Centroid(way), 4326)::geometry) AS centroid " \
           "FROM planet_osm_point " \
           "WHERE amenity in {2} " \
           "AND ST_DWithin(ST_SetSRID(ST_MakePoint({0}, {1}),4326)::geography, ST_Transform(way, 4326)::geography, {3}) " \
           "UNION " \
           "SELECT name, amenity, 'polygon' AS type, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) AS geom, ST_Distance_Sphere(ST_SetSRID(ST_MakePoint({0}, {1}),4326), ST_Transform(way, 4326)) AS distance, way, ST_AsGeoJSON(ST_Transform(ST_Centroid(way), 4326)::geometry) AS centroid " \
           "FROM planet_osm_polygon " \
           "WHERE amenity in {2} " \
           "AND ST_DWithin(ST_SetSRID(ST_MakePoint({0}, {1}),4326)::geography, ST_Transform(way, 4326)::geography, {3}) " \
           "ORDER BY amenity, distance".format(lng, lat, amenities, distance)


def get_cities_possibility():
    return "SELECT DISTINCT ON(name) name, way_area " \
           "FROM planet_osm_polygon " \
           "WHERE boundary = 'administrative' " \
           "AND admin_level = '9' " \
           "AND name is not null " \
           "ORDER BY name ASC, way_area DESC"


def get_geojson_amenities_in_city(city_name, amenities):
    return "WITH city AS ( " \
           "SELECT DISTINCT ON (name) name, way_area, way " \
           "FROM planet_osm_polygon " \
           "WHERE boundary = 'administrative' " \
           "AND admin_level = '9' " \
           "AND name = '{0}' " \
           "ORDER BY name ASC, way_area DESC " \
           "LIMIT 1 " \
           ") " \
           "SELECT name, amenity, 'point' AS type, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) as geom, ST_AsGeoJSON(ST_Transform(ST_Centroid(way), 4326)::geometry) AS centroid " \
           "FROM planet_osm_point " \
           "WHERE amenity in {1} " \
           "AND ST_Contains(ST_Transform((SELECT way FROM city LIMIT 1), 4326)::geometry, ST_Transform(way, 4326)::geometry) " \
           "UNION " \
           "SELECT name, amenity, 'polygon' AS type, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) as geom, ST_AsGeoJSON(ST_Transform(ST_Centroid(way), 4326)::geometry) AS centroid " \
           "FROM planet_osm_polygon " \
           "WHERE amenity in {1} " \
           "AND ST_Contains(ST_Transform((SELECT way FROM city LIMIT 1), 4326)::geometry, ST_Transform(way, 4326)::geometry) " \
           "ORDER BY amenity".format(city_name, amenities)


def get_geojson_roads_leaving_city(city_name):
    return "WITH city AS (" \
           "SELECT DISTINCT ON(name) name, way_area, way " \
           "FROM planet_osm_polygon " \
           "WHERE boundary = 'administrative' " \
           "AND admin_level = '9' " \
           "AND name = '{0}' " \
           "ORDER BY name ASC, way_area DESC " \
           "LIMIT 1) " \
           "SELECT name, 'line' AS type, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) AS geom, ST_Length(ST_Transform(way, 26986)::geometry) AS len, ST_AsGeoJSON(ST_Line_Interpolate_Point(ST_Transform(way, 4326)::geometry, 0.5)) AS centroid, highway " \
           "FROM planet_osm_line " \
           "WHERE highway in ('residential', 'tertiary', 'primary', 'secondary', 'service') " \
           "AND ST_Crosses(way, (SELECT way FROM city LIMIT 1))".format(city_name)



'''--in ('residential', 'tertiary', 'primary', 'secondary', 'service')'''
