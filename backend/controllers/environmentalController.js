const db = require('../config/database');

// GET all reports
const getAllReports = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, title, description, 
        noise_level, temperature_feeling, pollution_type,
        latitude, longitude, weather_conditions, time_of_day,
        urgency, status, verified, created_at
      FROM environmental_reports 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM environmental_reports WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// CREATE new report - ΔΙΟΡΘΩΜΕΝΗ ΕΚΔΟΣΗ
const createReport = async (req, res) => {
  try {
    const {
      title,
      description,
      noise_level,
      temperature_feeling,
      pollution_type,
      latitude,
      longitude,
      weather_conditions,
      time_of_day,
      urgency = 'medium'
    } = req.body;

    console.log('📨 Received data:', req.body);

    // Validation
    if (!title || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Title, latitude, and longitude are required'
      });
    }

    // Απλή μετατροπή χωρίς formatting
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    console.log('📍 Coordinates as numbers:', latNum, lngNum);

    // Χρήση απλού query χωρίς explicit casting
    const result = await db.query(
      `INSERT INTO environmental_reports 
      (title, description, noise_level, temperature_feeling, pollution_type,
       latitude, longitude, geom, weather_conditions, time_of_day, urgency)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 
              ST_SetSRID(ST_MakePoint($7, $6), 4326), 
              $8, $9, $10)
      RETURNING *`,
      [
        title, 
        description, 
        noise_level, 
        temperature_feeling, 
        pollution_type,
        latNum,  // $6 - latitude
        lngNum,  // $7 - longitude  
        weather_conditions, 
        time_of_day, 
        urgency
      ]
    );

    console.log('✅ Report created successfully:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Environmental report created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET reports as GeoJSON - ΕΝΑΛΛΑΚΤΙΚΗ ΑΠΛΗ ΛΥΣΗ
const getReportsGeoJSON = async (req, res) => {
  try {
    console.log('🗺️ Fetching reports as GeoJSON (alternative method)...');
    
    const result = await db.query(`
      SELECT 
        id,
        title,
        description,
        noise_level as "noiseLevel",
        temperature_feeling as "temperatureFeeling", 
        pollution_type as "pollutionType",
        urgency,
        status,
        weather_conditions as "weatherConditions",
        time_of_day as "timeOfDay",
        created_at as "createdAt",
        ST_AsGeoJSON(geom)::json as geometry
      FROM environmental_reports
      WHERE status IN ('approved', 'pending')
      ORDER BY created_at DESC
    `);

    console.log('📊 Raw reports from DB:', result.rows.length);

    // Μετατροπή σε GeoJSON format
    const features = result.rows.map(row => ({
      type: 'Feature',
      geometry: row.geometry,
      properties: {
        id: row.id,
        title: row.title,
        description: row.description,
        noiseLevel: row.noiseLevel,
        temperatureFeeling: row.temperatureFeeling,
        pollutionType: row.pollutionType,
        urgency: row.urgency,
        status: row.status,
        weather: row.weatherConditions,
        timeOfDay: row.timeOfDay,
        createdDate: row.createdAt
      }
    }));

    const geojson = {
      type: 'FeatureCollection',
      features: features
    };

    console.log('✅ GeoJSON generated with features:', features.length);
    res.json(geojson);

  } catch (error) {
    console.error('❌ Error in getReportsGeoJSON:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET heat analysis
const getHeatAnalysis = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        temperature_feeling,
        COUNT(*) as report_count,
        ROUND(AVG(
          CASE 
            WHEN temperature_feeling = 'unbearable' THEN 4
            WHEN temperature_feeling = 'hot' THEN 3
            WHEN temperature_feeling = 'warm' THEN 2
            WHEN temperature_feeling = 'comfortable' THEN 1
            ELSE 0
          END
        ), 2) as avg_heat_score
      FROM environmental_reports
      WHERE temperature_feeling IS NOT NULL
      GROUP BY temperature_feeling
      ORDER BY avg_heat_score DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET noise analysis
const getNoiseAnalysis = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        noise_level,
        COUNT(*) as report_count,
        time_of_day,
        ROUND(AVG(
          CASE 
            WHEN noise_level = 'very_high' THEN 4
            WHEN noise_level = 'high' THEN 3
            WHEN noise_level = 'medium' THEN 2
            WHEN noise_level = 'low' THEN 1
            ELSE 0
          END
        ), 2) as avg_noise_score
      FROM environmental_reports
      WHERE noise_level IS NOT NULL
      GROUP BY noise_level, time_of_day
      ORDER BY time_of_day, avg_noise_score DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET spatial hotspots - ΔΙΟΡΘΩΜΕΝΗ ΕΚΔΟΣΗ
const getSpatialHotspots = async (req, res) => {
  try {
    const { type = 'heat', radius = 500 } = req.query;
    
    let whereClause = '';
    if (type === 'heat') {
      whereClause = "WHERE temperature_feeling IN ('hot', 'unbearable')";
    } else if (type === 'noise') {
      whereClause = "WHERE noise_level IN ('high', 'very_high')";
    }

    // Χρησιμοποιούμε subquery για να αποφύγουμε το window function στο GROUP BY
    const result = await db.query(`
      WITH points_with_clusters AS (
        SELECT 
          *,
          ST_ClusterDBSCAN(geom, $1 / 111320.0, 3) OVER() as cluster_id
        FROM environmental_reports
        ${whereClause}
      ),
      clusters AS (
        SELECT 
          cluster_id,
          COUNT(*) as report_count,
          AVG(CASE WHEN temperature_feeling IN ('hot', 'unbearable') THEN 1 ELSE 0 END) as heat_ratio,
          AVG(CASE WHEN noise_level IN ('high', 'very_high') THEN 1 ELSE 0 END) as noise_ratio,
          ST_Centroid(ST_Collect(geom)) as centroid
        FROM points_with_clusters
        GROUP BY cluster_id
        HAVING COUNT(*) >= 1  -- Μειώσαμε για να δούμε αποτελέσματα
      )
      SELECT 
        cluster_id,
        report_count,
        heat_ratio,
        noise_ratio,
        ST_AsGeoJSON(centroid) as geometry
      FROM clusters
      WHERE cluster_id IS NOT NULL
      ORDER BY report_count DESC
    `, [radius]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create Heat Analysis View
const createHeatAnalysisView = async (req, res) => {
  try {
    // Drop view if exists
    await db.query('DROP VIEW IF EXISTS heat_analysis CASCADE;');

    // Create the view
    await db.query(`
      CREATE VIEW heat_analysis AS
      SELECT 
        id,
        title,
        description,
        noise_level,
        temperature_feeling,
        pollution_type,
        urgency,
        status,
        weather_conditions,
        time_of_day,
        created_at,
        geom,
        CASE 
          WHEN temperature_feeling = 'unbearable' THEN 4
          WHEN temperature_feeling = 'hot' THEN 3
          WHEN temperature_feeling = 'warm' THEN 2
          WHEN temperature_feeling = 'comfortable' THEN 1
          ELSE 0
        END as heat_score,
        CASE 
          WHEN noise_level = 'very_high' THEN 4
          WHEN noise_level = 'high' THEN 3
          WHEN noise_level = 'medium' THEN 2
          WHEN noise_level = 'low' THEN 1
          ELSE 0
        END as noise_score,
        CASE 
          WHEN pollution_type IS NOT NULL THEN 1
          ELSE 0
        END as has_pollution
      FROM environmental_reports
      WHERE temperature_feeling IS NOT NULL;
    `);

    console.log('✅ Heat Analysis View created successfully');
    
    res.json({
      success: true,
      message: 'Heat Analysis View created successfully',
      view: 'heat_analysis'
    });

  } catch (error) {
    console.error('❌ Error creating Heat Analysis View:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create Noise Hotspots View
const createNoiseHotspotsView = async (req, res) => {
  try {
    // Drop view if exists
    await db.query('DROP VIEW IF EXISTS noise_hotspots CASCADE;');

    // Create the view
    await db.query(`
      CREATE VIEW noise_hotspots AS
      SELECT 
        id,
        title,
        description,
        noise_level,
        temperature_feeling,
        pollution_type,
        urgency,
        status,
        weather_conditions,
        time_of_day,
        created_at,
        geom,
        CASE 
          WHEN noise_level = 'very_high' THEN 4
          WHEN noise_level = 'high' THEN 3
          WHEN noise_level = 'medium' THEN 2
          WHEN noise_level = 'low' THEN 1
          ELSE 0
        END as noise_score,
        CASE 
          WHEN temperature_feeling = 'unbearable' THEN 4
          WHEN temperature_feeling = 'hot' THEN 3
          WHEN temperature_feeling = 'warm' THEN 2
          WHEN temperature_feeling = 'comfortable' THEN 1
          ELSE 0
        END as heat_score,
        CASE 
          WHEN pollution_type IS NOT NULL THEN 1
          ELSE 0
        END as has_pollution
      FROM environmental_reports
      WHERE noise_level IS NOT NULL;
    `);

    console.log('✅ Noise Hotspots View created successfully');
    
    res.json({
      success: true,
      message: 'Noise Hotspots View created successfully',
      view: 'noise_hotspots'
    });

  } catch (error) {
    console.error('❌ Error creating Noise Hotspots View:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create All GeoServer Views
const createAllGeoServerViews = async (req, res) => {
  try {
    console.log('🗺️ Creating all GeoServer views...');
    
    // Drop existing views
    await db.query('DROP VIEW IF EXISTS heat_analysis CASCADE;');
    await db.query('DROP VIEW IF EXISTS noise_hotspots CASCADE;');

    // Create Heat Analysis View
    await db.query(`
      CREATE VIEW heat_analysis AS
      SELECT 
        id,
        title,
        description,
        noise_level,
        temperature_feeling,
        pollution_type,
        urgency,
        status,
        weather_conditions,
        time_of_day,
        created_at,
        geom,
        CASE 
          WHEN temperature_feeling = 'unbearable' THEN 4
          WHEN temperature_feeling = 'hot' THEN 3
          WHEN temperature_feeling = 'warm' THEN 2
          WHEN temperature_feeling = 'comfortable' THEN 1
          ELSE 0
        END as heat_score,
        CASE 
          WHEN noise_level = 'very_high' THEN 4
          WHEN noise_level = 'high' THEN 3
          WHEN noise_level = 'medium' THEN 2
          WHEN noise_level = 'low' THEN 1
          ELSE 0
        END as noise_score,
        CASE 
          WHEN pollution_type IS NOT NULL THEN 1
          ELSE 0
        END as has_pollution
      FROM environmental_reports
      WHERE temperature_feeling IS NOT NULL;
    `);

    // Create Noise Hotspots View
    await db.query(`
      CREATE VIEW noise_hotspots AS
      SELECT 
        id,
        title,
        description,
        noise_level,
        temperature_feeling,
        pollution_type,
        urgency,
        status,
        weather_conditions,
        time_of_day,
        created_at,
        geom,
        CASE 
          WHEN noise_level = 'very_high' THEN 4
          WHEN noise_level = 'high' THEN 3
          WHEN noise_level = 'medium' THEN 2
          WHEN noise_level = 'low' THEN 1
          ELSE 0
        END as noise_score,
        CASE 
          WHEN temperature_feeling = 'unbearable' THEN 4
          WHEN temperature_feeling = 'hot' THEN 3
          WHEN temperature_feeling = 'warm' THEN 2
          WHEN temperature_feeling = 'comfortable' THEN 1
          ELSE 0
        END as heat_score,
        CASE 
          WHEN pollution_type IS NOT NULL THEN 1
          ELSE 0
        END as has_pollution
      FROM environmental_reports
      WHERE noise_level IS NOT NULL;
    `);

    console.log('✅ All GeoServer views created successfully');
    
    res.json({
      success: true,
      message: 'All GeoServer views created successfully',
      views: ['heat_analysis', 'noise_hotspots']
    });

  } catch (error) {
    console.error('❌ Error creating GeoServer views:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get GeoServer Status
const getGeoServerStatus = async (req, res) => {
  try {
    const views = await db.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('heat_analysis', 'noise_hotspots')
    `);

    // Check if views exist and have data
    const viewStatus = await Promise.all(
      views.rows.map(async (view) => {
        const countResult = await db.query(`SELECT COUNT(*) FROM ${view.table_name}`);
        return {
          name: view.table_name,
          type: view.table_type,
          record_count: parseInt(countResult.rows[0].count)
        };
      })
    );

    res.json({
      success: true,
      data: {
        views: viewStatus,
        connection: 'Active',
        geoserverUrl: 'http://localhost:8080/geoserver',
        workspace: 'mytilenegis'
      }
    });
  } catch (error) {
    console.error('❌ Error getting GeoServer status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get spatial bounds for GeoServer
const getSpatialBounds = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        ST_XMin(ST_Extent(geom)) as min_lng,
        ST_YMin(ST_Extent(geom)) as min_lat,
        ST_XMax(ST_Extent(geom)) as max_lng, 
        ST_YMax(ST_Extent(geom)) as max_lat
      FROM environmental_reports
    `);

    const bounds = result.rows[0];
    
    res.json({
      success: true,
      data: {
        minX: parseFloat(bounds.min_lng),
        minY: parseFloat(bounds.min_lat), 
        maxX: parseFloat(bounds.max_lng),
        maxY: parseFloat(bounds.max_lat),
        // GeoServer format
        bbox: {
          minx: parseFloat(bounds.min_lng),
          miny: parseFloat(bounds.min_lat),
          maxx: parseFloat(bounds.max_lng),
          maxy: parseFloat(bounds.max_lat)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting spatial bounds:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAllReports,
  getReportById,
  createReport,
  getReportsGeoJSON,
  getHeatAnalysis,
  getNoiseAnalysis,
  getSpatialHotspots,
  createHeatAnalysisView,
  createNoiseHotspotsView,
  createAllGeoServerViews,
  getGeoServerStatus,
  getSpatialBounds
};