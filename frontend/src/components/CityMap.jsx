import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Component για να πετάει η κάμερα στο επιλεγμένο event
function FlyToEvent({ selectedEvent }) {
  const map = useMap(); // Λαμβάνει το map instance από το context

  useEffect(() => { // Όταν αλλάζει το selectedEvent, πετάει η κάμερα σε αυτό
    if (selectedEvent) {
      map.flyTo(selectedEvent.position, 16, { duration: 1.5 }); // Πετάει στην τοποθεσία με zoom 16 και διάρκεια 1.5 δευτερόλεπτα
    }
  }, [selectedEvent, map]);

  return null; // Δεν αποδίδει τίποτα στο DOM
}

export function CityMap({ selectedEvent }) {
  // Function για άνοιγμα Google Maps
  const openInGoogleMaps = (lat, lng, title) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(title)}`;
    window.open(url, '_blank');// Άνοιγμα σε νέα καρτέλα
  };

  return (
    <div className="w-[90%] h-[500px] rounded-xl shadow-md overflow-hidden">{/* Κοντέινερ για τον χάρτη με στυλ */}
      <MapContainer
        center={[39.108, 26.555]}
        zoom={14}
        className="h-full w-full" // Ο χάρτης καταλαμβάνει όλο το κοντέινερ
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {selectedEvent && (
          <Marker 
            position={selectedEvent.position} 
            icon={L.icon({ 
              iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" 
            })}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedEvent.description}</p>
                <button 
                  onClick={() => openInGoogleMaps(// επικλήση της function για άνοιγμα Google Maps στο κλικ listener
                    selectedEvent.position[0], // latitude
                    selectedEvent.position[1], // longitude
                    selectedEvent.title
                  )}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                >
                  📍 Άνοιγμα στο Google Maps
                </button>
              </div>
            </Popup>
          </Marker>
        )}
        <FlyToEvent selectedEvent={selectedEvent} />
      </MapContainer>
    </div>
  );
}