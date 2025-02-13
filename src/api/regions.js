const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'urban_map_app_db',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Database connection successful');
  release();
});

router.get('/regions', async (req, res) => {
  try {
    console.log('Fetching regions...');
    const result = await pool.query(`
      SELECT r.id, r.name, 
        COALESCE(json_agg(
          CASE WHEN w.id IS NOT NULL 
            THEN json_build_object('id', w.id, 'name', w.name)
            ELSE NULL 
          END
        ) FILTER (WHERE w.id IS NOT NULL), '[]') as wilayas
      FROM regions r
      LEFT JOIN wilayas w ON w.region_id = r.id
      GROUP BY r.id, r.name
      ORDER BY r.name
    `);
    
    console.log('Regions fetched:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching regions:', err);
    res.status(500).json({ 
      error: 'Failed to fetch regions',
      details: err.message 
    });
  }
});

router.get('/wilayas', async (req, res) => {
  try {
    console.log('Fetching wilayas...');
    const query = `
      SELECT 
        w.id, 
        w.name, 
        w.region_id, 
        r.name as region_name,
        w.latitude,
        w.longitude,
        w.zoom_level
      FROM wilayas w
      JOIN regions r ON r.id = w.region_id
      ORDER BY w.name
    `;
    
    const { rows } = await pool.query(query);
    console.log('Wilayas fetched:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching wilayas:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wilayas',
      details: error.message 
    });
  }
});

router.get('/dairas', async (req, res) => {
  try {
    console.log('Fetching dairas...');
    const result = await pool.query(`
      SELECT d.id, d.name, d.wilaya_id, w.name as wilaya_name
      FROM dairas d
      JOIN wilayas w ON w.id = d.wilaya_id
      ORDER BY d.name
    `);
    
    console.log('Dairas fetched:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching dairas:', err);
    res.status(500).json({ 
      error: 'Failed to fetch dairas',
      details: err.message 
    });
  }
});

router.get('/communes', async (req, res) => {
  try {
    console.log('Fetching communes...');
    const result = await pool.query(`
      SELECT c.id, c.name, c.daira_id, d.name as daira_name
      FROM communes c
      JOIN dairas d ON d.id = c.daira_id
      ORDER BY c.name
    `);
    
    console.log('Communes fetched:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching communes:', err);
    res.status(500).json({ 
      error: 'Failed to fetch communes',
      details: err.message 
    });
  }
});

router.get('/administrative-regions', async (req, res) => {
  try {
    console.log('Fetching administrative regions...');
    const query = `
      SELECT 
        r.id, 
        r.name,
        json_agg(json_build_object(
          'id', w.id,
          'name', w.name,
          'dairas', (
            SELECT json_agg(json_build_object(
              'id', d.id,
              'name', d.name,
              'communes', (
                SELECT json_agg(json_build_object(
                  'id', c.id,
                  'name', c.name
                ))
                FROM communes c
                WHERE c.daira_id = d.id
              )
            ))
            FROM dairas d
            WHERE d.wilaya_id = w.id
          )
        )) as wilayas
      FROM regions r
      LEFT JOIN wilayas w ON w.region_id = r.id
      GROUP BY r.id, r.name
      ORDER BY r.name;
    `;
    
    const { rows } = await pool.query(query);
    console.log('Administrative regions fetched:', rows);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching administrative regions:', err);
    res.status(500).json({ 
      error: 'Failed to fetch administrative regions',
      details: err.message 
    });
  }
});

router.get('/wilaya-boundaries/:id', async (req, res) => {
  try {
    const wilayaId = req.params.id;
    console.log('Fetching boundaries for wilaya ID:', wilayaId);
    
    // First check if the wilaya exists
    const checkQuery = `
      SELECT id, name 
      FROM wilayas 
      WHERE id = $1`;
    
    const wilayaCheck = await pool.query(checkQuery, [wilayaId]);
    console.log('Wilaya exists:', wilayaCheck.rows);

    if (wilayaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Wilaya not found' });
    }

    // Then get the geometry
    const query = `
      SELECT 
        w.id,
        w.name,
        ST_AsGeoJSON(ST_Transform(w.geom, 4326))::json as geometry
      FROM wilayas w
      WHERE w.id = $1 AND w.geom IS NOT NULL`;
    
    const { rows } = await pool.query(query, [wilayaId]);
    console.log('Query result:', rows);
    
    if (rows.length > 0 && rows[0].geometry) {
      const response = {
        type: 'Feature',
        properties: {
          id: rows[0].id,
          name: rows[0].name
        },
        geometry: rows[0].geometry
      };
      console.log('Sending boundary data:', response);
      res.json(response);
    } else {
      // Wilaya exists but has no geometry
      res.status(404).json({ 
        error: 'No boundary data found for this wilaya',
        wilayaId,
        wilayaName: wilayaCheck.rows[0].name
      });
    }
  } catch (error) {
    console.error('Error fetching wilaya boundaries:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wilaya boundaries',
      details: error.message,
      stack: error.stack 
    });
  }
});

module.exports = router; 