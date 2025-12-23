import React, { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react'; // Βεβαιώσου ότι έχεις το lucide-react ή αντικατέστησε με FontAwesome

export const NoiseRecorder = ({ isReady, onRecordingComplete, onError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [instantDb, setInstantDb] = useState(0);

  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Σταθερά Βαθμονόμησης (Ρύθμισε την ανάλογα με τις δοκιμές σου)
  const CALIBRATION_OFFSET = 90;

  useEffect(() => {
    // Cleanup αν ο χρήστης φύγει από τη σελίδα
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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
        let currentDb = 20 * Math.log10(rms) + CALIBRATION_OFFSET;
        
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
      onError("Δεν βρέθηκε μικρόφωνο ή δεν δόθηκε άδεια πρόσβασης.");
      setIsRecording(false);
    }
  };

  const finishRecording = (readings) => {
    stopResources();
    setIsRecording(false);
    
    // Υπολογισμός μέσου όρου
    const avg = readings.reduce((a, b) => a + b, 0) / readings.length;
    onRecordingComplete(Math.round(avg));
  };

  return (
    <div className="w-full mt-6">
      {!isRecording ? (
        <button
          onClick={startRecording}
          disabled={!isReady}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md
            ${!isReady
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-cyan-600 text-white hover:bg-cyan-700 active:scale-95'
            }`}
        >
          <Mic className="w-6 h-6" />
          {isReady ? 'Έναρξη Καταγραφής (10s)' : 'Επιλέξτε πεδία για ενεργοποίηση'}
        </button>
      ) : (
        <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-center animate-pulse">
          <div className="mb-2 font-bold text-cyan-800 text-xl">
            Γίνεται Καταγραφή... {instantDb} dB
          </div>
          <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-red-500 h-4 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Παρακαλώ παραμείνετε ακίνητοι</p>
        </div>
      )}
    </div>
  );
};