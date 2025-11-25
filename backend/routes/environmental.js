const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/environmentalController');

// 🗺️ GeoJSON Route - ΠΡΙΝ από το :id route!
router.get('/reports/geojson', getReportsGeoJSON);

// 🔄 Basic CRUD Routes
router.get('/reports', getAllReports);
router.post('/reports', createReport);

// 📊 Analysis Routes
router.get('/analysis/heat', getHeatAnalysis);
router.get('/analysis/noise', getNoiseAnalysis);
router.get('/analysis/hotspots', getSpatialHotspots);

// 🆕 GeoServer Management Routes
router.get('/geoserver/status', getGeoServerStatus);
router.get('/geoserver/bounds', getSpatialBounds);
router.post('/geoserver/views/heat', createHeatAnalysisView);
router.post('/geoserver/views/noise', createNoiseHotspotsView);
router.post('/geoserver/views/all', createAllGeoServerViews);

// 🆔 Single Report Route - ΜΕΤΑ το geojson route!
router.get('/reports/:id', getReportById);

module.exports = router;