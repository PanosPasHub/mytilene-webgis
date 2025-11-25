import React, { useState, useEffect } from 'react';
import { HeroSlider } from "../components/HeroSlider";
import { Footer } from "../components/Footer";
import { AnalysisMap } from "../components/AnalysisMap";
import { environmentalAPI } from '../services/api';

export default function AnalysisPage() {
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState({ 
    heat: [], 
    noise: [] 
  });
  const [analysisData, setAnalysisData] = useState(null);
  
  // 🆕 ΔΙΟΡΘΩΜΕΝΟ: Προσθήκη GeoServer layers
  const [activeLayers, setActiveLayers] = useState({
    reports: true,
    heatHotspots: false,
    noiseHotspots: false,
    heatmap: false,
    clusters: true,
    // 🆕 GeoServer Layers
    geoserverReports: true,
    geoserverHeat: true, 
    geoserverNoise: true
  });
  
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Φόρτωση δεδομένων
  useEffect(() => {
    loadData();
  }, [timeFilter, categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Φόρτωση αναφορών
      const reportsResponse = await environmentalAPI.getReportsGeoJSON();
      console.log('📊 Loaded reports:', reportsResponse.features?.length || 0);
      setReports(reportsResponse.features || []);

      // Φόρτωση hotspots με error handling
      try {
        const heatHotspots = await environmentalAPI.getHotspots('heat');
        const noiseHotspots = await environmentalAPI.getHotspots('noise');
        setHotspots({
          heat: heatHotspots.data || [],
          noise: noiseHotspots.data || []
        });
      } catch (hotspotError) {
        console.warn('Hotspots API not available:', hotspotError);
        setHotspots({ heat: [], noise: [] });
      }

    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLayerToggle = (layer) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
    console.log('🔘 Layer toggled:', layer, '→', !activeLayers[layer]);
  };

  const getFilteredReports = () => {
    let filtered = reports;
    
    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case 'today':
          filterDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(report => 
        new Date(report.properties.createdDate) >= filterDate
      );
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => {
        const props = report.properties;
        switch (categoryFilter) {
          case 'heat':
            return props.temperatureFeeling && ['hot', 'unbearable'].includes(props.temperatureFeeling);
          case 'noise':
            return props.noiseLevel && ['high', 'very_high'].includes(props.noiseLevel);
          case 'pollution':
            return props.pollutionType && props.pollutionType !== null;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  };

  // 🆕 Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSlider />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Φόρτωση δεδομένων...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredReports = getFilteredReports();

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSlider />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Debug Info */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🔍 Debug Info</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="font-medium">Reports:</span> {reports.length}</div>
              <div><span className="font-medium">Filtered:</span> {filteredReports.length}</div>
              <div><span className="font-medium">Active Layers:</span> {Object.keys(activeLayers).filter(k => activeLayers[k]).length}</div>
              <div><span className="font-medium">GeoServer Layers:</span> {activeLayers.geoserverReports ? 'On' : 'Off'}</div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/images/logo.png" 
                alt="Mytilene Logo" 
                className="h-16 w-16"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Ανάλυση Περιβαλλοντικών Δεδομένων
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Διαδραστική οπτικοποίηση και ανάλυση των περιβαλλοντικών αναφορών της Μυτιλήνης.
              Χαρτογραφήστε hotspots, τάσεις και μοτίβα.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Controls & Statistics */}
            <div className="lg:col-span-1 space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  🔧 Φίλτρα & Ελέγχοι
                </h3>
                
                {/* Time Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Χρονική Περίοδος
                  </label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">Όλο το ιστορικό</option>
                    <option value="today">Τελευταία 24 ώρες</option>
                    <option value="week">Τελευταία εβδομάδα</option>
                    <option value="month">Τελευταίος μήνας</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Κατηγορία
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">Όλες οι κατηγορίες</option>
                    <option value="heat">Θερμική δυσφορία</option>
                    <option value="noise">Θόρυβος</option>
                    <option value="pollution">Ρύπανση</option>
                  </select>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={loadData}
                  className="w-full bg-cyan-500 text-white py-2 rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  🔄 Ανανέωση Δεδομένων
                </button>
              </div>

              {/* 🆕 ΔΙΟΡΘΩΜΕΝΟ Layers Control */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  🗂️ Επιλογή Layers
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'reports', label: '📊 React Reports', color: 'blue' },
                    { key: 'geoserverReports', label: '🗺️ GeoServer Reports', color: 'green' },
                    { key: 'geoserverHeat', label: '🔥 GeoServer Heat', color: 'red' },
                    { key: 'geoserverNoise', label: '🔊 GeoServer Noise', color: 'orange' },
                    { key: 'heatHotspots', label: '🔥 Heat Hotspots', color: 'purple' },
                    { key: 'noiseHotspots', label: '🔊 Noise Hotspots', color: 'pink' }
                  ].map(layer => (
                    <label key={layer.key} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeLayers[layer.key]}
                        onChange={() => handleLayerToggle(layer.key)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {layer.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📈 Στατιστικά
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Συνολικές Αναφορές:</span>
                    <span className="font-semibold">{reports.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Φιλτραρισμένες:</span>
                    <span className="font-semibold">{filteredReports.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hotspots Ζέστης:</span>
                    <span className="font-semibold">{hotspots.heat.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hotspots Θορύβου:</span>
                    <span className="font-semibold">{hotspots.noise.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Map Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <AnalysisMap
                  reports={filteredReports}
                  hotspots={hotspots}
                  activeLayers={activeLayers}
                  filters={{ time: timeFilter, category: categoryFilter }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-2">{reports.length}</div>
              <div className="text-sm opacity-90">Συνολικές Αναφορές</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-2">
                {reports.filter(r => r.properties.temperatureFeeling === 'unbearable').length}
              </div>
              <div className="text-sm opacity-90">Αφόρητη Ζέστη</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-2">
                {reports.filter(r => r.properties.noiseLevel === 'very_high').length}
              </div>
              <div className="text-sm opacity-90">Βλαβερός Θόρυβος</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-2">
                {hotspots.heat.length + hotspots.noise.length}
              </div>
              <div className="text-sm opacity-90">Συνολικά Hotspots</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}