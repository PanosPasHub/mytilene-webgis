import React, { useState } from 'react';
import { environmentalAPI } from '../services/api';

export function EnvironmentalForm({
  selectedLocation,
  currentStep,
  onNextStep,
  onPrevStep,
  onSuccess,
  onLoading
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    noiseLevel: '',
    temperatureFeeling: '',
    airQuality: '',
    pollutionType: '',
    weatherConditions: '',
    timeOfDay: '',
    photo: null,
    urgency: 'medium'
  });

  const [loading, setLoading] = useState(false);

  const environmentalData = {
    noiseLevels: [
      { value: 'low', label: '🔊 Χαμηλός', description: 'Δεν ενοχλεί' },
      { value: 'medium', label: '🔊 Μέτριος', description: 'Αισθητός αλλά ανεκτός' },
      { value: 'high', label: '🔊 Ενοχλητικός', description: 'Δυσάρεστος, ενοχλεί' },
      { value: 'very_high', label: '🔊 Βλαβερός', description: 'Επικίνδυνος για την υγεία' }
    ],
    
    temperatureFeelings: [
      { value: 'comfortable', label: '🌡️ Ήπιο', description: 'Ανετό, ευχάριστο' },
      { value: 'warm', label: '🌡️ Ζεστό', description: 'Θερμό αλλά ανεκτό' },
      { value: 'hot', label: '🌡️ Ζόρικο', description: 'Δύσκολο να ανεχτεί κανείς' },
      { value: 'unbearable', label: '🌡️ Αφόρητο', description: 'Αφόρητη ζέστη' }
    ],
    
    airQualityTypes: [
      { value: 'smoke', label: '🌫️ Κάπνα', icon: '🔥' },
      { value: 'garbage', label: '🗑️ Σκουπίδια', icon: '🚮' },
      { value: 'traffic', label: '🚗 Καυσαέρια', icon: '🚘' },
      { value: 'industrial', label: '🏭 Βιομηχανικά', icon: '🏗️' },
      { value: 'other', label: '❓ Άλλο', icon: '🎯' }
    ],
    
    weatherConditions: [
      { value: 'sunny', label: '☀️ Ηλιόλουστη' },
      { value: 'cloudy', label: '☁️ Συννεφιασμένη' },
      { value: 'rainy', label: '🌧️ Βροχερή' },
      { value: 'windy', label: '💨 Ανεμώδης' }
    ],
    
    timesOfDay: [
      { value: 'morning', label: '🌅 Πρωί (06:00-12:00)' },
      { value: 'afternoon', label: '☀️ Απόγευμα (12:00-18:00)' },
      { value: 'evening', label: '🌆 Βράδυ (18:00-24:00)' },
      { value: 'night', label: '🌙 Νύχτα (00:00-06:00)' }
    ]
  };

  const urgencyLevels = [
    { value: 'low', label: 'Χαμηλή', color: 'bg-green-500' },
    { value: 'medium', label: 'Μέτρια', color: 'bg-yellow-500' },
    { value: 'high', label: 'Υψηλή', color: 'bg-red-500' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (onLoading) onLoading(true);

    if (!selectedLocation) {
      alert('Παρακαλώ επιλέξτε μια τοποθεσία στον χάρτη!');
      setLoading(false);
      if (onLoading) onLoading(false);
      return;
    }

    try {
      const submissionData = {
        title: formData.title,
        description: formData.description,
        noise_level: formData.noiseLevel,
        temperature_feeling: formData.temperatureFeeling,
        pollution_type: formData.pollutionType,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        weather_conditions: formData.weatherConditions,
        time_of_day: formData.timeOfDay,
        urgency: formData.urgency
      };

      console.log('📤 Submission Data:', submissionData);

      await environmentalAPI.createReport(submissionData);

      // ✅ ΕΠΙΤΥΧΙΑ - Reset form και callback
      setFormData({
        title: '',
        description: '',
        noiseLevel: '',
        temperatureFeeling: '',
        airQuality: '',
        pollutionType: '',
        weatherConditions: '',
        timeOfDay: '',
        photo: null,
        urgency: 'medium'
      });

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Σφάλμα κατά την υποβολή της αναφοράς. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                currentStep >= step 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 ${
                  currentStep > step ? 'bg-cyan-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Βήμα 1: Βασικές Πληροφορίες */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Βασικές Πληροφορίες</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Τίτλος Αναφοράς *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="π.χ. 'Ισχυρή οσμή σκουπιδιών στην πλατεία'"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Περιγραφή
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Περιγράψτε λεπτομερώς τι παρατηρήσατε..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {selectedLocation && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onNextStep}
                className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Συνέχεια στις Μετρήσεις →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Βήμα 2: Περιβαλλοντικές Μετρήσεις */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Περιβαλλοντικές Μετρήσεις</h3>
          
          {/* Επίπεδο Θορύβου */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🔊 Επίπεδο Θορύβου
            </label>
            <div className="grid grid-cols-2 gap-3">
              {environmentalData.noiseLevels.map(level => (
                <label key={level.value} className="flex flex-col p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center mb-1">
                    <input
                      type="radio"
                      name="noiseLevel"
                      value={level.value}
                      checked={formData.noiseLevel === level.value}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="font-medium">{level.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{level.description}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Αίσθηση Θερμότητας */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🌡️ Αίσθηση Θερμότητας
            </label>
            <div className="grid grid-cols-2 gap-3">
              {environmentalData.temperatureFeelings.map(temp => (
                <label key={temp.value} className="flex flex-col p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center mb-1">
                    <input
                      type="radio"
                      name="temperatureFeeling"
                      value={temp.value}
                      checked={formData.temperatureFeeling === temp.value}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="font-medium">{temp.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{temp.description}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Τύπος Ρύπανσης */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🌫️ Τύπος Ρύπανσης/Οσμής
            </label>
            <div className="grid grid-cols-2 gap-3">
              {environmentalData.airQualityTypes.map(type => (
                <label key={type.value} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="pollutionType"
                    value={type.value}
                    checked={formData.pollutionType === type.value}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Συνθήκες */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🌤️ Καιρικές Συνθήκες
              </label>
              <select
                name="weatherConditions"
                value={formData.weatherConditions}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Επιλέξτε...</option>
                {environmentalData.weatherConditions.map(weather => (
                  <option key={weather.value} value={weather.value}>
                    {weather.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🕒 Ώρα Ημέρας
              </label>
              <select
                name="timeOfDay"
                value={formData.timeOfDay}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Επιλέξτε...</option>
                {environmentalData.timesOfDay.map(time => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onPrevStep}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Πίσω
            </button>
            <button
              type="button"
              onClick={onNextStep}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Συνέχεια →
            </button>
          </div>
        </div>
      )}

      {/* Βήμα 3: Ολοκλήρωση */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Ολοκλήρωση Αναφοράς</h3>
          
          {/* Επείγον */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Επίπεδο Επείγοντος
            </label>
            <div className="flex space-x-4">
              {urgencyLevels.map(level => (
                <label key={level.value} className="flex items-center">
                  <input
                    type="radio"
                    name="urgency"
                    value={level.value}
                    checked={formData.urgency === level.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className={`flex items-center px-4 py-2 rounded-full cursor-pointer transition-all ${
                    formData.urgency === level.value 
                      ? `${level.color} text-white shadow-md` 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                    {level.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Φωτογραφία */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📷 Φωτογραφία (προαιρετικά)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            {formData.photo && (
              <p className="mt-2 text-sm text-green-600">
                Επιλεγμένη φωτογραφία: {formData.photo.name}
              </p>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onPrevStep}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Πίσω
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Υποβολή...' : '📨 Υποβολή Αναφοράς'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}