from sqlalchemy.sql import text

def get_geojson_cities_query():
    return text("SELECT DISTINCT ON(name) name, way_area, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) AS geom, 'polygon' AS type "
                "FROM planet_osm_polygon "
                "WHERE boundary = 'administrative' "
                "AND admin_level = '9' "
                "AND name is not null "
                "ORDER BY name ASC, way_area DESC")


def get_geojson_amenities_query(amenities):
    if 'shop' in amenities:
        return text("SELECT name, amenity, shop, 'point' AS type, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) AS geom, ST_Distance_Sphere(ST_SetSRID(ST_MakePoint(:x, :y),4326), ST_Transform(way, 4326)) AS distance, ST_AsGeoJSON(ST_Transform(ST_Centroid(way), 4326)::geometry) AS centroid "
                    "FROM planet_osm_point "
                    "WHERE (amenity in :amenities OR shop is not null ) "
                    "AND ST_DWithin(ST_SetSRID(ST_MakePoint(:x, :y),4326)::geography, ST_Transform(way, 4326)::geography, :distance) "
                    "UNION "
                    "SELECT name, amenity, shop, 'polygon' AS type, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) AS geom, ST_Distance_Sphere(ST_SetSRID(ST_MakePoint(:x, :y),4326), ST_Transform(way, 4326)) AS distance, ST_AsGeoJSON(ST_Transform(ST_Centroid(way), 4326)::geometry) AS centroid "
                    "FROM planet_osm_polygon "
                    "WHERE (amenity in :amenities OR shop is not null ) "
                    "AND ST_DWithin(ST_SetSRID(ST_MakePoint(:x, :y),4326)::geography, ST_Transform(way, 4326)::geography, :distance) "
                    "ORDER BY amenity, distance")
    else:
        return text("SELECT name, amenity, shop, 'point' AS type, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) AS geom, ST_Distance_Sphere(ST_SetSRID(ST_MakePoint(:x, :y),4326), ST_Transform(way, 4326)) AS distance, ST_AsGeoJSON(ST_Transform(ST_Centroid(way), 4326)::geometry) AS centroid "
                    "FROM planet_osm_point "
                    "WHERE (amenity in :amenities ) "
                    "AND ST_DWithin(ST_SetSRID(ST_MakePoint(:x, :y),4326)::geography, ST_Transform(way, 4326)::geography, :distance) "
                    "UNION "
                    "SELECT name, amenity, shop, 'polygon' AS type, ST_AsGeoJSON(ST_Transform(way, 4326)::geometry) AS geom, ST_Distance_Sphere(ST_SetSRID(ST_MakePoint(:x, :y),4326), ST_Transform(way, 4326)) AS distance, ST_AsGeoJSON(ST_Transform(ST_Centroid(way), 4326)::geometry) AS centroid "
                    "FROM planet_osm_polygon "
                    "WHERE (amenity in :amenities ) "
                    "AND ST_DWithin(ST_SetSRID(ST_MakePoint(:x, :y),4326)::geography, ST_Transform(way, 4326)::geography, :distance) "
                    "ORDER BY amenity, distance")


def get_cities_possibility():
    return "SELECT DISTINCT ON(name) name, way_area " \
           "FROM planet_osm_polygon " \
           "WHERE boundary = 'administrative' " \
           "AND admin_level = '9' " \
           "AND name is not null " \
           "ORDER BY name ASC, way_area DESC"


