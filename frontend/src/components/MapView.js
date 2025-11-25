import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapView = () => {
  const mytileneCenter = [39.1071, 26.5553]; // Συντεταγμένες Μυτιλήνης

  return (
    <div className="w-full h-[600px]">
      <MapContainer center={mytileneCenter} zoom={13} className="h-full w-full rounded-2xl shadow-lg">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={mytileneCenter}>
          <Popup>Κέντρο Μυτιλήνης 📍</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;
