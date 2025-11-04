import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function FlyToEvent({ selectedEvent }) {
  const map = useMap();

  useEffect(() => {
    if (selectedEvent) {
      map.flyTo(selectedEvent.position, 16, { duration: 1.5 });
    }
  }, [selectedEvent, map]);

  return null;
}

export function CityMap({ selectedEvent }) {
  // Function για άνοιγμα Google Maps
  const openInGoogleMaps = (lat, lng, title) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(title)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-[90%] h-[500px] rounded-xl shadow-md overflow-hidden">
      <MapContainer
        center={[39.108, 26.555]}
        zoom={14}
        className="h-full w-full"
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
                  onClick={() => openInGoogleMaps(
                    selectedEvent.position[0], 
                    selectedEvent.position[1], 
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