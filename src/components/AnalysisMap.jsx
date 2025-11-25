import React from 'react';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix για τα marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 🆕 Custom icons για διαφορετικές κατηγορίες
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const customIcons = {
  unbearable: createCustomIcon('red'),     // 🔴 Αφόρητη ζέστη
  hot: createCustomIcon('orange'),         // 🟠 Ζεστό
  very_high: createCustomIcon('violet'),   // 🟣 Πολύ υψηλός θόρυβος
  high: createCustomIcon('purple'),        // 🟣 Υψηλός θόρυβος
  pollution: createCustomIcon('grey'),     // ⚫ Ρύπανση
  default: createCustomIcon('blue')        // 🔵 Default
};

export function AnalysisMap({ reports = [], hotspots = { heat: [], noise: [] }, activeLayers, filters }) {
  
  // GeoServer WMS Configuration - ΔΙΟΡΘΩΜΕΝΟ
  const geoserverConfig = {
    baseUrl: 'http://localhost:8080/geoserver',
    workspace: 'mytilenegis', // Χρησιμοποιείς mytilenegis workspace
    layers: {
      reports: 'mytilenegis:environmental_reports',    // Διορθωμένο layer name
      heat: 'mytilenegis:heat_analysis',               // Θα το δημιουργήσουμε
      noise: 'mytilenegis:noise_hotspots'              // Θα το δημιουργήσουμε
    }
  };
  
  // Function για να βρίσκει το σωστό icon βάσει των properties
  const getIconForReport = (properties) => {
    if (properties.temperatureFeeling === 'unbearable') return customIcons.unbearable;
    if (properties.temperatureFeeling === 'hot') return customIcons.hot;
    if (properties.noiseLevel === 'very_high') return customIcons.very_high;
    if (properties.noiseLevel === 'high') return customIcons.high;
    if (properties.pollutionType) return customIcons.pollution;
    return customIcons.default;
  };

  // Function για να δημιουργεί markers από τα reports
  const renderReportMarkers = () => {
    if (!activeLayers.reports || !reports.length) return null;

    return reports.map((report, index) => {
      const { geometry, properties } = report;
      
      // Skip αν δεν υπάρχουν coordinates
      if (!geometry || !geometry.coordinates || geometry.coordinates.length !== 2) {
        console.warn('Invalid report coordinates:', report);
        return null;
      }

      const [lng, lat] = geometry.coordinates;
      const icon = getIconForReport(properties);

      return (
        <Marker
          key={properties.id || `report-${index}`}
          position={[lat, lng]}
          icon={icon}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-lg mb-2">{properties.title}</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Θερμική Δυσφορία:</strong> {properties.temperatureFeeling || 'N/A'}</p>
                <p><strong>Θόρυβος:</strong> {properties.noiseLevel || 'N/A'}</p>
                <p><strong>Ρύπανση:</strong> {properties.pollutionType || 'Καμία'}</p>
                <p><strong>Επείγον:</strong> {properties.urgency || 'Μέτριο'}</p>
                <p className="text-xs text-gray-500">
                  {new Date(properties.createdDate).toLocaleString('el-GR')}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  };

  // Styling για hotspots (για τα GeoJSON polygons)
  const getHotspotStyle = (type) => {
    const colors = {
      heat: { color: '#ff4444', weight: 4, fillOpacity: 0.2 },
      noise: { color: '#ff00ff', weight: 4, fillOpacity: 0.2 }
    };
    return colors[type] || { color: '#3388ff', weight: 3, fillOpacity: 0.1 };
  };

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <MapContainer
        center={[39.108, 26.555]}
        zoom={14}
        className="h-full w-full"
      >
        {/* Base OSM TileLayer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <LayersControl position="topright">
          
          {/* 🆕 GeoServer WMS Layers */}
          {activeLayers.geoserverReports && (
            <LayersControl.Overlay name="🗺️ GeoServer Reports">
              <WMSTileLayer
                url={`${geoserverConfig.baseUrl}/wms`}
                layers={geoserverConfig.layers.reports}
                format="image/png"
                transparent={true}
                opacity={0.8}
                version="1.1.0"
                styles=""  // Θα προσθέσουμε styles αργότερα
              />
            </LayersControl.Overlay>
          )}

          {activeLayers.geoserverHeat && (
            <LayersControl.Overlay name="🔥 GeoServer Heat Analysis">
              <WMSTileLayer
                url={`${geoserverConfig.baseUrl}/wms`}
                layers={geoserverConfig.layers.heat}
                format="image/png"
                transparent={true}
                opacity={0.7}
                version="1.1.0"
              />
            </LayersControl.Overlay>
          )}

          {activeLayers.geoserverNoise && (
            <LayersControl.Overlay name="🔊 GeoServer Noise Hotspots">
              <WMSTileLayer
                url={`${geoserverConfig.baseUrl}/wms`}
                layers={geoserverConfig.layers.noise}
                format="image/png"
                transparent={true}
                opacity={0.7}
                version="1.1.0"
              />
            </LayersControl.Overlay>
          )}

          {/* React-based Layers */}
          {activeLayers.reports && (
            <LayersControl.Overlay name="📊 React Reports" checked>
              {renderReportMarkers()}
            </LayersControl.Overlay>
          )}

          {/* Hotspots Layers */}
          {activeLayers.heatHotspots && hotspots.heat && hotspots.heat.length > 0 && (
            <LayersControl.Overlay name="🔥 Heat Hotspots (React)">
              <GeoJSON
                data={{
                  type: "FeatureCollection",
                  features: hotspots.heat.map(hotspot => ({
                    type: "Feature",
                    geometry: hotspot.geometry ? JSON.parse(hotspot.geometry) : null,
                    properties: {
                      report_count: hotspot.report_count,
                      heat_ratio: hotspot.heat_ratio
                    }
                  })).filter(feature => feature.geometry !== null)
                }}
                style={() => getHotspotStyle('heat')}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(`
                    <div class="p-2">
                      <h4 class="font-bold">🔥 Hotspot Ζέστης</h4>
                      <p>Αναφορές: ${feature.properties.report_count}</p>
                      <p>Ποσοστό Ζέστης: ${(feature.properties.heat_ratio * 100).toFixed(1)}%</p>
                    </div>
                  `);
                }}
              />
            </LayersControl.Overlay>
          )}

          {activeLayers.noiseHotspots && hotspots.noise && hotspots.noise.length > 0 && (
            <LayersControl.Overlay name="🔊 Noise Hotspots (React)">
              <GeoJSON
                data={{
                  type: "FeatureCollection",
                  features: hotspots.noise.map(hotspot => ({
                    type: "Feature",
                    geometry: hotspot.geometry ? JSON.parse(hotspot.geometry) : null,
                    properties: {
                      report_count: hotspot.report_count,
                      noise_ratio: hotspot.noise_ratio
                    }
                  })).filter(feature => feature.geometry !== null)
                }}
                style={() => getHotspotStyle('noise')}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(`
                    <div class="p-2">
                      <h4 class="font-bold">🔊 Hotspot Θορύβου</h4>
                      <p>Αναφορές: ${feature.properties.report_count}</p>
                      <p>Ποσοστό Θορύβου: ${(feature.properties.noise_ratio * 100).toFixed(1)}%</p>
                    </div>
                  `);
                }}
              />
            </LayersControl.Overlay>
          )}

        </LayersControl>
      </MapContainer>
    </div>
  );
}