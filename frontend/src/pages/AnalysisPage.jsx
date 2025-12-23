import React, { useState, useEffect, useMemo } from 'react';
import { HeroSlider } from "../components/HeroSlider";
import { Footer } from "../components/Footer";
import { AnalysisMap } from "../components/AnalysisMap";

// Στόχευση του Backend API
const API_URL = 'https://mytilene-webgis.onrender.com/api/noise';

export default function AnalysisPage() {
  // Data State
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Visualization State (ΝΕΟ)
  const [visualizationMode, setVisualizationMode] = useState('points'); // 'points' ή 'heatmap'

  // Timeline States
  const [dateBounds, setDateBounds] = useState({ min: 0, max: 0 });
  const [selectedRange, setSelectedRange] = useState({ start: 0, end: 0 });

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        const features = data.features || [];
        
        // Ταξινόμηση
        features.sort((a, b) => new Date(a.properties.rec_time) - new Date(b.properties.rec_time));
        
        setAllData(features);

        if (features.length > 0) {
          const minTime = new Date(features[0].properties.rec_time).getTime();
          const maxTime = new Date(features[features.length - 1].properties.rec_time).getTime();
          
          setDateBounds({ min: minTime, max: maxTime });
          setSelectedRange({ start: minTime, end: maxTime }); 
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Filter Logic
  const filteredData = useMemo(() => {
    return allData.filter(feature => {
      const props = feature.properties;
      const recTime = new Date(props.rec_time).getTime();

      const passTime = recTime >= selectedRange.start && recTime <= selectedRange.end;

      let passCategory = true;
      if (categoryFilter !== 'all') {
        passCategory = props.noise_source === categoryFilter;
      }

      return passTime && passCategory;
    });
  }, [allData, selectedRange, categoryFilter]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('el-GR', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleStartChange = (e) => {
    const newVal = Number(e.target.value);
    if (newVal <= selectedRange.end) {
      setSelectedRange(prev => ({ ...prev, start: newVal }));
    }
  };

  const handleEndChange = (e) => {
    const newVal = Number(e.target.value);
    if (newVal >= selectedRange.start) {
      setSelectedRange(prev => ({ ...prev, end: newVal }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <HeroSlider />

      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Χωρική Ανάλυση Θορύβου</h2>
            <p className="text-gray-600">Επιλέξτε χρονικό εύρος και τρόπο απεικόνισης.</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
                  <span className="mr-2 text-xl">🔍</span> Φίλτρα & Προβολή
                </h3>

                {/* VISUALIZATION MODE TOGGLE (ΝΕΟ) */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    🗺️ Τρόπος Προβολής
                  </label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setVisualizationMode('points')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        visualizationMode === 'points' 
                          ? 'bg-white text-cyan-700 shadow-sm border border-gray-200' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      📍 Σημεία
                    </button>
                    <button
                      onClick={() => setVisualizationMode('heatmap')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        visualizationMode === 'heatmap' 
                          ? 'bg-white text-orange-600 shadow-sm border border-gray-200' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🔥 Heatmap
                    </button>
                  </div>
                </div>
                
                {/* RANGE SLIDERS */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    📅 Χρονικό Εύρος
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-cyan-700 uppercase">Απο</span>
                        <span className="text-xs font-medium text-gray-600">{formatDate(selectedRange.start)}</span>
                      </div>
                      <input 
                          type="range"
                          min={dateBounds.min}
                          max={dateBounds.max}
                          value={selectedRange.start}
                          onChange={handleStartChange}
                          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-cyan-700 uppercase">Εως</span>
                        <span className="text-xs font-medium text-gray-600">{formatDate(selectedRange.end)}</span>
                      </div>
                      <input 
                          type="range"
                          min={dateBounds.min}
                          max={dateBounds.max}
                          value={selectedRange.end}
                          onChange={handleEndChange}
                          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                      />
                    </div>
                  </div>
                </div>

                {/* CATEGORY FILTER */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📢 Πηγή Θορύβου
                  </label>
                  <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
                  >
                      <option value="all">Όλες οι πηγές</option>
                      <option value="nature">Φυσικό Περιβάλλον</option>
                      <option value="traffic">Οδική Κυκλοφορία</option>
                      <option value="construction">Εργοτάξιο / Κατασκευές</option>
                      <option value="music">Έντονη Μουσική</option>
                      <option value="human">Ανθρώπινη Ομιλία</option>
                      <option value="industrial">Βιομηχανικός Θόρυβος</option>
                      <option value="other">Άλλο</option>
                  </select>
                </div>

                {/* Legend (Δυναμικό ανάλογα το mode) */}
                {visualizationMode === 'points' ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Επίπεδα (dB)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span> &lt; 50 dB (Χαμηλός)</div>
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span> 50-65 dB (Μέτριος)</div>
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span> 65-80 dB (Υψηλός)</div>
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-600 mr-2"></span> &gt; 80 dB (Επικίνδυνος)</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Ένταση Heatmap</h4>
                    <div className="h-4 w-full rounded bg-gradient-to-r from-blue-500 via-green-400 to-red-600"></div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Χαμηλή</span>
                      <span>Υψηλή</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[650px] border border-gray-200 relative">
                {loading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                    </div>
                )}
                
                {/* Περνάμε το visualizationMode στον χάρτη */}
                <AnalysisMap 
                  reports={filteredData} 
                  mode={visualizationMode}
                />
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}