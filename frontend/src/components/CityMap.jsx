import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Component που ελέγχει το κλείδωμα/ξεκλείδωμα του χάρτη
const MapController = ({ isActive, selectedEvent }) => {
  const map = useMap();

  // 1. Διαχείριση Zoom/Drag ανάλογα με το isActive
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

  // 2. Πτήση στο επιλεγμένο event (αν υπάρχει)
  useEffect(() => {
    if (selectedEvent && selectedEvent.coordinates) {
      map.flyTo(selectedEvent.coordinates, 13, {
        duration: 1.5
      });
    }
  }, [selectedEvent, map]);

  return null;
};

export function CityMap({ selectedEvent, isActive, onActivate }) {
  // Κέντρο Μυτιλήνης (Default)
  const defaultPosition = [39.1042, 26.5500];

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
        zoom={12}
        className="w-full h-full"
        // Απενεργοποιούμε τα πάντα αρχικά (το MapController τα διαχειρίζεται μετά)
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        zoomControl={isActive} // Εμφάνιση zoom controls μόνο όταν είναι ενεργός
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Marker για το επιλεγμένο event */}
        {selectedEvent && (
          <Marker position={selectedEvent.coordinates}>
            <Popup>
              <div className="text-center p-2">
                <h3 className="font-bold text-base">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600">{selectedEvent.date}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Ο ελεγκτής του χάρτη */}
        <MapController isActive={isActive} selectedEvent={selectedEvent} />
        
      </MapContainer>
    </div>
  );
}