import React from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider */}
      <Header />

      {/* Κύριο Περιεχόμενο */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Επικοινωνία
            </h1>
            <p className="text-lg text-gray-600">
              Επικοινωνήστε μαζί μας
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                🔧 Σε Ανάπτυξη
              </h2>
              <p className="text-gray-600 mb-6">
                Η σελίδα επικοινωνίας βρίσκεται υπό ανάπτυξη και θα είναι διαθέσιμη σύντομα.
              </p>
              <div className="space-y-3 text-left">
                <p className="text-gray-700">
                  <strong>Email:</strong> panagiotispasinios@gmail.com
                </p>
                <p className="text-gray-700">
                  <strong>Τηλέφωνο:</strong> Προσθήκη σύντομα
                </p>
                <p className="text-gray-700">
                  <strong>Διεύθυνση:</strong> Προσθήκη σύντομα
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}