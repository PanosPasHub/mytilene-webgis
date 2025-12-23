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

    // Προετοιμασία δεδομένων [lat, lng, intensity]
    const heatData = points.map(p => [
      p.geometry.coordinates[1],
      p.geometry.coordinates[0],
      parseFloat(p.properties.noise_db_val) / 100 // Κανονικοποίηση για το heatmap
    ]);

    // Δημιουργία και προσθήκη του heatLayer στον χάρτη
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red' }
    }).addTo(map);

    // Καθαρισμός κατά το unmount ή την αλλαγή δεδομένων
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

// Helper για δυναμικό ορισμό χρώματος εικονιδίου ανάλογα με τα dB
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
 * Δέχεται τις αναφορές (reports) και τον τρόπο προβολής (mode: 'points' ή 'heatmap')
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
        {/* Στατικό υπόβαθρο χάρτη - Δεν υπάρχει πλέον LayersControl για αλλαγή */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Προβολή Σημείων με ομαδοποίηση (Clustering) */}
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
                    <div className="text-sm p-1">
                      <div className="font-bold border-b mb-1 pb-1 text-gray-800">
                        Επίπεδο Θορύβου: {db} dB
                      </div>
                      <div className="text-gray-600">
                        <span className="font-semibold">Πηγή:</span> {report.properties.noise_source}
                      </div>
                      <div className="text-gray-500 text-xs mt-1 italic">
                        {new Date(report.properties.rec_time).toLocaleString('el-GR')}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        )}

        {/* Προβολή Χάρτη Θερμότητας (Heatmap) */}
        {mode === 'heatmap' && (
          <HeatmapLayer points={reports} />
        )}
      </MapContainer>
    </div>
  );
}