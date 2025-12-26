import React, { useState, useRef, useEffect } from 'react';
import { Mic, Activity, Settings } from 'lucide-react';

export const NoiseRecorder = ({ isReady, onRecordingComplete, onError, onOpenCalibration }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [instantDb, setInstantDb] = useState(0);

  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => stopResources();
  }, []);

  const stopResources = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startRecording = async () => {
    if (!isReady) return;

    // --- ΚΡΙΣΙΜΟ: Διάβασμα του Offset εδώ ---
    // Έτσι εξασφαλίζουμε ότι θα πάρει την τελευταία τιμή που έσωσε ο χρήστης στο DeviceCalibration
    const storedOffset = parseInt(localStorage.getItem('mic_calibration_offset')) || 90;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false 
        } 
      });
      
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setIsRecording(true);
      setProgress(0);
      
      let dbReadings = [];
      const startTime = Date.now();
      const DURATION = 10000; // 10 δευτερόλεπτα

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min((elapsed / DURATION) * 100, 100);
        setProgress(currentProgress);

        // Υπολογισμός dB
        analyser.getByteTimeDomainData(dataArray);
        let sumSq = 0;
        for (let i = 0; i < bufferLength; i++) {
          let norm = (dataArray[i] / 128.0) - 1;
          sumSq += norm * norm;
        }
        let rms = Math.sqrt(sumSq / bufferLength);
        
        // Χρήση του storedOffset
        let currentDb = 20 * Math.log10(rms) + storedOffset;
        
        // Φιλτράρισμα
        if (!isFinite(currentDb)) currentDb = 30;
        currentDb = Math.max(30, currentDb);

        setInstantDb(Math.round(currentDb));
        dbReadings.push(currentDb);

        if (elapsed >= DURATION) {
          finishRecording(dbReadings);
        }
      }, 100);

    } catch (err) {
      console.error("Mic Error:", err);
      if (onError) {
        onError("Δεν βρέθηκε μικρόφωνο ή δεν δόθηκε άδεια πρόσβασης.");
      } else {
        alert("Δεν βρέθηκε μικρόφωνο ή δεν δόθηκε άδεια πρόσβασης.");
      }
      setIsRecording(false);
    }
  };

  const finishRecording = (readings) => {
    stopResources();
    setIsRecording(false);
    
    const avg = readings.reduce((a, b) => a + b, 0) / readings.length;
    onRecordingComplete(Math.round(avg));
  };

  return (
    <div className="w-full mt-6">
      {!isRecording ? (
        <div className="space-y-3">
            <button
            onClick={startRecording}
            disabled={!isReady}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md border-b-4 active:border-b-0 active:translate-y-1
                ${!isReady
                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                : 'bg-cyan-600 text-white border-cyan-800 hover:bg-cyan-500'
                }`}
            >
            <Mic className="w-6 h-6" />
            {isReady ? 'Έναρξη Καταγραφής (10s)' : 'Συμπληρώστε τα στοιχεία'}
            </button>
            
            {/* Κουμπί για άνοιγμα Calibration */}
            <div className="flex justify-center">
                <button 
                    onClick={onOpenCalibration}
                    className="text-xs flex items-center gap-1 text-gray-500 hover:text-cyan-600 transition-colors py-2 px-3 rounded-lg hover:bg-gray-100"
                >
                    <Settings className="w-3 h-3" />
                    Ρυθμίσεις / Βαθμονόμηση
                </button>
            </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="mb-4 font-bold text-cyan-400 text-2xl flex items-center justify-center gap-3">
              <Activity className="animate-pulse" />
              {instantDb} dB
            </div>
            
            <div className="w-full bg-gray-900 rounded-full h-6 overflow-hidden border border-gray-700">
              <div 
                className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-400 mt-4 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Παρακαλώ παραμείνετε ακίνητοι
            </p>
          </div>
        </div>
      )}
    </div>
  );
};