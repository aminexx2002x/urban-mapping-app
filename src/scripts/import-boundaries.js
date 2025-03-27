require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'urban_map_app_db',
  password: process.env.DB_PASSWORD || 'admin',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function importBoundaries() {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to database');

    // Drop existing table and recreate
    await client.query('DROP TABLE IF EXISTS wilayas CASCADE;');
    
    // Enable PostGIS
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('PostGIS extension enabled');

    // Create table with UNIQUE constraint
    await client.query(`
      CREATE TABLE wilayas (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        geom geometry(MultiPolygon, 4326)
      );
    `);
    console.log('Table created');

    // Read WKT data
    const wktPath = path.join(__dirname, '../convert_geojson/wilayas.wkt.json');
    console.log('Reading from:', wktPath);
    
    const wktData = JSON.parse(fs.readFileSync(wktPath, 'utf8'));
    console.log(`Found ${wktData.length} wilayas`);

    // Begin transaction
    await client.query('BEGIN');

    // Insert data
    for (const wilaya of wktData) {
      await client.query(`
        INSERT INTO wilayas (name, geom)
        VALUES ($1, ST_Multi(ST_GeomFromText($2, 4326)))
        ON CONFLICT (name) DO UPDATE 
        SET geom = EXCLUDED.geom;
      `, [wilaya.name, wilaya.wkt]);
      console.log(`Imported: ${wilaya.name}`);
    }

    // Create spatial index
    await client.query(`
      CREATE INDEX idx_wilayas_geom ON wilayas USING GIST (geom);
    `);

    await client.query('COMMIT');
    console.log('Import completed successfully');

  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error:', err);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Execute with proper error handling
importBoundaries().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});