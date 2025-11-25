import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronDown, FaTimes, FaBars } from "react-icons/fa";

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

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative w-full h-[90vh] overflow-hidden">
      <img
        src={images[index]}
        alt="Mytilene city"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
      />
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-between">
        {/* Logo + Menu */}
        <nav className="flex justify-between items-center p-6 text-white">
          <Link to="/">
            <img
            src="/images/logo.png"
            alt="Mytilene Logo"
            className="h-16 w-16 md:h-20 md:w-20 cursor-pointer hover:scale-105 transition-transform"
            />
          </Link>
          
          {/* Desktop Menu - Τελική Σειρά */}
          <ul className="hidden md:flex space-x-8 text-lg items-center">
            <li>
              <Link to="/" className="hover:text-cyan-300 transition-colors">
                Αρχική
              </Link>
            </li>
            <li>
              <Link 
                to="/report" 
                className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Αναφορά
              </Link>
            </li>
            <li>
              <Link 
                to="/analysis" 
                className="hover:text-cyan-300 transition-colors"
              >
                Αποτέλεσμα Ανάλυσης
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-cyan-300 transition-colors">
                Επικοινωνία
              </Link>
            </li>
          </ul>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-white text-xl hover:bg-white/20 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </nav>

        {/* Mobile Menu Dropdown - Τελική Σειρά */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl z-50 animate-fadeIn">
            <ul className="flex flex-col p-4">
              <li className="border-b border-gray-200/50">
                <Link 
                  to="/" 
                  className="block py-4 px-4 text-gray-800 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-all font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Αρχική
                </Link>
              </li>
              <li className="border-b border-gray-200/50">
                <Link 
                  to="/report" 
                  className="block py-4 px-4 text-gray-800 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-all font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Αναφορά
                </Link>
              </li>
              <li className="border-b border-gray-200/50">
                <Link 
                  to="/analysis" 
                  className="block py-4 px-4 text-gray-800 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-all font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Αποτέλεσμα Ανάλυσης
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="block py-4 px-4 text-gray-800 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-all font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Επικοινωνία
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Center Text */}
        <div className="flex flex-col items-center justify-center text-center text-white px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">Εξερεύνησε τη Μυτιλήνη</h2>
          <p className="text-lg md:text-xl mb-6 max-w-2xl">Ανακαλύψτε την ομορφιά, τον πολιτισμό και τη ζωή του νησιού</p>
          <a
            href="#explore"
            className="flex items-center gap-2 bg-white/90 text-gray-800 px-8 py-4 rounded-full font-semibold hover:bg-white hover:scale-105 transition-all shadow-lg"
          >
            Ξεκίνα την Εμπειρία
            <FaChevronDown />
          </a>
        </div>
      </div>
    </header>
  );
}