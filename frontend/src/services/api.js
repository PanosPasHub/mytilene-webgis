// src/services/api.js

// Ρύθμιση της διεύθυνσης του Server
// Βεβαιώσου ότι ο server τρέχει στο port 5000
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Κεντρική συνάρτηση για όλες τις κλήσεις προς το API.
 * Διαχειρίζεται τα Headers, τη μετατροπή JSON και τα σφάλματα.
 */
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('📡 API Call:', url, options.method || 'GET');
  
  try {
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Αφαίρεση body για GET requests (δεν επιτρέπεται body στα GET)
    if (config.method === 'GET') {
      delete config.body;
    }

    const response = await fetch(url, config);
    
    // --- ΕΛΕΓΧΟΣ ΣΦΑΛΜΑΤΩΝ (Βελτιωμένη & Απλοποιημένη Λογική) ---
    if (!response.ok) {
      // 1. Διαβάζουμε την απάντηση ως κείμενο
      const errorText = await response.text();
      let errorMessage = `HTTP Error ${response.status}`; // Default μήνυμα αν αποτύχουν τα υπόλοιπα

      try {
          // 2. Προσπάθεια να διαβάσουμε το JSON από τον server
          const errorJson = JSON.parse(errorText);
          
          // 3. Ψάχνουμε το σωστό πεδίο για το μήνυμα
          // Προτεραιότητα: message > error > όλο το JSON string
          if (errorJson.message) {
            errorMessage = errorJson.message;
          } else if (errorJson.error) {
            errorMessage = errorJson.error;
          } else {
            errorMessage = errorText;
          }
          
      } catch (e) {
          // 4. Αν δεν είναι JSON (π.χ. HTML page), κρατάμε το κείμενο αν υπάρχει
          if (errorText) {
             errorMessage = `Σφάλμα (${response.status}): ${errorText.substring(0, 100)}`; 
          }
      }

      // 5. Πετάμε το τελικό καθαρό μήνυμα για να το δείξει το ReportPage
      throw new Error(errorMessage);
    }

    // --- ΕΠΙΤΥΧΙΑ ---
    const text = await response.text();
    // Αν υπάρχει απάντηση, την κάνουμε parse, αλλιώς επιστρέφουμε κενό αντικείμενο
    const data = text ? JSON.parse(text) : {};
    
    console.log('✅ API Success:', data);
    return data;
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    // Αν είναι σφάλμα δικτύου (π.χ. Failed to fetch), βάζουμε πρόθεμα.
    if (error.message === 'Failed to fetch') {
        throw new Error('Δεν ήταν δυνατή η σύνδεση με τον Server. Ελέγξτε αν είναι ενεργός.');
    }
    // Αναμετάδοση του σφάλματος όπως είναι
    throw error;
  }
};

export const environmentalAPI = {
  // 1. Υποβολή Καταγραφής Θορύβου
  // Καλείται από το ReportPage.jsx
  submitNoiseReport: (reportData) => 
    apiCall('/noise', {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),

  // 2. Λήψη GeoJSON (Για μελλοντική χρήση στον χάρτη)
  getNoiseGeoJSON: () => apiCall('/noise/geojson'),
};

// Έλεγχος Υγείας Server
export const healthCheck = () => apiCall('/health');