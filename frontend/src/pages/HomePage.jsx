import React, { useState } from "react";
import { HeroSlider } from "../components/HeroSlider";
import { CityMap } from "../components/CityMap";
import { EventsCarousel } from "../components/EventsCarousel";
import { MustDoSection } from "../components/MustDoSection";
import { Footer } from "../components/Footer";
import { events } from "../data/eventsData";
import L from "leaflet";
// κατεβάζουμε τα εικονίδια του Leaflet από CDN
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function HomePage() {
  // φτιαχνω την μνημη selectedEvent για να κραταω το επιλεγμενο γεγονος απο το carousel
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Header Section */}
      <HeroSlider />

      {/* Map + Events */}
      <section id="explore" className="relative flex flex-col items-center py-12">
        <h2 className="text-3xl font-bold mb-6">Γνώρισε την πόλη</h2>
        <CityMap selectedEvent={selectedEvent} />
        <div className="w-full mt-8">
          <EventsCarousel events={events} onSelect={setSelectedEvent} />
        </div>
      </section>

      {/* Must Do Section */}
      <MustDoSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}