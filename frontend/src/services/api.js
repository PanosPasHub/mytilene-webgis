// 1. Δυναμική Ρύθμιση URL
// Ελέγχουμε αν υπάρχει μεταβλητή στο Netlify. 
// Αν η μεταβλητή τελειώνει σε "/noise", το αφαιρούμε για να έχουμε καθαρό το Base URL (.../api).
const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/noise') ? envUrl.replace('/noise', '') : envUrl;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

/**
 * Κεντρική συνάρτηση για όλες τις κλήσεις προς το API.
 * Διαχειρίζεται τα Headers, τη μετατροπή JSON και τα σφάλματα.
 */
const apiCall = async (endpoint, options = {}) => {
  // Προσοχή: Επειδή το API_BASE_URL τελειώνει σε /api, και το endpoint ξεκινάει με /, είμαστε οκ.
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

    // Αφαίρεση body για GET requests
    if (config.method === 'GET') {
      delete config.body;
    }

    const response = await fetch(url, config);
    
    // --- ΕΛΕΓΧΟΣ ΣΦΑΛΜΑΤΩΝ ---
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP Error ${response.status}`;

      try {
          const errorJson = JSON.parse(errorText);
          
          if (errorJson.message) {
            errorMessage = errorJson.message;
          } else if (errorJson.error) {
            errorMessage = errorJson.error;
          } else {
            errorMessage = errorText;
          }
          
      } catch (e) {
          if (errorText) {
             errorMessage = `Σφάλμα (${response.status}): ${errorText.substring(0, 100)}`; 
          }
      }

      throw new Error(errorMessage);
    }

    // --- ΕΠΙΤΥΧΙΑ ---
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    console.log('✅ API Success:', data);
    return data;
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.message === 'Failed to fetch') {
        throw new Error('Δεν ήταν δυνατή η σύνδεση με τον Server. Ελέγξτε τη σύνδεσή σας.');
    }
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

  // 2. Λήψη GeoJSON (Αν χρειαστεί στο μέλλον)
  getNoiseGeoJSON: () => apiCall('/noise'), 
};

// Έλεγχος Υγείας Server
export const healthCheck = () => apiCall('/health');