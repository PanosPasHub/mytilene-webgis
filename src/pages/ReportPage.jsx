import React, { useState } from 'react';
import { MapWebgis } from '../components/MapWebgis';
import { HeroSlider } from '../components/HeroSlider';
import { Footer } from '../components/Footer';

export default function ReportPage() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [reportData, setReportData] = useState({
    category: '',
    title: '',
    description: '',
    photo: null,
    urgency: 'medium'
  });

  // Κατηγορίες προβλημάτων
  const categories = [
    { value: 'noise', label: 'Θόρυβος', icon: '🔊' },
    { value: 'pollution', label: 'Αέριος Ρύπος/Οσμές', icon: '🌫️' },
    { value: 'heat', label: 'Θερμική Δυσφορία', icon: '🌡️' },
    { value: 'waste', label: 'Σκουπίδια', icon: '🗑️' },
    { value: 'infrastructure', label: 'Υποδομές', icon: '🏗️' },
    { value: 'other', label: 'Άλλο', icon: '❓' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Χαμηλή', color: 'bg-green-500' },
    { value: 'medium', label: 'Μέτρια', color: 'bg-yellow-500' },
    { value: 'high', label: 'Υψηλή', color: 'bg-red-500' }
  ];

  const handleLocationSelect = (latlng) => {
    setSelectedLocation(latlng);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportData(prev => ({
        ...prev,
        photo: file
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      alert('Παρακαλώ επιλέξτε μια τοποθεσία στον χάρτη!');
      return;
    }

    if (!reportData.category || !reportData.title) {
      alert('Παρακαλώ συμπληρώστε τα απαραίτητα πεδία!');
      return;
    }

    // Προσομοίωση υποβολής
    const submission = {
      ...reportData,
      location: selectedLocation,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    console.log('Αναφορά υποβλήθηκε:', submission);
    alert('Η αναφορά σας υποβλήθηκε επιτυχώς! 📝');

    // Reset form
    setSelectedLocation(null);
    setReportData({
      category: '',
      title: '',
      description: '',
      photo: null,
      urgency: 'medium'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Κύριο Περιεχόμενο */}
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/images/logo.png" 
                alt="Mytilene Logo" 
                className="h-16 w-16"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Αναφορά Προβλήματος
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Βοηθήστε μας να βελτιώσουμε την ποιότητα ζωής στη Μυτιλήνη. 
              Αναφέρετε προβλήματα που παρατηρείτε στον δημόσιο χώρο.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Χάρτης */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Επιλογή Τοποθεσίας
              </h2>
              <p className="text-gray-600 mb-4">
                Κάντε κλικ στον χάρτη για να επιλέξετε την ακριβή τοποθεσία του προβλήματος
              </p>
              
              {/* Χρήση του MapWebgis component */}
              <MapWebgis 
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationSelect}
                height="400px"
              />

              {selectedLocation && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✅ Τοποθεσία επιλεγμένη: 
                    <span className="font-normal ml-2">
                      {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Φόρμα */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Λεπτομέρειες Αναφοράς
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Κατηγορία */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Κατηγορία Προβλήματος *
                  </label>
                  <select
                    name="category"
                    value={reportData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    <option value="">Επιλέξτε κατηγορία...</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Τίτλος */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Τίτλος Αναφοράς *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={reportData.title}
                    onChange={handleInputChange}
                    placeholder="π.χ. 'Δυνατός θόρυβος από κατασκευαστικό έργο'"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Περιγραφή */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Περιγραφή
                  </label>
                  <textarea
                    name="description"
                    value={reportData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Περιγράψτε λεπτομερώς το πρόβλημα..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

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
                          checked={reportData.urgency === level.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span className={`flex items-center px-4 py-2 rounded-full cursor-pointer transition-all ${
                          reportData.urgency === level.value 
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
                    Φωτογραφία (προαιρετικά)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  {reportData.photo && (
                    <p className="mt-2 text-sm text-green-600">
                      📷 Επιλεγμένη φωτογραφία: {reportData.photo.name}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedLocation}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                    selectedLocation 
                      ? 'bg-cyan-500 hover:bg-cyan-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {selectedLocation ? '📨 Υποβολή Αναφοράς' : 'Επιλέξτε Τοποθεσία'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}