import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Χρησιμοποιώ lucide-react για συνέπεια με το Header, αλλά αν δεν το έχεις πες μου να βάλω react-icons
import { Menu, X, ChevronDown } from "lucide-react"; 

const images = [
  "/images/mytilene1.jpg",
  "/images/mytilene2.jpg",
  "/images/mytilene3.jpg",
  "/images/mytilene4.jpg",
  "/images/mytilene5.jpg",
  "/images/mytilene6.jpg",
  "/images/mytilene7.jpg",
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative w-full h-[90vh] overflow-hidden font-sans">
      <img
        src={images[index]}
        alt="Mytilene city"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
      />
      
      {/* Dark Overlay & Content Wrapper */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-between">
        
        {/* Navigation - Ακριβές αντίγραφο του Header layout για τέλεια στοίχιση */}
        <nav className="p-6 w-full flex justify-between items-center text-white relative z-20">
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/images/logo.png"
                alt="Mytilene Logo"
                className="h-16 w-16 md:h-20 md:w-20 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </Link>
          
          {/* Desktop Menu - ΙΔΙΟ ΣΤΥΛ ΜΕ HEADER (Χωρίς μπλε κουτιά) */}
          <ul className="hidden md:flex space-x-8 items-center">
            {[
              { path: "/", label: "Αρχική" },
              { path: "/report", label: "Αναφορά" }, // Αφαίρεση του bg-cyan-500
              { path: "/analysis", label: "Ανάλυση" }, // Αλλαγή σε "Ανάλυση" για να ταιριάζει με το Header
              { path: "/contact", label: "Επικοινωνία" }
            ].map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className="relative text-lg font-medium text-gray-200 hover:text-white hover:scale-105 transition-all duration-300 flex items-center gap-2 drop-shadow-md"
                >
                  {link.label}
                  {/* Προσθήκη ελαφριάς λάμψης στο hover για να μοιάζει με το active state του Header */}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-24 left-4 right-4 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl z-50 animate-fadeIn border border-cyan-500/30">
            <ul className="flex flex-col p-6 space-y-4">
              {[
                { path: "/", label: "Αρχική" },
                { path: "/report", label: "Αναφορά" },
                { path: "/analysis", label: "Ανάλυση" },
                { path: "/contact", label: "Επικοινωνία" }
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="block py-3 px-4 rounded-xl transition-all duration-200 font-medium text-lg text-gray-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-cyan-500/30"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Center Text */}
        <div className="flex flex-col items-center justify-center text-center text-white px-4 mb-20 relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-2xl">Εξερεύνησε τη Μυτιλήνη</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl drop-shadow-lg font-light">Ανακαλύψτε την ομορφιά, τον πολιτισμό και τη ζωή του νησιού</p>
          <a
            href="#explore"
            className="flex items-center gap-2 bg-white/90 text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            Ξεκίνα την Εμπειρία
            <ChevronDown className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}