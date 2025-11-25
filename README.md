# 📡 API Documentation

## Environmental Reports

### Submit New Report
\\\http
POST /api/environmental/reports
Content-Type: application/json

{
  \"title\": \"Ζέστη στην πλατεία\",
  \"description\": \"Πολύ ζέστη το μεσημέρι\",
  \"temperature_feeling\": \"hot\",
  \"noise_level\": \"medium\", 
  \"latitude\": 39.108,
  \"longitude\": 26.555
}
\\\

### Get Reports as GeoJSON
\\\http
GET /api/environmental/reports/geojson
\\\

## Analysis Endpoints

### Heat Analysis
\\\http
GET /api/environmental/analysis/heat
\\\

### Spatial Hotspots
\\\http
GET /api/environmental/analysis/hotspots?type=heat
GET /api/environmental/analysis/hotspots?type=noise
\\\

## GeoServer Management
\\\http
GET /api/environmental/geoserver/status
POST /api/environmental/geoserver/views/all
\\\
"@ | Out-File -FilePath "documentation/API.md" -Encoding UTF8

git add documentation/
git commit -m " Documentation: Complete setup guides & API documentation

 DOCUMENTATION INCLUDES:
 Project overview and structure
 Step-by-step installation guide
 Complete API reference
 Database setup instructions
 GeoServer configuration guide

 PURPOSE:
 Easy project setup for new developers
 Comprehensive API usage examples
 Production deployment guidance
 Maintenance and scaling documentation"
# Ενημέρωση του κύριου README
@"
#  Mytilene Environmental WebGIS - Complete Full-Stack Application

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green)](https://nodejs.org/)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.0+-orange)](https://postgis.net/)
[![GeoServer](https://img.shields.io/badge/GeoServer-2.23-yellow)](https://geoserver.org/)

> Complete environmental monitoring platform with real-time GIS capabilities for Mytilene

##  Project Structure

\\\
mytilene-webgis/
  src/                    # React Frontend Application
  backend/               # Node.js API Server
  documentation/         # Setup Guides & Documentation
  README.md             # Project Overview
  .gitignore            # Git Ignore Rules
\\\

##  Features

###  Environmental Monitoring
- Real-time citizen reporting system
- Spatial analysis with PostGIS
- Heat & noise hotspots detection
- Interactive WebGIS interface

###  GIS & Mapping
- Professional WMS layers via GeoServer
- Custom SLD styling for data visualization
- Spatial clustering and heatmaps
- Multiple base map layers (OSM, Satellite)

###  Data Analytics
- Time-series analysis
- Category-based filtering
- Statistical dashboards
- Real-time data processing

##  Quick Start

See [documentation/INSTALLATION.md](documentation/INSTALLATION.md) for detailed setup instructions.

##  Development

\\\ash
# Backend (Port 5000)
cd backend && npm install && npm run dev

# Frontend (Port 3000) 
npm install && npm start
\\\

##  API Reference

Complete API documentation: [documentation/API.md](documentation/API.md)

##  License

MIT License

---

**Developed for Mytilene Environmental Monitoring**
