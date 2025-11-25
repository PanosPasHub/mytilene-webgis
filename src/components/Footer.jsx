import React from "react";
import { Link } from "react-router-dom"; // ✅ Προσθήκη αυτής της γραμμής

export function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300 py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Logo */}
         <Link to="/" className="flex justify-center">
            <img
            src="/images/logo.png"
            alt="Mytilene City"
            className="h-16 w-16 cursor-pointer hover:scale-105 transition-transform"
            />
          </Link>
        
        {/* Navigation Menu - Ενημερωμένο */}
        <nav className="flex flex-wrap justify-center gap-4">
          <Link 
            to="/" 
            className="hover:text-white transition text-sm md:text-base"
          >
            Αρχική
          </Link>
          <Link 
            to="/report" 
            className="hover:text-white transition text-sm md:text-base"
          >
            Αναφορά
          </Link>
          <Link 
            to="/analysis" 
            className="hover:text-white transition text-sm md:text-base"
          >
            Αποτέλεσμα Ανάλυσης
          </Link>
          <Link 
            to="/contact" 
            className="hover:text-white transition text-sm md:text-base"
          >
            Επικοινωνία
          </Link>
        </nav>
        
        {/* Description */}
        <p className="text-sm text-center px-2">
          Η ιστοσελίδα δημιουργήθηκε στο πλαίσιο της διπλωματικής μου εργασίας για το ΠΜΣ Γεωπληροφορικής, Πανεπιστημίου Αιγαίου.
        </p>
        
        {/* Copyright */}
        <p className="text-xs text-gray-500 text-center">
          © 2025 Πασινιός Παναγιώτης | email: panagiotispasinios@gmail.com
        </p>
      </div>
    </footer>
  );
}