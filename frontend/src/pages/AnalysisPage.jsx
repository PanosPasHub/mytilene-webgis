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
  const [timeOfDayFilter, setTimeOfDayFilter] = useState('all');
  
  // Visualization State: 'points', 'heatmap' (density), 'idw' (interpolation)
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

  // 2. Filter Logic
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

      // Γ. Φίλτρο Ώρας Ημέρας
      let passTimeOfDay = true;
      if (timeOfDayFilter !== 'all') {
        switch (timeOfDayFilter) {
            case 'peak_morning': passTimeOfDay = hour >= 8 && hour < 10; break;
            case 'peak_noon':    passTimeOfDay = hour >= 13 && hour < 15; break;
            case 'peak_evening': passTimeOfDay = hour >= 19 && hour < 22; break;
            case 'inter_morning':   passTimeOfDay = hour >= 10 && hour < 13; break;
            case 'inter_afternoon': passTimeOfDay = hour >= 15 && hour < 19; break;
            case 'night': passTimeOfDay = hour >= 22 || hour < 8; break;
            default: passTimeOfDay = true;
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
            
            {/* Sidebar Filters */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
                  <span className="mr-2 text-xl">🔍</span> Φίλτρα & Προβολή
                </h3>

                {/* 1. VISUALIZATION MODE BUTTONS */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🗺️ Τρόπος Προβολής
                  </label>
                  <div className="flex flex-col gap-2">
                    {/* Button: Points */}
                    <button
                      onClick={() => setVisualizationMode('points')}
                      className={`w-full py-2 px-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2
                        ${visualizationMode === 'points' 
                          ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm ring-1 ring-cyan-200' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                    >
                      📍 Σημεία (Ακριβή)
                    </button>

                    {/* Button: Heatmap (Density) */}
                    <button
                      onClick={() => setVisualizationMode('heatmap')}
                      className={`w-full py-2 px-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2
                        ${visualizationMode === 'heatmap' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm ring-1 ring-blue-200' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                    >
                      🔥 Heatmap (Πυκνότητα)
                    </button>

                    {/* Button: IDW (Interpolation) */}
                    <button
                      onClick={() => setVisualizationMode('idw')}
                      className={`w-full py-2 px-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2
                        ${visualizationMode === 'idw' 
                          ? 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm ring-1 ring-orange-200' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                    >
                      🌡️ IDW (Ένταση dB)
                    </button>
                  </div>
                </div>
                
                {/* 2. FILTERS */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Πηγή Θορύβου</label>
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none">
                            <option value="all">Όλες οι πηγές</option>
                            <option value="traffic">Οδική Κυκλοφορία</option>
                            <option value="construction">Εργοτάξιο / Κατασκευές</option>
                            <option value="music">Έντονη Μουσική</option>
                            <option value="human">Ανθρώπινη Ομιλία</option>
                            <option value="nature">Φυσικό Περιβάλλον</option>
                            <option value="industrial">Βιομηχανικός Θόρυβος</option>
                            <option value="other">Άλλο</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Ώρα Ημέρας</label>
                        <select value={timeOfDayFilter} onChange={(e) => setTimeOfDayFilter(e.target.value)} className="w-full p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none">
                            <option value="all">🕒 Όλη την ημέρα</option>
                            <option disabled>--- Ώρες Αιχμής ---</option>
                            <option value="peak_morning">🚨 Αιχμή Πρωί (08-10)</option>
                            <option value="peak_noon">🚨 Αιχμή Μεσημέρι (13-15)</option>
                            <option value="peak_evening">🚨 Αιχμή Βράδυ (19-22)</option>
                            <option disabled>--- Άλλες ---</option>
                            <option value="inter_morning">⏳ Πρωί (10-13)</option>
                            <option value="inter_afternoon">⏳ Απόγευμα (15-19)</option>
                            <option value="night">🌙 Νύχτα (22-08)</option>
                        </select>
                    </div>
                </div>

                {/* 3. TIMELINE */}
                <div className="mb-6 pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📅 Χρονικό Εύρος
                  </label>
                  <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Από</span>
                            <span className="font-medium">{formatDate(selectedRange.start)}</span>
                        </div>
                        <input type="range" min={dateBounds.min} max={dateBounds.max} value={selectedRange.start} onChange={handleStartChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Έως</span>
                            <span className="font-medium">{formatDate(selectedRange.end)}</span>
                        </div>
                        <input type="range" min={dateBounds.min} max={dateBounds.max} value={selectedRange.end} onChange={handleEndChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
                    </div>
                  </div>
                </div>

                {/* 4. LEGEND (Δυναμικό ανάλογα με το Mode) */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {/* Τίτλος Legend */}
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">
                        {visualizationMode === 'heatmap' ? 'Πυκνοτητα Καταγραφων' : 'Ενταση Θορυβου (dB)'}
                    </h4>

                    {/* A. LEGEND ΓΙΑ POINTS */}
                    {visualizationMode === 'points' && (
                        <div className="space-y-1.5 text-xs font-medium text-gray-600">
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#047857] mr-2"></span> &lt; 40 dB (Πολύ Χαμηλό)</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></span> 41-45 dB</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#22c55e] mr-2"></span> 46-50 dB</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#84cc16] mr-2"></span> 51-55 dB</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#facc15] mr-2"></span> 56-60 dB</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#fab115] mr-2"></span> 61-65 dB</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#fb923c] mr-2"></span> 66-70 dB</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#ea580c] mr-2"></span> 71-75 dB</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#dc2626] mr-2"></span> 76-80 dB</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#7f1d1d] mr-2"></span> &gt; 80 dB (Επικίνδυνο)</div>
                        </div>
                    )}

                    {/* B. LEGEND ΓΙΑ IDW (GRADIENT) */}
                    {visualizationMode === 'idw' && (
                        <div>
                            {/* Gradient Bar: Green -> Yellow -> Red */}
                            <div className="w-full h-4 rounded mb-1" style={{
                                background: 'linear-gradient(to right, #047857, #10b981, #22c55e, #facc15, #fb923c, #dc2626, #7f1d1d)'
                            }}></div>
                            <div className="flex justify-between text-xs text-gray-500 font-medium">
                                <span>30dB</span>
                                <span>65dB</span>
                                <span>100dB</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 italic text-center">
                                *Υπολογισμός μέσου όρου με χωρική παρεμβολή (IDW)
                            </p>
                        </div>
                    )}

                    {/* C. LEGEND ΓΙΑ DENSITY HEATMAP */}
                    {visualizationMode === 'heatmap' && (
                        <div>
                            {/* Gradient Bar: Blue -> Lime -> Red */}
                            <div className="w-full h-4 rounded mb-1" style={{
                                background: 'linear-gradient(to right, blue, lime, red)'
                            }}></div>
                            <div className="flex justify-between text-xs text-gray-500 font-medium">
                                <span>Αραιή</span>
                                <span>Μέτρια</span>
                                <span>Πυκνή</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 italic text-center">
                                *Δείχνει τη συχνότητα/πυκνότητα των μετρήσεων
                            </p>
                        </div>
                    )}
                </div>

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