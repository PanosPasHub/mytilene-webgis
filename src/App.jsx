import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Αν θέλεις, μπορείς να προσθέσεις αργότερα κι άλλες σελίδες */}
        {/* <Route path="/map" element={<MapPage />} /> */}
        {/* <Route path="/report" element={<ReportPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
