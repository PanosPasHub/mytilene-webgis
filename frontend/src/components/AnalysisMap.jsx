import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// --- Διόρθωση εικονιδίων Leaflet για σωστή εμφάνιση στο React ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Εσωτερικό Component για τη διαχείριση του Heatmap Layer
function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // Προετοιμασία δεδομένων για το Heatmap [lat, lng, intensity]
    const heatData = points.map(p => [
      p.geometry.coordinates[1],
      p.geometry.coordinates[0],
      parseFloat(p.properties.noise_db_val) / 100 // Κανονικοποίηση έντασης
    ]);

    // Δημιουργία του Heatmap Layer
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red' }
    }).addTo(map);

    // Καθαρισμός κατά την αλλαγή mode ή unmount
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

// Helper για το χρώμα των Markers ανάλογα με τα dB
const getMarkerIcon = (db) => {
  let color = '#22c55e'; // Πράσινο < 50
  if (db >= 50 && db < 65) color = '#facc15'; // Κίτρινο
  if (db >= 65 && db < 80) color = '#f97316'; // Πορτοκαλί
  if (db >= 80) color = '#dc2626'; // Κόκκινο

  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.4);"></div>`,
    className: 'custom-noise-marker',
    iconSize: [14, 14]
  });
};

/**
 * AnalysisMap Component
 * Περιλαμβάνει Clustering και Heatmap. 
 * Το LayersControl έχει αφαιρεθεί για καθαρή διεπαφή.
 */
export function AnalysisMap({ reports, mode }) {
  const position = [39.1042, 26.5500]; // Κέντρο Μυτιλήνης

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={position} 
        zoom={14} 
        className="w-full h-full"
        zoomControl={true}
      >
        {/* Στατικό υπόβαθρο χάρτη - Χωρίς LayersControl */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Προβολή Σημείων με Ομαδοποίηση (Clustering) */}
        {mode === 'points' && (
          <MarkerClusterGroup chunkedLoading>
            {reports.map((report, idx) => {
              const db = parseFloat(report.properties.noise_db_val);
              const coords = [report.geometry.coordinates[1], report.geometry.coordinates[0]];
              
              return (
                <Marker 
                  key={report.id || `rep-${idx}`}
                  position={coords}
                  icon={getMarkerIcon(db)}
                >
                  <Popup>
                    <div className="p-1 min-w-[150px]">
                      <h4 className="font-bold text-gray-800 border-b pb-1 mb-1">Στάθμη: {db} dB</h4>
                      <p className="text-xs text-gray-600">Πηγή: {report.properties.noise_source}</p>
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

        {/* Προβολή Heatmap */}
        {mode === 'heatmap' && (
          <HeatmapLayer points={reports} />
        )}
      </MapContainer>
    </div>
  );
}