// src/services/api.js

const API_BASE_URL = 'http://localhost:5000/api';

// Enhanced API call function
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

    // Remove body for GET requests
    if (config.method === 'GET') {
      delete config.body;
    }

    const response = await fetch(url, config);
    
    console.log('📨 Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Success:', data);
    return data;
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    throw new Error(`Δεν ήταν δυνατή η σύνδεση: ${error.message}`);
  }
};

// Environmental Reports API
export const environmentalAPI = {
  getReports: () => apiCall('/environmental/reports'),
  getReportsGeoJSON: () => apiCall('/environmental/reports/geojson'),
  getReportById: (id) => apiCall(`/environmental/reports/${id}`),
  createReport: (reportData) => 
    apiCall('/environmental/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),
  getHeatAnalysis: () => apiCall('/environmental/analysis/heat'),
  getNoiseAnalysis: () => apiCall('/environmental/analysis/noise'),
  getHotspots: (type = 'heat') => 
    apiCall(`/environmental/analysis/hotspots?type=${type}`),
};

export const healthCheck = () => apiCall('/health');