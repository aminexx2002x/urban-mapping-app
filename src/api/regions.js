const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'odooadmin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'urban_map_app_db',
  password: process.env.DB_PASSWORD || 'admin',
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

// Fetch all regions
router.get('/regions', async (req, res) => {
  try {
    console.log('Fetching regions...');
    const query = `
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
    `;
    const result = await pool.query(query);
    console.log('Regions fetched:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching regions:', err);
    res.status(500).json({ error: 'Failed to fetch regions', details: err.message });
  }
});

// Fetch all wilayas
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
    const result = await pool.query(query);
    console.log('Wilayas fetched:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching wilayas:', err);
    res.status(500).json({ error: 'Failed to fetch wilayas', details: err.message });
  }
});

// Fetch all dairas
router.get('/dairas', async (req, res) => {
  try {
    console.log('Fetching dairas...');
    const query = `
      SELECT d.id, d.name, d.wilaya_id, w.name as wilaya_name
      FROM dairas d
      JOIN wilayas w ON w.id = d.wilaya_id
      ORDER BY d.name
    `;
    const result = await pool.query(query);
    console.log('Dairas fetched:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching dairas:', err);
    res.status(500).json({ error: 'Failed to fetch dairas', details: err.message });
  }
});

// Fetch all communes
router.get('/communes', async (req, res) => {
  try {
    console.log('Fetching communes...');
    const query = `
      SELECT c.id, c.name, c.daira_id, d.name as daira_name
      FROM communes c
      JOIN dairas d ON d.id = c.daira_id
      ORDER BY c.name
    `;
    const result = await pool.query(query);
    console.log('Communes fetched:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching communes:', err);
    res.status(500).json({ error: 'Failed to fetch communes', details: err.message });
  }
});

// Fetch administrative regions
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
    const result = await pool.query(query);
    console.log('Administrative regions fetched:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching administrative regions:', err);
    res.status(500).json({ error: 'Failed to fetch administrative regions', details: err.message });
  }
});

// Fetch wilaya boundaries
router.get('/wilaya-boundaries/:id', async (req, res) => {
  try {
    const wilayaId = req.params.id;
    console.log('Fetching boundaries for wilaya ID:', wilayaId);

    // Check if the wilaya exists
    const checkQuery = `SELECT id, name FROM wilayas WHERE id = $1`;
    const wilayaCheck = await pool.query(checkQuery, [wilayaId]);

    if (wilayaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Wilaya not found' });
    }

    // Fetch the geometry
    const query = `
      SELECT 
        w.id,
        w.name,
        ST_AsGeoJSON(ST_Transform(w.geom, 4326))::json as geometry
      FROM wilayas w
      WHERE w.id = $1 AND w.geom IS NOT NULL
    `;
    const result = await pool.query(query, [wilayaId]);

    if (result.rows.length > 0 && result.rows[0].geometry) {
      const response = {
        type: 'Feature',
        properties: {
          id: result.rows[0].id,
          name: result.rows[0].name
        },
        geometry: result.rows[0].geometry
      };
      console.log('Sending boundary data:', response);
      res.json(response);
    } else {
      res.status(404).json({ error: 'No boundary data found for this wilaya' });
    }
  } catch (err) {
    console.error('Error fetching wilaya boundaries:', err);
    res.status(500).json({ error: 'Failed to fetch wilaya boundaries', details: err.message });
  }
});

// Fetch commune boundaries
router.get('/commune-boundaries/:id', async (req, res) => {
  try {
    const communeId = req.params.id;
    console.log('Fetching boundaries for commune ID:', communeId);

    // Check if the commune exists
    const checkQuery = `SELECT id, name FROM communes WHERE id = $1`;
    const communeCheck = await pool.query(checkQuery, [communeId]);

    if (communeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Commune not found' });
    }

    // Fetch the geometry
    const query = `
      SELECT 
        c.id,
        c.name,
        ST_AsGeoJSON(ST_Transform(c.geom, 4326))::json as geometry
      FROM communes c
      WHERE c.id = $1 AND c.geom IS NOT NULL
    `;
    const result = await pool.query(query, [communeId]);

    if (result.rows.length > 0 && result.rows[0].geometry) {
      const response = {
        type: 'Feature',
        properties: {
          id: result.rows[0].id,
          name: result.rows[0].name
        },
        geometry: result.rows[0].geometry
      };
      console.log('Sending commune boundary data:', response);
      res.json(response);
    } else {
      res.status(404).json({ error: 'No boundary data found for this commune' });
    }
  } catch (err) {
    console.error('Error fetching commune boundaries:', err);
    res.status(500).json({ error: 'Failed to fetch commune boundaries', details: err.message });
  }
});

module.exports = router;