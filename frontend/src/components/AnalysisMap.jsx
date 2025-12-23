import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat'; // Απαιτεί: npm install leaflet.heat

// --- FIX ΓΙΑ ΤΑ ΕΙΚΟΝΙΔΙΑ LEAFLET ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- HEATMAP LAYER COMPONENT ---
function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // Μετατροπή δεδομένων: [lat, lng, intensity]
    const heatData = points.map(p => [
      p.geometry.coordinates[1],
      p.geometry.coordinates[0],
      parseFloat(p.properties.noise_db_val) / 100 // Κανονικοποίηση
    ]);

    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

// Helper για χρώματα Markers
const getMarkerIcon = (db) => {
  let color = '#22c55e';
  if (db >= 50 && db < 65) color = '#facc15';
  if (db >= 65 && db < 80) color = '#f97316';
  if (db >= 80) color = '#dc2626';

  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.4);"></div>`,
    className: 'custom-noise-marker',
    iconSize: [14, 14]
  });
};

// Μετάφραση πηγών
const getSourceLabel = (source) => {
  const mapping = {
    'nature': 'Φυσικό Περιβάλλον',
    'traffic': 'Οδική Κυκλοφορία',
    'construction': 'Εργοτάξιο / Κατασκευές',
    'music': 'Έντονη Μουσική / Διασκέδαση',
    'human': 'Ανθρώπινη Ομιλία / Πλήθος',
    'industrial': 'Βιομηχανικός Θόρυβος',
    'other': 'Άλλο'
  };
  return mapping[source?.toLowerCase()] || source || 'Άγνωστο';
};

// --- MAIN COMPONENT ---
export function AnalysisMap({ reports = [], mode = 'points' }) {
  const position = [39.1042, 26.5500];

  return (
    <div className="w-full h-full relative">
      
      {/* CSS HACK: Κρύβουμε το κουμπί LayersControl από τον χρήστη */}
      <style>
        {`
          .leaflet-control-layers {
            display: none !important;
          }
        `}
      </style>

      <MapContainer 
        center={position} 
        zoom={14} 
        className="w-full h-full"
      >
        <LayersControl position="topright">
          {/* Base Layers */}
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Dark Matter">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CartoDB'
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri'
            />
          </LayersControl.BaseLayer>

          {/* Overlays */}
          <LayersControl.Overlay checked name="Δεδομένα">
            <React.Fragment>
              {mode === 'points' && (
                <MarkerClusterGroup chunkedLoading>
                  {reports.map((report, idx) => {
                    const db = parseFloat(report.properties.noise_db_val);
                    return (
                      <Marker 
                        key={report.id || idx}
                        position={[report.geometry.coordinates[1], report.geometry.coordinates[0]]}
                        icon={getMarkerIcon(db)}
                      >
                        <Popup>
                          <div className="p-1 min-w-[150px]">
                            <h4 className="font-bold text-gray-800 border-b pb-1 mb-1">Στάθμη: {db} dB</h4>
                            <p className="text-sm text-gray-600">Πηγή: {getSourceLabel(report.properties.noise_source)}</p>
                            <p className="text-xs text-gray-500 mt-1 italic">
                              {new Date(report.properties.rec_time).toLocaleString('el-GR')}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MarkerClusterGroup>
              )}

              {mode === 'heatmap' && (
                <HeatmapLayer points={reports} />
              )}
            </React.Fragment>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}