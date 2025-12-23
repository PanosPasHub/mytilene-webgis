const pool = require('../config/db');

// --- ΡΥΘΜΙΣΕΙΣ ΟΡΙΩΝ ---
const MYTILENE_BOUNDS = {
  minLat: 39.0500, 
  maxLat: 39.1600, 
  minLon: 26.5000, 
  maxLon: 26.6200  
};

// Όρια dB για αποφυγή ακραίων/λανθασμένων τιμών
const NOISE_LIMITS = {
  min: 30,  // Κάτω από 30dB είναι συνήθως θόρυβος συσκευής
  max: 130  // Πάνω από 130dB είναι μη ρεαλιστικό για περιβαλλοντικό θόρυβο
};

// 1. Λήψη Δεδομένων (GET) - Επιστρέφει GeoJSON
const getNoiseReports = async (req, res) => {
  try {
    const query = `
      SELECT 
        report_id, 
        noise_db_val, 
        noise_source, 
        annoyance_level, 
        rec_time,
        ST_AsGeoJSON(geom)::json as geometry
      FROM environmentalnoise_reports
      ORDER BY rec_time DESC
    `;

    const result = await pool.query(query);

    const geojson = {
      type: "FeatureCollection",
      features: result.rows.map(row => ({
        type: "Feature",
        geometry: row.geometry,
        properties: {
          report_id: row.report_id,
          noise_db_val: row.noise_db_val,
          noise_source: row.noise_source,
          annoyance_level: row.annoyance_level,
          rec_time: row.rec_time
        }
      }))
    };

    console.log(`📡 Served ${geojson.features.length} points to client`);
    res.json(geojson);

  } catch (err) {
    console.error('❌ Controller Error (GET):', err.message);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

// 2. Υποβολή Δεδομένων (POST) - Με Geofencing & Sanity Check
const submitNoiseReport = async (req, res) => {
  const { noise_db_val, noise_source, annoyance_level, latitude, longitude } = req.body;

  // A. Validation: Έλεγχος αν υπάρχουν τα απαραίτητα
  if (!noise_db_val || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // B. Validation: Έλεγχος Ακραίων Τιμών (Sanity Check)
  // Αν η τιμή είναι εκτός λογικών ορίων, την απορρίπτουμε
  if (noise_db_val < NOISE_LIMITS.min || noise_db_val > NOISE_LIMITS.max) {
    console.warn(`⚠️ Rejected extreme noise value: ${noise_db_val} dB`);
    return res.status(400).json({ 
      error: 'Invalid noise value', 
      message: `Η τιμή θορύβου (${noise_db_val} dB) είναι εκτός λογικών ορίων (30-130 dB).` 
    });
  }

  // C. Validation: Geofencing (Έλεγχος Περιοχής)
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const isInside = lat >= MYTILENE_BOUNDS.minLat && lat <= MYTILENE_BOUNDS.maxLat && 
                   lon >= MYTILENE_BOUNDS.minLon && lon <= MYTILENE_BOUNDS.maxLon;

  if (!isInside) {
    console.warn(`⚠️ Rejected report outside Mytilene: ${lat}, ${lon}`);
    return res.status(400).json({ 
      error: 'Location out of bounds', 
      message: 'Η καταγραφή βρίσκεται εκτός της περιοχής της Μυτιλήνης.' 
    });
  }

  try {
    const query = `
      INSERT INTO environmentalnoise_reports 
      (noise_db_val, noise_source, annoyance_level, geom)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
      RETURNING report_id, noise_db_val, rec_time;
    `;

    const values = [noise_db_val, noise_source, annoyance_level, lon, lat];
    
    const result = await pool.query(query, values);
    
    console.log('✅ New Report Saved:', result.rows[0]);
    res.status(201).json({ message: 'Success', data: result.rows[0] });

  } catch (err) {
    console.error('❌ Controller Error (POST):', err.message);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

module.exports = {
  getNoiseReports,
  submitNoiseReport
};