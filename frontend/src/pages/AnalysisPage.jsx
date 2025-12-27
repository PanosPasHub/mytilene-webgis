import React, { useState, useEffect, useMemo } from 'react';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AnalysisMap } from "../components/AnalysisMap";

// Στόχευση του Backend API (Local ή Cloud)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/noise';

export default function AnalysisPage() {
  // Data State
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Filters States ---
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeOfDayFilter, setTimeOfDayFilter] = useState('all'); // Φίλτρο ώρας ημέρας
  
  // Visualization State
  const [visualizationMode, setVisualizationMode] = useState('points');

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

  // 2. Filter Logic (Ενημερωμένη με ξεχωριστές ώρες)
  const filteredData = useMemo(() => {
    return allData.filter(feature => {
      const props = feature.properties;
      const dateObj = new Date(props.rec_time);
      const recTime = dateObj.getTime();
      const hour = dateObj.getHours(); // 0-23

      // Α. Φίλτρο Timeline
      const passDate = recTime >= selectedRange.start && recTime <= selectedRange.end;

      // Β. Φίλτρο Κατηγορίας
      let passCategory = true;
      if (categoryFilter !== 'all') {
        passCategory = props.noise_source === categoryFilter;
      }

      // Γ. Φίλτρο Ώρας Ημέρας (Νέα Λογική: Ξεχωριστές Ζώνες)
      let passTimeOfDay = true;
      if (timeOfDayFilter !== 'all') {
        switch (timeOfDayFilter) {
            // --- Ώρες Αιχμής ---
            case 'peak_morning': // 08:00 - 10:00
                passTimeOfDay = hour >= 8 && hour < 10;
                break;
            case 'peak_noon':    // 13:00 - 15:00
                passTimeOfDay = hour >= 13 && hour < 15;
                break;
            case 'peak_evening': // 19:00 - 22:00
                passTimeOfDay = hour >= 19 && hour < 22;
                break;
            
            // --- Ενδιάμεσες Ώρες ---
            case 'inter_morning':   // 10:00 - 13:00
                passTimeOfDay = hour >= 10 && hour < 13;
                break;
            case 'inter_afternoon': // 15:00 - 19:00
                passTimeOfDay = hour >= 15 && hour < 19;
                break;
            
            // --- Νύχτα / Υπόλοιπο ---
            case 'night': // 22:00 - 08:00
                passTimeOfDay = hour >= 22 || hour < 8;
                break;
                
            default:
                passTimeOfDay = true;
        }
      }

      return passDate && passCategory && passTimeOfDay;
    });
  }, [allData, selectedRange, categoryFilter, timeOfDayFilter]);

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
      <Header />

      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Χωρική Ανάλυση Θορύβου</h2>
            <p className="text-gray-600">Επιλέξτε φίλτρα για να αναλύσετε τα δεδομένα της Μυτιλήνης.</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
                  <span className="mr-2 text-xl">🔍</span> Φίλτρα & Προβολή
                </h3>

                {/* 1. VISUALIZATION MODE */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
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
                
                {/* 2. TIME OF DAY FILTER (Detailed) */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ☀️ Ώρα της Ημέρας
                  </label>
                  <select
                      value={timeOfDayFilter}
                      onChange={(e) => setTimeOfDayFilter(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
                  >
                      <option value="all">🕒 Όλη την ημέρα</option>
                      
                      <option disabled className="bg-gray-100 font-bold text-gray-500">--- Ώρες Αιχμής ---</option>
                      <option value="peak_morning">🚨 Αιχμή Πρωί (08:00 - 10:00)</option>
                      <option value="peak_noon">🚨 Αιχμή Μεσημέρι (13:00 - 15:00)</option>
                      <option value="peak_evening">🚨 Αιχμή Βράδυ (19:00 - 22:00)</option>
                      
                      <option disabled className="bg-gray-100 font-bold text-gray-500">--- Ενδιάμεσες Ώρες ---</option>
                      <option value="inter_morning">⏳ Ενδιάμεσο Πρωί (10:00 - 13:00)</option>
                      <option value="inter_afternoon">⏳ Ενδιάμεσο Απόγευμα (15:00 - 19:00)</option>
                      
                      <option disabled className="bg-gray-100 font-bold text-gray-500">--- Υπόλοιπο ---</option>
                      <option value="night">🌙 Νύχτα / Νωρίς (22:00 - 08:00)</option>
                  </select>
                </div>

                {/* 3. RANGE SLIDERS */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📅 Ημερομηνία (Από - Έως)
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
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
                      <div className="flex justify-between items-center mb-1">
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

                {/* 4. CATEGORY FILTER */}
                <div className="mb-6">
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

                {/* Legend (ΕΝΗΜΕΡΩΜΕΝΟ ΜΕ ΣΩΣΤΑ ΧΡΩΜΑΤΑ) */}
                {visualizationMode === 'points' ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Επίπεδα (dB)</h4>
                    <div className="space-y-1.5 text-xs font-medium text-gray-600">
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-700 mr-2"></span> &lt; 40 dB</div>
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> 41-45 dB</div>
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span> 46-50 dB</div>
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-lime-500 mr-2"></span> 51-55 dB</div>
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span> 56-60 dB</div>
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-600 mr-2"></span> 61-65 dB</div>
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-400 mr-2"></span> 66-70 dB</div>
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-600 mr-2"></span> 71-75 dB</div>
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-600 mr-2"></span> 76-80 dB</div>
                      <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-900 mr-2"></span> &gt; 80 dB</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Ένταση Heatmap</h4>
                    {/* Linear Gradient με τα ίδια χρώματα: Emerald -> Green -> Lime -> Yellow -> Orange -> Red */}
                    <div 
                      className="h-4 w-full rounded"
                      style={{
                        background: 'linear-gradient(to right, #047857, #10b981, #22c55e, #84cc16, #facc15, #ca8a04, #fb923c, #ea580c, #dc2626, #7f1d1d)'
                      }}
                    ></div>
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