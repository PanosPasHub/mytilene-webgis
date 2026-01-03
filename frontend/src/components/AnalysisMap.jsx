import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat'; // Απαραίτητο: npm install leaflet.heat
import { setupIDW } from '../utils/leaflet-idw'; // Import τον αλγόριθμο Raster IDW

// Αρχικοποίηση του IDW plugin
setupIDW();

// Fix για τα εικονίδια του Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- COMPONENT: IDW LAYER (RASTER / INTENSITY) ---
const IDWLayer = ({ points }) => {
  const map = useMap(); 
  
  useEffect(() => {
    // Βεβαιωνόμαστε ότι το plugin έχει φορτωθεί
    setupIDW();

    if (!points || points.length === 0) return;

    // Έλεγχος αν το L.idwLayer υπάρχει
    if (!L.idwLayer) {
        console.warn("L.idwLayer not found. Ensure setupIDW ran correctly.");
        return;
    }

    // Μετατροπή δεδομένων: [lat, lon, value]
    const idwPoints = points.map(p => {
        const db = parseFloat(p.properties.noise_db_val);
        const lat = p.geometry.coordinates[1];
        const lon = p.geometry.coordinates[0];
        
        if (isNaN(db) || isNaN(lat) || isNaN(lon)) return null;
        
        // Clamping (30-100dB)
        const val = Math.max(30, Math.min(100, db)); 
        return [lat, lon, val];
    }).filter(Boolean);

    if (idwPoints.length === 0) return;

    // --- ΑΚΡΙΒΗΣ ΑΝΤΙΣΤΟΙΧΙΣΗ ΧΡΩΜΑΤΩΝ (GRADIENT) ---
    const exactGradient = {
        0.0:  '#047857', // 30dB
        0.14: '#047857', // 40dB
        0.21: '#10b981', // 45dB
        0.28: '#22c55e', // 50dB
        0.35: '#84cc16', // 55dB
        0.42: '#facc15', // 60dB
        0.50: '#fab115', // 65dB
        0.57: '#fb923c', // 70dB
        0.64: '#ea580c', // 75dB
        0.71: '#dc2626', // 80dB
        0.85: '#7f1d1d', // >80dB
        1.0:  '#7f1d1d'  // 100dB
    };

    // Δημιουργία Raster IDW Layer
    const idw = L.idwLayer(idwPoints, {
        opacity: 0.6, 
        cellSize: 7,        
        exp: 3,             
        max: 100,           
        maxDistance: 0.0015, // ~150 μέτρα (Maisonneuve et al. 2010)
        minValue: 30,       
        maxValue: 100,      
        gradient: exactGradient
    });
    
    idw.addTo(map);

    return () => { 
        if (map.hasLayer(idw)) map.removeLayer(idw); 
    };
  }, [points, map]);

  return null;
};

// --- COMPONENT: HEATMAP LAYER (DENSITY) ---
const HeatmapLayer = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (!points || points.length === 0 || !L.heatLayer) return;

        const heatPoints = points.map(p => {
            const lat = p.geometry.coordinates[1];
            const lon = p.geometry.coordinates[0];
            return [lat, lon, 0.8]; // Σταθερή ένταση
        });

        const heat = L.heatLayer(heatPoints, {
            radius: 30, blur: 20, maxZoom: 15, max: 1.0,
            gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
        });
        
        heat.addTo(map);

        return () => { 
            if (map.hasLayer(heat)) map.removeLayer(heat); 
        };
    }, [points, map]);
    return null;
};

// --- MAIN MAP COMPONENT ---
export function AnalysisMap({ reports = [], mode = 'points' }) {
  
  const getColor = (db) => {
    if (db > 80) return '#7f1d1d'; if (db > 75) return '#dc2626'; if (db > 70) return '#ea580c';
    if (db > 65) return '#fb923c'; if (db > 60) return '#fab115'; if (db > 55) return '#facc15';
    if (db > 50) return '#84cc16'; if (db > 45) return '#22c55e'; if (db > 40) return '#10b981';
    return '#047857';
  };

  const getSourceLabel = (source) => {
    const mapping = {
      'nature': 'Φυσικό Περιβάλλον', 'traffic': 'Οδική Κυκλοφορία',
      'construction': 'Εργοτάξιο', 'music': 'Μουσική',
      'human': 'Ανθρώπινη Ομιλία', 'industrial': 'Βιομηχανικός', 'other': 'Άλλο'
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
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* --- DATA LAYERS (Rendered Directly based on Mode) --- */}
        
        {/* 1. POINTS LAYER */}
        {mode === 'points' && (
            <>
               {reports.map((feature, index) => {
                  const coords = feature.geometry.coordinates;
                  const dbVal = parseFloat(feature.properties.noise_db_val); 
                  const color = getColor(dbVal);
                  return (
                    <CircleMarker
                      key={feature.properties.report_id || index}
                      center={[coords[1], coords[0]]}
                      pathOptions={{ color: 'white', weight: 1, fillColor: color, fillOpacity: 0.9 }}
                      radius={8} 
                    >
                      <Popup>
                        <div className="p-1 min-w-[200px]">
                          <div className="flex justify-between border-b pb-1 mb-1">
                            <span className="font-bold">{dbVal} dB</span>
                            <span className="text-xs px-2 rounded text-white" style={{ backgroundColor: color }}>
                              {dbVal > 65 ? 'Υψηλό' : 'Χαμηλό'}
                            </span>
                          </div>
                          <div className="text-sm">
                            <p>{new Date(feature.properties.rec_time).toLocaleDateString()}</p>
                            <p>{getSourceLabel(feature.properties.noise_source)}</p>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
            </>
        )}

        {/* 2. HEATMAP LAYER */}
        {mode === 'heatmap' && <HeatmapLayer points={reports} />}

        {/* 3. IDW LAYER */}
        {mode === 'idw' && <IDWLayer points={reports} />}
      </MapContainer>
      
      {/* Footer Info */}
      <div className="absolute bottom-6 left-6 z-[900] bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow border border-gray-200 text-sm">
        <span className="font-bold text-cyan-700">{reports.length}</span> μετρήσεις
      </div>
    </div>
  );
}