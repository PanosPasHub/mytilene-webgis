import React, { useState } from "react";

export function MustDoSection() {
  // Ορίζουμε "Πολιτισμός" ως default tab
  const [tab, setTab] = useState("culture");

  // Mock δεδομένα για κάθε κατηγορία
  const activitiesData = {
    food: [
      {
        id: 1,
        title: "Γεύση Παραδοσιακού Ούζου",
        description: "Δοκιμάστε το αυθεντικό ούζο της Λέσβου σε παραδοσιακούς μεζέδες.",
        image: "/images/food1.jpg"
      },
      {
        id: 2,
        title: "Τοπικά Εδέσματα",
        description: "Γνωρίστε τη γαστρονομία του νησιού μέσα από τα τοπικά προϊόντα.",
        image: "/images/food2.jpg"
      },
      {
        id: 3,
        title: "Θαλασσινά Σπεσιαλίτε",
        description: "Φρέσκα θαλασσινά από το Αιγαίο σε παραλιακούς καταλύματα.",
        image: "/images/food3.jpg"
      }
    ],
    culture: [
      {
        id: 1,
        title: "Επισκεφθείτε το Κάστρο",
        description: "Το μεσαιωνικό κάστρο της Μυτιλήνης με θέα ολόκληρο το λιμάνι.",
        image: "/images/culture1.jpg"
      },
      {
        id: 2,
        title: "Βαλιδέ Τζαμί",
        description: "Το Βαλιντέ Τζαμί αποτελεί αρχιτεκτονικό διαμάντι, που ενσωματώνει οθωμανική τέχνη με ντόπια παραδοσιακή δόμηση. Μοναδικός συνδυασμός θόλου, γλυπτών και τοπικών υλικών.",
        image: "/images/culture2.jpg"
      },
      {
        id: 3,
        title: "Αρχαιολογικό Μουσείο",
        description: "Ανακαλύψτε την αρχαία ιστορία της Λέσβου μέσα από τα εκθέματα.",
        image: "/images/culture3.jpg"
      }
    ],
    nature: [
      {
        id: 1,
        title: "Παραλία Τσαμάκια",
        description: "Μία από τις πιο ομορφες παραλίες με κρυστάλλινα νερά και βότσαλο. Οργανωμένη με ξαπλώστρες, ομπρέλες, beach bar και εστιατόριο, εξασφαλίζει μια αξέχαστη ημέρα στη θάλασσα.",
        image: "/images/nature1.jpg"
      },
      {
        id: 2,
        title: "Αλσος Τσαμάκια",
        description: "Πυκνό αλσύλλιο με πεύκα, ιδανικό για πεζοπορίες και πικνίκ. Φυσικό καταφύγιο λίγα λεπτά από το κέντρο.",
        image: "/images/nature2.jpg"
      },
      {
        id: 3,
        title: "Ελαιώνες Μυτιλήνης",
        description: "Παραδοσιακοί ελαιώνες που δίνουν το αρомаτικό παρθένο ελαιόλαδο της Λέσβου, γνωστό για την εξαιρετική ποιότητα και γεύση του.",
        image: "/images/nature3.jpg"
      }
    ]
  };

  // Μεταφρασμένα tabs
  const tabs = [
    { id: "food", label: "Φαγητό" },
    { id: "culture", label: "Πολιτισμός" },
    { id: "nature", label: "Φύση" }
  ];

  return (
    <section id="mustdo" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-8">Πράγματα Που Πρέπει να Κάνεις</h2>

        {/* Tabs */}
        <div className="flex justify-center mb-8 space-x-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-6 py-3 rounded-full border-2 font-semibold transition-all ${
                tab === t.id 
                  ? "bg-cyan-500 text-white border-cyan-500" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-cyan-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Activities Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {activitiesData[tab].map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src={activity.image} 
                alt={activity.title} 
                className="h-48 w-full object-cover"
              />
              <div className="p-6">
                <h4 className="font-bold text-lg mb-3 text-gray-800">{activity.title}</h4>
                <p className="text-gray-600 leading-relaxed">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