def get_geojson_amenities_in_city(amenities):
    if 'shop' in amenities:
        return text("WITH city AS ( "
                    "SELECT DISTINCT ON (name) name, way_area, way "
                    "FROM planet_osm_polygon "
                    "WHERE boundary = 'administrative' "
                    "AND admin_level = '9' "
                    "AND name = :name "
                    "ORDER BY name ASC, way_area DESC "
                    "LIMIT 1 "
                    ") "
                    "SELECT p.name, p.amenity, p.shop, 'point' AS type, ST_AsGeoJSON(ST_Transform(p.way, 4326)::geometry) as geom, ST_AsGeoJSON(ST_Transform(ST_Centroid(p.way), 4326)::geometry) AS centroid "
                    "FROM planet_osm_point p "
                    "JOIN city c ON st_contains(c.way, p.way) "
                    "WHERE (p.amenity in :amenities OR p.shop is not null ) "
                    "UNION "
                    "SELECT p.name, p.amenity, p.shop, 'polygon' AS type, ST_AsGeoJSON(ST_Transform(p.way, 4326)::geometry) as geom, ST_AsGeoJSON(ST_Transform(ST_Centroid(p.way), 4326)::geometry) AS centroid "
                    "FROM planet_osm_polygon p "
                    "JOIN city c ON st_contains(c.way, p.way) "
                    "WHERE (p.amenity in :amenities OR p.shop is not null ) "
                    "ORDER BY amenity")
    else:
        return text("WITH city AS ( "
                    "SELECT DISTINCT ON (name) name, way_area, way "
                    "FROM planet_osm_polygon "
                    "WHERE boundary = 'administrative' "
                    "AND admin_level = '9' "
                    "AND name = :name "
                    "ORDER BY name ASC, way_area DESC "
                    "LIMIT 1 "
                    ") "
                    "SELECT p.name, p.amenity, p.shop, 'point' AS type, ST_AsGeoJSON(ST_Transform(p.way, 4326)::geometry) as geom, ST_AsGeoJSON(ST_Transform(ST_Centroid(p.way), 4326)::geometry) AS centroid "
                    "FROM planet_osm_point p "
                    "JOIN city c ON st_contains(c.way, p.way) "
                    "WHERE (p.amenity in :amenities ) "
                    "UNION "
                    "SELECT p.name, p.amenity, p.shop, 'polygon' AS type, ST_AsGeoJSON(ST_Transform(p.way, 4326)::geometry) as geom, ST_AsGeoJSON(ST_Transform(ST_Centroid(p.way), 4326)::geometry) AS centroid "
                    "FROM planet_osm_polygon p "
                    "JOIN city c ON st_contains(c.way, p.way) "
                    "WHERE (p.amenity in :amenities ) "
                    "ORDER BY amenity")


def get_geojson_roads_leaving_city():
    return text("WITH city AS ("
                "SELECT DISTINCT ON(name) name, way_area, way "
                "FROM planet_osm_polygon "
                "WHERE boundary = 'administrative' "
                "AND admin_level = '9' "
                "AND name = :name "
                "ORDER BY name ASC, way_area DESC "
                "LIMIT 1) "
                "SELECT l.name, 'line' AS type, ST_AsGeoJSON(ST_Transform(l.way, 4326)::geometry) AS geom, ST_Length(ST_Transform(l.way, 26986)::geometry) AS len, ST_AsGeoJSON(ST_Line_Interpolate_Point(ST_Transform(l.way, 4326)::geometry, 0.5)) AS centroid, l.highway "
                "FROM planet_osm_line l "
                "JOIN city c ON st_crosses(l.way, c.way) "
                "WHERE highway in ('residential', 'tertiary', 'primary', 'secondary', 'service') "
                "ORDER BY highway ")


def get_water_houses_in_city():
    return text("WITH city AS ( "
                "SELECT DISTINCT ON(name) name, way_area, way "
                "FROM planet_osm_polygon "
                "WHERE boundary = 'administrative' "
                "AND admin_level = '9' "
                "AND name = :name "
                "ORDER BY name ASC, way_area DESC "
                "LIMIT 1), "
                "water AS ( "
                "  SELECT st_buffer(st_transform(w.way, 4326)::geography, 500) AS way FROM planet_osm_polygon w "
                "  JOIN city c ON st_intersects(st_buffer(st_transform(w.way, 4326)::geography, 500), st_transform(c.way, 4326)::geography) "
                "  WHERE w.water is not null OR w.natural in ('water', 'lake', 'river') "
                ") "
                "SELECT h.name AS name, h.\"addr:housename\" AS house, h.\"addr:housenumber\" AS number, ST_Area(ST_Transform(h.way, 4326)::geography) AS area, 'polygon' AS type, ST_AsGeoJSON(ST_Transform(h.way, 4326)::geometry) AS geom, ST_AsGeoJSON(ST_Transform(ST_Centroid(h.way), 4326)::geometry) AS centroid, h.building "
                "FROM planet_osm_polygon h "
                "JOIN water w ON st_intersects(st_transform(h.way, 4326)::geography, w.way) "
                "JOIN city c ON st_intersects(h.way, c.way) "
                "WHERE building in ('yes', 'garage', 'house', 'apartmenrs', 'detached', 'residential', 'garages', 'hut', 'cabin', 'hotel') "
                "ORDER BY building ")
