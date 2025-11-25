import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* Fix για τα marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});*/

// Custom icon για το selected point
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

export function MapWebgis({
  selectedLocation,
  onLocationSelect,
  currentStep,
  reports = [],
  onNextStep,
  height = "400px"
}) {
  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return 'Βήμα 1: Επιλογή Τοποθεσίας';
      case 2: return 'Βήμα 2: Περιβαλλοντικές Μετρήσεις';
      default: return 'Βήμα 3: Ολοκλήρωση';
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {getStepTitle()}
      </h2>
      
      {currentStep === 1 && (
        <>
          <p className="text-gray-600 mb-4">
            Κάντε κλικ στον χάρτη για να επιλέξετε την ακριβή τοποθεσία όπου παρατηρήσατε το φαινόμενο.
          </p>
          
          <div className="w-full rounded-lg overflow-hidden" style={{ height }}>
            <MapContainer
              center={[39.108, 26.555]}
              zoom={14}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              
              {currentStep === 1 && (
                <MapClickHandler onLocationSelect={onLocationSelect} />
              )}
              
              {selectedLocation && (
                <Marker position={selectedLocation} icon={customIcon}>
                  <Popup>
                    Επιλεγμένη τοποθεσία<br />
                    Lat: {selectedLocation.lat.toFixed(4)}<br />
                    Lng: {selectedLocation.lng.toFixed(4)}
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
          
          {selectedLocation && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Τοποθεσία επιλεγμένη:
                <span className="font-normal ml-2">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </span>
              </p>
            </div>
          )}
        </>
      )}
      
      {currentStep > 1 && (
        <div className="h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
          <div className="w-full rounded-lg overflow-hidden" style={{ height }}>
            <MapContainer
              center={[39.108, 26.555]}
              zoom={14}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              
              {selectedLocation && (
                <Marker position={selectedLocation} icon={customIcon}>
                  <Popup>Επιλεγμένη τοποθεσία</Popup>
                </Marker>
              )}
      
            </MapContainer>
          </div>
          <div className="absolute bg-black/50 text-white p-2 rounded">
            🗺️ Τοποθεσία επιλεγμένη
          </div>
        </div>
      )}
    </div>
  );
}