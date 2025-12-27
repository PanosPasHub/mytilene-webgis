import React, { useState, useRef, useEffect } from 'react';
import { Mic, Activity, Settings } from 'lucide-react';

export const NoiseRecorder = ({ isReady, onRecordingComplete, onError, onOpenCalibration }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [instantDb, setInstantDb] = useState(0);

  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const sourceRef = useRef(null);
  
  const dbReadingsRef = useRef([]);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null); 
  
  // Ref για το smoothing (κρατάμε την προηγούμενη τιμή)
  const previousDbRef = useRef(40); 

  useEffect(() => {
    return () => stopResources();
  }, []);

  const stopResources = () => {
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
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startRecording = async () => {
    if (!isReady) return;

    // ΑΛΛΑΓΗ 1: Default Offset στο 100
    const storedOffset = parseInt(localStorage.getItem('mic_calibration_offset')) || 100;

    try {
      const constraints = {
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false, // Σημαντικό για να μετράει περιβαλλοντικό θόρυβο
          channelCount: 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      // Χρήση buffer 4096 για λίγο πιο σταθερές μετρήσεις (θυσιάζει ελάχιστη ταχύτητα απόκρισης για ακρίβεια)
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0; 

      source.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      setIsRecording(true);
      setProgress(0);
      dbReadingsRef.current = [];
      previousDbRef.current = 40; // Reset starting smoothing value
      startTimeRef.current = Date.now();
      const DURATION = 60000; 

      scriptProcessor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
        }
        let rms = Math.sqrt(sum / inputData.length);

        // ΑΛΛΑΓΗ 2: Καθαρά Μαθηματικά χωρίς το * 5.0
        let rawDb;
        if (rms > 0) {
            rawDb = 20 * Math.log10(rms) + storedOffset;
        } else {
            rawDb = 10;
        }

        rawDb = Math.max(10, Math.min(130, rawDb));
        
        // ΑΛΛΑΓΗ 3: SMOOTHING (Εξομάλυνση)
        // Αυτό κάνει την τιμή να μην "χοροπηδάει" σαν τρελή.
        // Το 0.8 σημαίνει: "Κράτα το 80% της παλιάς τιμής και βάλε το 20% της νέας".
        const alpha = 0.8;
        const smoothedDb = (alpha * previousDbRef.current) + ((1 - alpha) * rawDb);
        previousDbRef.current = smoothedDb;

        const displayDb = Math.round(smoothedDb);

        setInstantDb(displayDb);
        dbReadingsRef.current.push(displayDb);

        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed >= DURATION) {
            scriptProcessor.onaudioprocess = null; 
            finishRecording();
        }
      };

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const currentProgress = Math.min((elapsed / DURATION) * 100, 100);
        setProgress(currentProgress);
      }, 100);

    } catch (err) {
      console.error("Mic Error:", err);
      const msg = "Δεν βρέθηκε μικρόφωνο ή δεν δόθηκε άδεια.";
      if (onError) onError(msg);
      else alert(msg);
      setIsRecording(false);
    }
  };

  const finishRecording = () => {
    stopResources();
    setIsRecording(false);
    
    const readings = dbReadingsRef.current;
    if (readings.length === 0) {
        onRecordingComplete(0);
        return;
    }
    
    // ΑΛΛΑΓΗ 4: Σωστός υπολογισμός μέσου όρου Log-average
    let sumPower = 0;
    for (let i = 0; i < readings.length; i++) {
        sumPower += Math.pow(10, readings[i] / 10);
    }
    const avgPower = sumPower / readings.length;
    const avgDb = 10 * Math.log10(avgPower);
    
    onRecordingComplete(Math.round(avgDb));
  };

  // ... (Το υπόλοιπο return UI μένει ίδιο)
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
            {isReady ? 'Έναρξη Καταγραφής (1 λεπτό)' : 'Συμπληρώστε τα στοιχεία'}
            </button>
            
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
            <div className={`mb-4 font-bold text-4xl flex items-center justify-center gap-3 transition-colors duration-100 ${
                instantDb > 80 ? 'text-red-500' : instantDb > 65 ? 'text-orange-400' : 'text-cyan-400'
            }`}>
              <Activity className="animate-pulse w-8 h-8" />
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