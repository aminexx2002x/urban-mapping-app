-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create wilayas table
CREATE TABLE IF NOT EXISTS wilayas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE,
  geom geometry(MultiPolygon, 4326)
);

-- Create spatial index
CREATE INDEX idx_wilayas_geom ON wilayas USING GIST (geom);