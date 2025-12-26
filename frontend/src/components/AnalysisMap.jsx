import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat'; // Απαιτεί npm install leaflet.heat

// Fix για τα εικονίδια του Leaflet που χάνονται στο React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- HEATMAP LAYER COMPONENT ---
const HeatmapLayer = ({ points }) => {
  const map = useMap(); 

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Μετατροπή δεδομένων: [lat, lon, intensity]
    const heatPoints = points.map(p => {
        const db = parseFloat(p.properties.noise_db_val);
        const lat = p.geometry.coordinates[1];
        const lon = p.geometry.coordinates[0];
        
        // Κανονικοποίηση Έντασης για το Heatmap (0.0 - 1.0)
        // Υποθέτουμε ότι το εύρος ενδιαφέροντος είναι 30dB έως 90dB
        // Τιμές < 30 γίνονται 0, τιμές > 90 γίνονται 1
        const intensity = Math.min(Math.max((db - 30) / 60, 0.0), 1.0);
        
        return [lat, lon, intensity];
    });

    // Δημιουργία του HeatLayer με τις 10 αποχρώσεις
    const heat = L.heatLayer(heatPoints, {
        radius: 30,      
        blur: 20,        
        maxZoom: 16,     
        max: 1.0,        
        // Gradient που αντιστοιχεί στα χρώματα του AnalysisPage
        gradient: {      
            0.0: '#047857', // < 40 dB (Emerald 700)
            0.15: '#10b981', // 41-45 dB (Emerald 500)
            0.25: '#22c55e', // 46-50 dB (Green 500)
            0.35: '#84cc16', // 51-55 dB (Lime 500)
            0.45: '#facc15', // 56-60 dB (Yellow 400)
            0.55: '#ca8a04', // 61-65 dB (Yellow 600)
            0.65: '#fb923c', // 66-70 dB (Orange 400)
            0.75: '#ea580c', // 71-75 dB (Orange 600)
            0.85: '#dc2626', // 76-80 dB (Red 600)
            0.95: '#7f1d1d'  // > 80 dB (Red 900)
        }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [points, map]);

  return null;
};

// --- MAIN MAP COMPONENT ---
export function AnalysisMap({ reports = [], mode = 'points' }) {
  
  // Χρωματισμός για τα Clusters (Points Mode) - Ακριβής αντιστοίχιση με Legend
  const getColor = (db) => {
    if (db > 80) return '#7f1d1d'; // > 80 dB (Red 900)
    if (db > 75) return '#dc2626'; // 76-80 dB (Red 600)
    if (db > 70) return '#ea580c'; // 71-75 dB (Orange 600)
    if (db > 65) return '#fb923c'; // 66-70 dB (Orange 400)
    if (db > 60) return '#ca8a04'; // 61-65 dB (Yellow 600)
    if (db > 55) return '#facc15'; // 56-60 dB (Yellow 400)
    if (db > 50) return '#84cc16'; // 51-55 dB (Lime 500)
    if (db > 45) return '#22c55e'; // 46-50 dB (Green 500)
    if (db > 40) return '#10b981'; // 41-45 dB (Emerald 500)
    return '#047857';              // < 40 dB (Emerald 700)
  };

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

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <MapContainer
        center={[39.106, 26.554]} 
        zoom={14}
        className="w-full h-full rounded-lg z-0"
        style={{ minHeight: "100%" }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Dark Matter">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap & CartoDB' />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Δεδομένα Θορύβου">
            <React.Fragment>
                {/* MODE 1: POINTS */}
                {mode === 'points' && (
                    <React.Fragment>
                      {reports.map((feature, index) => {
                        const coords = feature.geometry.coordinates;
                        const lat = coords[1];
                        const lon = coords[0];
                        const props = feature.properties;
                        const dbVal = parseFloat(props.noise_db_val); 
                        const color = getColor(dbVal);

                        return (
                          <CircleMarker
                            key={props.report_id || index}
                            center={[lat, lon]}
                            pathOptions={{ 
                              color: 'white', 
                              weight: 1, 
                              fillColor: color, 
                              fillOpacity: 0.9 
                            }}
                            radius={8} 
                          >
                            <Popup>
                              <div className="p-1 min-w-[200px]">
                                <div className="flex items-center justify-between border-b pb-2 mb-2 border-gray-200">
                                  <span className="font-bold text-lg text-gray-800">{dbVal} dB</span>
                                  <span className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: color }}>
                                    {dbVal > 80 ? 'Επικίνδυνο' : dbVal > 65 ? 'Υψηλό' : dbVal > 50 ? 'Μέτριο' : 'Χαμηλό'}
                                  </span>
                                </div>
                                <div className="text-sm space-y-2 text-gray-700">
                                  <p>🕒 {new Date(props.rec_time).toLocaleString('el-GR')}</p>
                                  <p>📢 {getSourceLabel(props.noise_source)}</p>
                                  <p>🔉 Υπ. Ενόχληση: <strong>{props.annoyance_level || '-'}</strong>/5</p>
                                </div>
                              </div>
                            </Popup>
                          </CircleMarker>
                        );
                      })}
                    </React.Fragment>
                )}

                {/* MODE 2: HEATMAP */}
                {mode === 'heatmap' && (
                    <HeatmapLayer points={reports} />
                )}
            </React.Fragment>
          </LayersControl.Overlay>

        </LayersControl>
      </MapContainer>
      
      {/* Στατιστικό στο κάτω μέρος */}
      <div className="absolute bottom-6 left-6 z-[900] bg-white bg-opacity-90 backdrop-blur px-4 py-3 rounded-lg shadow-xl border border-gray-200 text-sm flex items-center gap-3">
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Εμφανιζονται</span>
            <span className="font-bold text-2xl text-cyan-700">{reports.length}</span>
        </div>
        <div className="h-8 w-px bg-gray-300 mx-1"></div>
        <div className="text-xs text-gray-600">
            μετρήσεις<br/>στο χάρτη
        </div>
      </div>
    </div>
  );
}