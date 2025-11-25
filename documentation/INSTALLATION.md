#  Complete Installation Guide

## Prerequisites
- Node.js 16+
- PostgreSQL 13+ with PostGIS
- GeoServer 2.23+

## Backend Configuration
1. Navigate to backend directory
2. Install dependencies: \
pm install\
3. Copy environment file: \cp .env.example .env\
4. Configure database connection in .env
5. Start server: \
pm run dev\

## Database Setup
\\\sql
-- Create database
CREATE DATABASE mytilene_environment;

-- Connect and enable PostGIS
\\c mytilene_environment;
CREATE EXTENSION postgis;

-- The backend will create tables automatically
\\\

## Frontend Setup
1. Install dependencies: \
pm install\
2. Start development server: \
pm start\
3. Access at http://localhost:3000

## GeoServer Setup
1. Install GeoServer
2. Create workspace: mytilenegis
3. Add PostgreSQL data store
4. Configure WMS layers
5. Apply custom SLD styles
