import React, { useState, useEffect } from 'react';
import { environmentalAPI } from '../services/api';
import { HeroSlider } from "../components/HeroSlider";
import { Footer } from "../components/Footer";
import { MapWebgis } from "../components/MapWebgis";
import { EnvironmentalForm } from "../components/EnvironmentalForm";

export default function ReportPage() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [reports, setReports] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Φόρτωση αναφορών από API
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await environmentalAPI.getReportsGeoJSON();
      setReports(response.features || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  // Συνάρτηση reset φόρμας
  const resetForm = () => {
    setSelectedLocation(null);
    setCurrentStep(1);
    loadReports();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSlider />

      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/images/logo.png" 
                alt="Mytilene Logo" 
                className="h-16 w-16"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Περιβαλλοντική Αναφορά
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Βοηθήστε μας να χαρτογραφήσουμε το μικροκλίμα και την ποιότητα περιβάλλοντος της Μυτιλήνης.
              Η εμπειρία σας είναι πολύτιμη!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Χάρτης - Όλη η λογική μέσα στο MapWebgis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <MapWebgis
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
                currentStep={currentStep}
                reports={reports}
                onNextStep={() => setCurrentStep(prev => prev + 1)}
              />
            </div>
            
            {/* Φόρμα - Όλη η λογική μέσα στο EnvironmentalForm */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <EnvironmentalForm
                selectedLocation={selectedLocation}
                currentStep={currentStep}
                onNextStep={() => setCurrentStep(prev => prev + 1)}
                onPrevStep={() => setCurrentStep(prev => prev - 1)}
                onSuccess={() => {
                  setSubmitSuccess(true);
                  resetForm();
                }}
                onLoading={setIsSubmitting}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && <LoadingOverlay />}
      
      {/* Success Message */}
      {submitSuccess && (
        <SuccessMessage onClose={() => setSubmitSuccess(false)} />
      )}

      <Footer />
    </div>
  );
}

// 🆕 Separate Components για τα Overlays
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full mx-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Υποβολή Αναφοράς
          </h3>
          <p className="text-gray-600">Αποθηκεύουμε την αναφορά σας...</p>
        </div>
      </div>
    </div>
  </div>
);

const SuccessMessage = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full mx-4 text-center">
      <div className="text-green-500 text-6xl mb-4">✅</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Επιτυχία!</h3>
      <p className="text-gray-600 mb-6">
        Η περιβαλλοντική σας αναφορά υποβλήθηκε επιτυχώς! 🌍
      </p>
      <button 
        onClick={onClose}
        className="bg-cyan-500 text-white px-8 py-3 rounded-lg hover:bg-cyan-600 transition-colors font-medium w-full"
      >
        ΟΚ
      </button>
    </div>
  </div>
);