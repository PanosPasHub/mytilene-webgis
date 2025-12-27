import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Settings, AlertTriangle } from 'lucide-react';

export const DeviceCalibration = ({ onClose, onSave }) => {
  // ΑΛΛΑΓΗ 1: Default Offset στο 100 αντί για 70
  const [offset, setOffset] = useState(() => {
    const stored = localStorage.getItem('mic_calibration_offset');
    return stored ? parseInt(stored) : 100; 
  });

  const offsetRef = useRef(offset);
  const isMountedRef = useRef(true);
  
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const sourceRef = useRef(null);

  const [currentDb, setCurrentDb] = useState(0);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    isMountedRef.current = true;
    startListening();
    
    return () => {
      isMountedRef.current = false;
      stopListening();
    };
  }, []);

  const stopListening = () => {
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current.onaudioprocess = null;
        scriptProcessorRef.current = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
  };

  const startListening = async () => {
    try {
      const constraints = {
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false, // Προσπαθούμε να πάρουμε τον "ωμό" θόρυβο
          channelCount: 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!isMountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0;

      source.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      scriptProcessor.onaudioprocess = (event) => {
        if (!isMountedRef.current) return;

        const inputData = event.inputBuffer.getChannelData(0);
        
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
        }
        let rms = Math.sqrt(sum / inputData.length);

        // Ο καθαρός τύπος είναι 20*log10(rms) + Offset
        
        let db;
        if (rms > 0) {
            db = 20 * Math.log10(rms) + offsetRef.current;
        } else {
            db = 10;
        }
        
        // Clamping σε λογικά όρια
        db = Math.max(10, Math.min(130, db));
        setCurrentDb(Math.round(db));
      };

    } catch (err) {
      console.error("Calibration Mic Error:", err);
      alert("Δεν ήταν δυνατή η πρόσβαση στο μικρόφωνο.");
    }
  };

  const handleSave = () => {
    localStorage.setItem('mic_calibration_offset', offset);
    if (onSave) onSave(offset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header - Same as before */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-600" />
            Βαθμονόμηση Συσκευής
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
            <div className="text-sm text-gray-600 mb-6 bg-cyan-50 p-4 rounded-lg border border-cyan-100">
                <strong className="block text-cyan-800 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4"/>
                    Οδηγίες:
                </strong>
                <ol className="list-decimal pl-4 space-y-1">
                {/* ΑΛΛΑΓΗ 3: Ενημέρωση οδηγιών για πιο ρεαλιστικές τιμές */}
                <li>Σε απόλυτη ησυχία, ρυθμίστε να δείχνει <strong>35-40 dB</strong> (όχι 0).</li>
                <li>Μιλήστε κανονικά. Πρέπει να δείχνει <strong>60-70 dB</strong>.</li>
                </ol>
            </div>

            {/* Real-time Display */}
            <div className="flex flex-col items-center justify-center gap-2 mb-8 bg-gray-900 rounded-xl p-6 shadow-inner">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Τρεχουσα Ενδειξη</div>
                <div className={`text-6xl font-bold font-mono transition-all duration-75 ${
                currentDb > 80 ? 'text-red-500' : currentDb > 60 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                {currentDb}
                </div>
                <span className="text-xl text-gray-500 font-sans font-normal">dB SPL</span>
            </div>

            {/* Slider */}
            <div className="mb-8">
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                <span>- Ευαισθησία</span>
                <span>+ Ευαισθησία</span>
                </div>
                <input 
                type="range" 
                min="0" 
                max="150" 
                value={offset} 
                onChange={(e) => setOffset(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
                <div className="text-center text-xs font-mono text-gray-400 mt-2">Offset: {offset} dB</div>
            </div>

            <button 
                onClick={handleSave}
                className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold hover:bg-cyan-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
            >
                <Save className="w-5 h-5" />
                Αποθήκευση Ρύθμισης
            </button>
        </div>
      </div>
    </div>
  );
};