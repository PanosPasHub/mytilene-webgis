import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- FIX ΓΙΑ ΤΑ ΕΙΚΟΝΙΔΙΑ LEAFLET ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component που ελέγχει το κλείδωμα/ξεκλείδωμα του χάρτη και την κίνηση (FlyTo)
const MapController = ({ isActive, selectedEvent }) => {
  const map = useMap();

  // 1. Διαχείριση Zoom/Drag
  useEffect(() => {
    if (isActive) {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.keyboard.enable();
      if (map.tap) map.tap.enable();
    } else {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.keyboard.disable();
      if (map.tap) map.tap.disable();
    }
  }, [isActive, map]);

  // 2. Πτήση στο επιλεγμένο event
  useEffect(() => {
    // Ελέγχουμε είτε για 'coordinates' είτε για 'position' για να βρούμε τις συντεταγμένες
    const coords = selectedEvent?.coordinates || selectedEvent?.position;

    if (coords && Array.isArray(coords) && coords.length === 2) {
      map.flyTo(coords, 16, { duration: 1.5 });
    }
  }, [selectedEvent, map]);

  return null;
};

export function CityMap({ selectedEvent, isActive, onActivate }) {
  const defaultPosition = [39.1042, 26.5500];

  // Helper: Εύρεση σωστών συντεταγμένων
  // Αυτή η συνάρτηση διασφαλίζει ότι θα βρούμε τις συντεταγμένες ανεξάρτητα από το όνομα του πεδίου (coordinates ή position)
  const getCoords = (event) => {
    if (!event) return null;
    const coords = event.coordinates || event.position; // Υποστήριξη και των δύο
    if (Array.isArray(coords) && coords.length === 2 && !isNaN(coords[0])) {
      return coords;
    }
    return null;
  };

  const activeCoords = getCoords(selectedEvent);

  return (
    <div className="relative w-full max-w-6xl h-[500px] rounded-xl overflow-hidden shadow-xl border-4 border-white mx-auto">
      
      {/* Overlay: Καλύπτει τον χάρτη όταν είναι ανενεργός */}
      {!isActive && (
        <div 
          onClick={onActivate}
          className="absolute inset-0 z-[1000] bg-black bg-opacity-10 flex items-center justify-center cursor-pointer hover:bg-opacity-20 transition-all group"
        >
          <div className="bg-white px-6 py-3 rounded-full shadow-lg transform group-hover:scale-105 transition-transform flex items-center gap-2">
            <span className="text-2xl">👆</span>
            <span className="font-bold text-gray-700">Κάντε κλικ για εξερεύνηση</span>
          </div>
        </div>
      )}

      <MapContainer
        center={defaultPosition}
        zoom={13}
        className="w-full h-full"
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        zoomControl={isActive} 
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Marker: Εμφανίζεται ΜΟΝΟ αν υπάρχουν έγκυρες συντεταγμένες */}
        {activeCoords && (
          <Marker 
            key={selectedEvent.id} // Force re-render όταν αλλάζει το event
            position={activeCoords}
          >
            <Popup>
              <div className="text-center p-2 min-w-[150px]">
                <h3 className="font-bold text-base mb-1">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedEvent.description}</p>
                {selectedEvent.image && (
                  <img src={selectedEvent.image} alt="" className="rounded w-full h-24 object-cover"/>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        <MapController isActive={isActive} selectedEvent={selectedEvent} />
        
      </MapContainer>
    </div>
  );
}