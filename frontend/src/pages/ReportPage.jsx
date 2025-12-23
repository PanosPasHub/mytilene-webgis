import React, { useState } from 'react';
import { HeroSlider } from "../components/HeroSlider";
import { Footer } from "../components/Footer";
import { NoiseRecorder } from "../components/NoiseRecorder"; 
import { Info, AlertCircle, CheckCircle } from 'lucide-react'; 
import { environmentalAPI } from '../services/api'; 

export default function ReportPage() {
  // --- State Variables ---
  const [annoyanceLevel, setAnnoyanceLevel] = useState('');
  const [noiseSource, setNoiseSource] = useState('');
  
  // State για τη διαχείριση UI (Loading/Success/Error)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // --- Επιλογές Dropdowns ---
  const sources = [
    { value: 'nature', label: 'Φυσικό Περιβάλλον (Αέρας/Θάλασσα/Ζώα)' },
    { value: 'traffic', label: 'Οδική Κυκλοφορία (Οχήματα)' },
    { value: 'construction', label: 'Εργοτάξιο / Κατασκευές' },
    { value: 'music', label: 'Έντονη Μουσική / Διασκέδαση' },
    { value: 'human', label: 'Ανθρώπινη Ομιλία / Πλήθος' },
    { value: 'industrial', label: 'Βιομηχανικός Θόρυβος' },
    { value: 'other', label: 'Άλλο' }
  ];

  const levels = [
    { value: '1', label: '1 - Καθόλου Ενοχλητικό' },
    { value: '2', label: '2 - Λίγο Ενοχλητικό' },
    { value: '3', label: '3 - Μέτρια Ενοχλητικό' },
    { value: '4', label: '4 - Πολύ Ενοχλητικό' },
    { value: '5', label: '5 - Ανυπόφορο' }
  ];

  // --- Helper: Λήψη GPS (Βελτιωμένη) ---
  const getGeolocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Η γεωτοποθεσία δεν υποστηρίζεται από τον browser."));
        return;
      }

      const success = (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      };

      const error = (err) => {
        // Αν αποτύχει η υψηλή ακρίβεια (timeout), δοκιμάζουμε με χαμηλότερη
        if (err.code === 3) { // Timeout
            console.warn("High accuracy GPS timed out, trying low accuracy...");
            navigator.geolocation.getCurrentPosition(
                success,
                (err2) => reject(err2),
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
            );
        } else {
            reject(err);
        }
      };

      // Πρώτη προσπάθεια: Υψηλή Ακρίβεια, Timeout 10 δευτερόλεπτα
      navigator.geolocation.getCurrentPosition(success, error, { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 10000 
      });
    });
  };

  // --- Handler: Ολοκλήρωση Καταγραφής & Υποβολή ---
  const handleRecordingComplete = async (avgDb) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Λήψη τοποθεσίας (GPS)
      const location = await getGeolocation();

      // 2. Ετοιμασία δεδομένων (DTO)
      const reportData = {
        noise_db_val: avgDb,
        noise_source: noiseSource,
        annoyance_level: parseInt(annoyanceLevel),
        latitude: location.lat,
        longitude: location.lng,
      };

      // 3. Αποστολή στο API μέσω του Service (api.js)
      // Εδώ καλούμε τη μέθοδο που φτιάξαμε στο services/api.js
      await environmentalAPI.submitNoiseReport(reportData);

      // 4. Επιτυχία
      setSubmitSuccess(true);
      resetForm();

    } catch (error) {
  console.error("Submission Error:", error);

  // 1. Ξεκινάμε με το πραγματικό μήνυμα που ήρθε από το api.js
  // (π.χ. "Η καταγραφή βρίσκεται εκτός της περιοχής της Μυτιλήνης.")
  let msg = error.message;

  // 2. Ελέγχουμε τους κωδικούς σφάλματος του GPS (GeolocationPositionError)
  if (error.code === 1) msg = "Η πρόσβαση στην τοποθεσία απορρίφθηκε. Παρακαλώ ενεργοποιήστε το GPS.";
  else if (error.code === 2) msg = "Η τοποθεσία δεν είναι διαθέσιμη.";
  else if (error.code === 3) msg = "Η λήψη τοποθεσίας καθυστερεί πολύ. Μετακινηθείτε σε ανοιχτό χώρο.";
  
  // 3. Fallback: Αν για κάποιο λόγο το msg είναι κενό ή πολύ τεχνικό, βάζουμε το γενικό
  if (!msg || msg === "Failed to fetch") {
      msg = "Δυστυχώς προέκυψε σφάλμα επικοινωνίας.";
  }

  setErrorMessage(msg);
}finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAnnoyanceLevel('');
    setNoiseSource('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <HeroSlider />

      <div className="flex-grow py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-cyan-600 p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Καταγραφή Φυσικού Θορύβου
            </h1>
            <p className="text-cyan-100">
              Συμμετοχική δράση για τη χαρτογράφηση του φυσικού θορύβου στις γειτονιές της Μυτιλήνης
            </p>
          </div>

          <div className="p-8">
            {/* Οδηγίες Χρήσης */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
              <div className="flex items-center gap-2 mb-4">
                <Info className="text-blue-600 w-6 h-6" />
                <h3 className="font-bold text-blue-800 text-lg">Οδηγίες Καταγραφής</h3>
              </div>
              <ul className="space-y-3 text-gray-700 text-sm leading-relaxed list-disc pl-5">
                <li>Βοηθήστε μας να καταγράψουμε τον <strong>φυσικό θόρυβο</strong> σε κάθε γειτονιά της πόλης.</li>
                <li>Η καταγραφή πρέπει να γίνεται κατά κύριο λόγο μέσω κινητού σε <strong>εξωτερικό χώρο</strong>.</li>
                <li>Βεβαιωθείτε ότι έχετε <strong>ανοιχτή την τοποθεσία (GPS)</strong> της συσκευής σας.</li>
                <li>Καλό είναι να <strong>μην γίνεται καταγραφή</strong> όταν συμβαίνει κάποιο ξαφνικό γεγονός (π.χ. κορνάρισμα, βεγγαλικά, συναυλία).</li>
                <li>Το μικρόφωνο <strong>δεν πρέπει να καλύπτεται</strong> από θήκη ή από τα χέρια σας.</li>
                <li>Αποφύγετε την καταγραφή όταν το κινητό είναι εκτεθειμένο σε <strong>έντονο αέρα</strong>.</li>
              </ul>
            </div>

            {/* Dropdowns Selection */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  1. Υποκειμενική Ένταση
                </label>
                <div className="relative">
                  <select
                    value={annoyanceLevel}
                    onChange={(e) => setAnnoyanceLevel(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Πώς αντιλαμβάνεστε τον ήχο;</option>
                    {levels.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  2. Κυριότερη Πηγή
                </label>
                <div className="relative">
                  <select
                    value={noiseSource}
                    onChange={(e) => setNoiseSource(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Από πού προέρχεται;</option>
                    {sources.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Component Καταγραφής (NoiseRecorder) */}
            <NoiseRecorder 
              isReady={annoyanceLevel !== '' && noiseSource !== ''}
              onRecordingComplete={handleRecordingComplete}
              onError={(msg) => setErrorMessage(msg)}
            />

          </div>
        </div>
      </div>

      <Footer />

      {/* --- Modals / Overlays --- */}

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Αποστολή δεδομένων...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {submitSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm text-center transform transition-all scale-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Επιτυχία!</h3>
            <p className="text-gray-600 mb-6">
              Η καταγραφή σας ολοκληρώθηκε με επιτυχία. Σας ευχαριστούμε για τη συμβολή σας!
            </p>
            <button 
              onClick={() => setSubmitSuccess(false)}
              className="w-full bg-cyan-600 text-white py-3 rounded-lg font-bold hover:bg-cyan-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Σφάλμα</h3>
            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>
            <button 
              onClick={() => setErrorMessage(null)}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
            >
              Δοκιμάστε ξανά
            </button>
          </div>
        </div>
      )}

    </div>
  );
}