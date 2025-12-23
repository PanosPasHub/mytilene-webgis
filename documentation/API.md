📡 API Documentation

Base URL: http://localhost:5000/api

🔊 Noise Monitoring

1. Submit Noise Report

Records a new environmental noise measurement.

Endpoint:
POST /noise

Headers:
Content-Type: application/json

Body Parameters:
| Field | Type | Description |
|---|---|---|
| noise_db_val | Number | Noise level in decibels (30-130) |
| noise_source | String | Source category (e.g., 'traffic', 'music') |
| annoyance_level| Number | User annoyance rating (1-10) |
| latitude | Number | GPS Latitude |
| longitude | Number | GPS Longitude |

Example Request:

{
  "noise_db_val": 75.5,
  "noise_source": "traffic",
  "annoyance_level": 5,
  "latitude": 39.1065,
  "longitude": 26.5562
}


Success Response (201 Created):

{
  "message": "Success",
  "data": {
    "report_id": 42,
    "noise_db_val": 75.5,
    "rec_time": "2024-12-20T10:00:00.000Z"
  }
}


2. Get Noise Data (GeoJSON)

Retrieves all recorded measurements formatted as a GeoJSON FeatureCollection for mapping.

Endpoint:
GET /noise

Response (200 OK):

{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [26.5562, 39.1065]
      },
      "properties": {
        "report_id": 42,
        "noise_db_val": 75.5,
        "noise_source": "traffic",
        "annoyance_level": 5,
        "rec_time": "2024-12-20T10:00:00.000Z"
      }
    }
  ]
}


⚙️ System

Health Check

Checks if the API server is running and database is connected.

Endpoint:
GET /health

Response:

{
  "status": "UP",
  "system": "Mytilene Noise Watch Backend",
  "timestamp": "2024-12-20T10:05:00.000Z"
}
