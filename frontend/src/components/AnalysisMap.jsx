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
// Αυτό το υπο-component αναλαμβάνει να ζωγραφίσει το Heatmap πάνω στον χάρτη
const HeatmapLayer = ({ points }) => {
  const map = useMap(); // Πρόσβαση στο αντικείμενο χάρτη του Leaflet

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Μετατροπή των GeoJSON δεδομένων στη μορφή που θέλει το leaflet.heat: [lat, lon, intensity]
    const heatPoints = points.map(p => {
        const db = parseFloat(p.properties.noise_db_val);
        const lat = p.geometry.coordinates[1];
        const lon = p.geometry.coordinates[0];
        
        // Υπολογισμός Έντασης (Intensity): 
        // Κανονικοποιούμε τα dB ώστε να είναι μεταξύ 0.0 και 1.0
        // Υποθέτουμε: <40dB = 0.1 (ελάχιστο), >100dB = 1.0 (μέγιστο)
        const intensity = Math.min(Math.max((db - 40) / 60, 0.1), 1.0);
        
        return [lat, lon, intensity];
    });

    // Δημιουργία του HeatLayer
    const heat = L.heatLayer(heatPoints, {
        radius: 35,      // Ακτίνα επιρροής κάθε σημείου (pixels)
        blur: 25,        // Πόσο "θολό" είναι το heatmap
        maxZoom: 15,     // Μέχρι ποιο zoom level υπολογίζεται η μέγιστη ένταση
        max: 1.0,        
        // Χρωματική διαβάθμιση (Gradient)
        gradient: {      
            0.2: 'blue',   // Χαμηλός θόρυβος
            0.4: 'cyan',
            0.6: 'lime',   // Μέτριος
            0.8: 'yellow', // Υψηλός
            1.0: 'red'     // Επικίνδυνος
        }
    }).addTo(map);

    // Cleanup: Καθαρισμός του layer όταν αλλάζουν τα δεδομένα ή κλείνει το component
    return () => {
      map.removeLayer(heat);
    };
  }, [points, map]);

  return null;
};

// --- MAIN MAP COMPONENT ---
export function AnalysisMap({ reports = [], mode = 'points' }) {
  
  // Χρωματισμός για τα Clusters (Points Mode)
  const getColor = (db) => {
    if (db > 80) return '#dc2626'; // Κόκκινο
    if (db > 65) return '#f97316'; // Πορτοκαλί
    if (db > 50) return '#facc15'; // Κίτρινο
    return '#22c55e';             // Πράσινο
  };

  // Μετάφραση πηγών θορύβου
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
        center={[39.106, 26.554]} // Κέντρο Μυτιλήνης
        zoom={14}
        className="w-full h-full rounded-lg z-0"
        style={{ minHeight: "100%" }}
      >
        <LayersControl position="topright">
          {/* Base Layers (Υπόβαθρα) */}
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Dark Matter">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
          </LayersControl.BaseLayer>

          {/* MODE 1: POINTS (Κουκκίδες) */}
          {mode === 'points' && (
            <LayersControl.Overlay checked name="Σημεία Μετρήσεων">
                <React.Fragment>
                  {reports.map((feature, index) => {
                    const coords = feature.geometry.coordinates;
                    const lat = coords[1];
                    const lon = coords[0];
                    const props = feature.properties;
                    const dbVal = parseFloat(props.noise_db_val); 

                    return (
                      <CircleMarker
                        key={props.report_id || index}
                        center={[lat, lon]}
                        pathOptions={{ 
                          color: 'white', 
                          weight: 1, 
                          fillColor: getColor(dbVal), 
                          fillOpacity: 0.8 
                        }}
                        radius={10} 
                      >
                        <Popup>
                          <div className="p-1 min-w-[200px]">
                            <div className="flex items-center justify-between border-b pb-2 mb-2 border-gray-200">
                              <span className="font-bold text-lg text-gray-800">{dbVal} dB</span>
                              <span className={`text-xs px-2 py-1 rounded text-white ${
                                   dbVal > 80 ? 'bg-red-500' : dbVal > 65 ? 'bg-orange-500' : 'bg-green-500'
                               }`}>
                                 {dbVal > 80 ? 'Επικίνδυνο' : dbVal > 65 ? 'Υψηλό' : 'Χαμηλό'}
                               </span>
                            </div>
                            <div className="text-sm space-y-2 text-gray-700">
                              <p>🕒 {new Date(props.rec_time).toLocaleString('el-GR')}</p>
                              <p>📢 {getSourceLabel(props.noise_source)}</p>
                              <p>😠 Ενόχληση: <strong>{props.annoyance_level || '-'}</strong>/10</p>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </React.Fragment>
            </LayersControl.Overlay>
          )}

          {/* MODE 2: HEATMAP (Θερμικός Χάρτης) */}
          {mode === 'heatmap' && (
              // Το Heatmap δεν χρειάζεται Overlay wrapper καθώς το χειρίζεται το useEffect
              <HeatmapLayer points={reports} />
          )}

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