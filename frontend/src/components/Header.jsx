import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    // Αφαιρέθηκε το h-24 και έμεινε το p-6 για να ταιριάζει ακριβώς με το HeroSlider
    <nav className="bg-gradient-to-r from-slate-900 via-cyan-900 to-slate-900 text-white shadow-lg border-b border-cyan-500/30 relative z-50 sticky top-0 font-sans p-6">
      <div className="w-full flex justify-between items-center">
        
        {/* Logo Section */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
          <div className="relative">
            <img
              src="/images/logo.png"
              alt="Mytilene Logo"
              className="h-16 w-16 md:h-20 md:w-20 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <span className="font-bold text-xl md:text-2xl tracking-wide hidden sm:block text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 group-hover:to-cyan-400 transition-all">
            Mytilene Noise Analysis
          </span>
        </Link>

        {/* Desktop Menu - space-x-8 ακριβώς όπως στο HeroSlider */}
        <ul className="hidden md:flex space-x-8 items-center">
          {[
            { path: "/", label: "Αρχική" },
            { path: "/report", label: "Αναφορά" },
            { path: "/analysis", label: "Ανάλυση" }, // Χρήση "Ανάλυση" παντού για ίδια στοίχιση
            { path: "/contact", label: "Επικοινωνία" }
          ].map((link) => {
            const isActive = currentPath === link.path;
            return (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className={`
                    relative text-lg font-medium transition-all duration-300 flex items-center gap-2
                    ${isActive 
                      ? "text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" 
                      : "text-gray-200 hover:text-white hover:scale-105"
                    }
                  `}
                >
                  {link.label}
                  
                  {/* Highlight Effect */}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-cyan-100 hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`
          md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-cyan-900/50 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out z-40
          ${isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <ul className="flex flex-col p-6 space-y-4">
          {[
            { path: "/", label: "Αρχική" },
            { path: "/report", label: "Αναφορά" },
            { path: "/analysis", label: "Ανάλυση" },
            { path: "/contact", label: "Επικοινωνία" }
          ].map((link) => {
             const isActive = currentPath === link.path;
             return (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className={`
                    block py-3 px-4 rounded-xl transition-all duration-200 font-medium text-lg
                    ${isActive 
                      ? "bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]" 
                      : "text-gray-300 hover:bg-white/5 hover:text-white"}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
             );
          })}
        </ul>
      </div>
    </nav>
  );
}