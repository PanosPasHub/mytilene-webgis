🛠️ Complete Installation Guide

Prerequisites

Node.js (v16 or higher)

PostgreSQL (v13+) with PostGIS extension installed.

1. Database Setup (PostgreSQL)

Open your SQL tool (pgAdmin or terminal) and run:

-- 1. Create the database
CREATE DATABASE mytilene_environment;

-- 2. Connect to the database
\c mytilene_environment;

-- 3. Enable Spatial Extensions
CREATE EXTENSION postgis;

-- 4. Create the main table
CREATE TABLE environmentalnoise_reports (
    report_id SERIAL PRIMARY KEY,
    noise_db_val NUMERIC(5,2) NOT NULL,
    noise_source VARCHAR(50),
    annoyance_level INTEGER CHECK (annoyance_level BETWEEN 1 AND 10),
    rec_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(Point, 4326)
);

-- 5. Create Spatial Index (Crucial for performance)
CREATE INDEX idx_noise_geom ON environmentalnoise_reports USING GIST (geom);


2. Backend Setup (Node.js)

The backend serves the API and handles database connections.

Navigate to the backend folder:

cd backend


Install dependencies:

npm install


Create a .env file based on your database credentials:

DB_USER=postgres
DB_HOST=localhost
DB_NAME=mytilene_environment
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5000


Start the server:

npm start


You should see: 🚀 Server running on http://localhost:5000

3. Frontend Setup (React)

The frontend visualizes the data using Leaflet maps.

Navigate to the root folder (src location):

cd ..


Install dependencies (including map libraries):

npm install
npm install leaflet react-leaflet leaflet.heat


Start the application:

npm start


Open your browser at http://localhost:3000.

✅ Verification

Open the Analysis Page.

Ensure the map loads.

Use the Time Slider to check if data points appear/disappear.

Toggle Heatmap Mode to verify client-side rendering.