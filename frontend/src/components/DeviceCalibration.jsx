import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Settings } from 'lucide-react';

export const DeviceCalibration = ({ onClose, onSave }) => {
  // Διαβάζουμε το αποθηκευμένο offset ή βάζουμε το default 90
  const [offset, setOffset] = useState(() => {
    const stored = localStorage.getItem('mic_calibration_offset');
    return stored ? parseInt(stored) : 90;
  });

  // Ref για να κρατάμε την τρέχουσα τιμή του offset ενημερωμένη μέσα στο interval
  const offsetRef = useRef(offset);
  
  // Ref για να ελέγχουμε αν το component είναι mounted (για αποφυγή memory leaks)
  const isMountedRef = useRef(true);

  const [currentDb, setCurrentDb] = useState(0);

  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Ενημερώνουμε το ref κάθε φορά που αλλάζει το offset slider
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  // Ξεκινάμε την ακρόαση αυτόματα μόλις ανοίξει το component
  useEffect(() => {
    isMountedRef.current = true;
    startListening();
    
    return () => {
      isMountedRef.current = false;
      stopListening();
    };
  }, []);

  const stopListening = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } 
      });

      // Έλεγχος: Αν το component έκλεισε όσο περιμέναμε την άδεια μικροφώνου
      if (!isMountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

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

      intervalRef.current = setInterval(() => {
        // Ασφαλής έλεγχος αν το component έχει κλείσει
        if (!isMountedRef.current) return;

        analyser.getByteTimeDomainData(dataArray);
        let sumSq = 0;
        for (let i = 0; i < bufferLength; i++) {
          let norm = (dataArray[i] / 128.0) - 1;
          sumSq += norm * norm;
        }
        let rms = Math.sqrt(sumSq / bufferLength);
        
        // Χρήση του offsetRef.current αντί για offset για να έχουμε την live τιμή
        let db = 20 * Math.log10(rms) + offsetRef.current;
        
        if (!isFinite(db)) db = 30;
        db = Math.max(30, db);

        setCurrentDb(Math.round(db));
      }, 100);

    } catch (err) {
      console.error("Calibration Mic Error:", err);
    }
  };

  const handleSave = () => {
    localStorage.setItem('mic_calibration_offset', offset);
    if (onSave) onSave(offset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
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
                <strong className="block text-cyan-800 mb-2">Οδηγίες:</strong>
                <ol className="list-decimal pl-4 space-y-1">
                <li>Πηγαίνετε σε <strong>απόλυτα ήσυχο δωμάτιο</strong>.</li>
                <li>Μετακινήστε την μπάρα μέχρι η τιμή να δείχνει <strong>30-35 dB</strong> (επίπεδο ησυχίας).</li>
                </ol>
            </div>

            {/* Real-time Display */}
            <div className="flex flex-col items-center justify-center gap-2 mb-8">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Τρεχουσα Ενδειξη</div>
                <div className={`text-5xl font-bold font-mono transition-all duration-300 ${
                currentDb >= 30 && currentDb <= 35 ? 'text-green-600 scale-110' : 'text-gray-800'
                }`}>
                {currentDb} <span className="text-xl text-gray-400 font-sans font-normal">dB</span>
                </div>
            </div>

            {/* Slider */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                <span>Χαμηλή Ευαισθησία</span>
                <span>Υψηλή Ευαισθησία</span>
                </div>
                <input 
                type="range" 
                min="50" 
                max="150" 
                value={offset} 
                onChange={(e) => setOffset(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
                <div className="text-center text-xs font-mono text-gray-400 mt-2">Offset Value: {offset}</div>
            </div>

            <button 
                onClick={handleSave}
                className="w-full bg-cyan-600 text-white py-3 rounded-xl font-bold hover:bg-cyan-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
            >
                <Save className="w-5 h-5" />
                Αποθήκευση Ρύθμισης
            </button>
        </div>
      </div>
    </div>
  );
};