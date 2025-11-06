import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReportPage from "./pages/ReportPage"; // ✅ Προσθήκη
import ContactPage from "./pages/ContactPage"; // ✅ Προσθήκη

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Report Page - ΠΡΟΣΘΗΚΗ */}
        <Route path="/report" element={<ReportPage />} />
        
        {/* Contact Page - ΠΡΟΣΘΗΚΗ */}
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
  );
}

export default App;