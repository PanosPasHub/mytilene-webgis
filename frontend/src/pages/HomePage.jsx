import React, { useState } from "react";
import { HeroSlider } from "../components/HeroSlider";
import { CityMap } from "../components/CityMap";
import { EventsCarousel } from "../components/EventsCarousel";
import { MustDoSection } from "../components/MustDoSection";
import { Footer } from "../components/Footer";
import { events } from "../data/eventsData";
import L from "leaflet";

// Διόρθωση εικονιδίων Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function HomePage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Κατάσταση για το αν ο χάρτης είναι ενεργός (ξεκλείδωτος)
  const [isMapActive, setIsMapActive] = useState(false);

  // Όταν επιλέγεται ένα event από το carousel
  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setIsMapActive(true); // Ενεργοποιούμε τον χάρτη αυτόματα
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <HeroSlider />

      <section id="explore" className="relative flex flex-col items-center py-12">
        <h2 className="text-3xl font-bold mb-6">Γνώρισε την πόλη</h2>
        
        {/* Περνάμε το state και το setter στον χάρτη */}
        <CityMap 
          selectedEvent={selectedEvent} 
          isActive={isMapActive}
          onActivate={() => setIsMapActive(true)}
        />
        
        <div className="w-full mt-8 px-4">
          <EventsCarousel 
            events={events} 
            onSelect={handleEventSelect} 
          />
        </div>
      </section>

      <MustDoSection />
      <Footer />
    </div>
  );
}