import React, { useState } from "react";

export function MustDoSection() {
  const [tab, setTab] = useState("food");

  return (
    <section id="mustdo" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-8">You Must Do in Mytilene</h2>

        <div className="flex justify-center mb-8 space-x-4">
          {["food", "culture", "nature"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full border font-semibold ${
                tab === t ? "bg-cyan-500 text-white" : "bg-white text-gray-700"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
              <img src={`/images/${tab}${i}.jpg`} alt="" className="h-48 w-full object-cover" />
              <div className="p-4">
                <h4 className="font-semibold mb-2">{tab} activity {i}</h4>
                <p className="text-gray-600 text-sm">Περιγραφή δραστηριότητας {i}...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
