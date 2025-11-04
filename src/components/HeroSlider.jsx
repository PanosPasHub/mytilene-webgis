import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

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
           <img 
            src="/images/logo.jpg" 
            alt="Mytilene Logo" 
            className="h-20 w-auto" 
          />
          <ul className="hidden md:flex space-x-6 text-lg">
            <li><a href="#explore" className="hover:text-cyan-300">Αρχική</a></li>
            <li><a href="#events" className="hover:text-cyan-300">Εκδηλώσεις</a></li>
            <li><a href="#mustdo" className="hover:text-cyan-300">Must Do</a></li>
            <li><a href="#contact" className="hover:text-cyan-300">Επικοινωνία</a></li>
          </ul>
          {/* Mobile Menu Placeholder */}
          <button className="md:hidden border p-2 rounded text-white">☰</button>
        </nav>

        {/* Center Text */}
        <div className="flex flex-col items-center justify-center text-center text-white">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">Εξερεύνησε τη Μυτιλήνη</h2>
          <p className="text-lg md:text-xl mb-6">Discover the beauty, culture and life of the island.</p>
          <a
            href="#explore"
            className="flex items-center gap-2 bg-white/80 text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-white transition"
          >
            Ξεκίνα
            <FaChevronDown />
          </a>
        </div>
      </div>
    </header>
  );
}
