// src/services/api.js

const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) {
    // Αφαιρούμε το /noise αν υπάρχει ήδη στο env variable για να έχουμε καθαρό base
    return envUrl.endsWith('/noise') ? envUrl.replace('/noise', '') : envUrl;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('📡 API Call:', url, options.method || 'GET');
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Σφάλμα Server (${response.status}): ${errorText}`);
    }

    // Προσπάθεια ανάγνωσης JSON, αλλιώς επιστροφή σκέτου κειμένου ή empty object
    const text = await response.text();
    return text ? JSON.parse(text) : {};
    
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

export const environmentalAPI = {
  // Αυτή είναι η συνάρτηση που καλεί το ReportPage.
  // data: Το αντικείμενο reportData { noise_db_val, latitude, longitude, ... }
  submitReading: (data) => {
    return apiCall('/noise', { 
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};