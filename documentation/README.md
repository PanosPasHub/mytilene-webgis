#  Mytilene Environmental WebGIS - Documentation

##  Project Structure
- **Frontend**: React application (src/)
- **Backend**: Node.js API (backend/)
- **Database**: PostgreSQL with PostGIS
- **GIS**: GeoServer WMS layers

##  Quick Start

### 1. Backend Setup
\\\ash
cd backend
npm install
cp .env.example .env
# Configure database in .env
npm run dev
\\\

### 2. Frontend Setup
\\\ash
npm install
npm start
\\\

### 3. Database Setup
\\\sql
CREATE DATABASE mytilene_environment;
\\c mytilene_environment;
CREATE EXTENSION postgis;
\\\

## 📡 API Usage
See backend/README.md for complete API documentation

## 🗺️ GeoServer Configuration
- Workspace: mytilenegis
- Layers: environmental_reports, heat_analysis, noise_hotspots
- Styles: Custom SLD for visualization
