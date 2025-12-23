const express = require('express');
const cors = require('cors');
// Φόρτωση μεταβλητών περιβάλλοντος
require('dotenv').config();

// Import των Routes (που περιέχουν τη λογική)
const noiseRoutes = require('./routes/noiseRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors()); // Επιτρέπει κλήσεις από το React (localhost:3000)
app.use(express.json()); // Για να διαβάζει JSON body στα requests

// --- Routes Middleware ---
// Όλες οι κλήσεις που ξεκινάνε με /api/noise κατευθύνονται στο noiseRoutes
app.use('/api/noise', noiseRoutes);

// Global Health Check (Για γρήγορο έλεγχο ότι ο server τρέχει)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'UP', 
    system: 'Mytilene Noise Watch Backend', 
    timestamp: new Date() 
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 API Routes mounted at /api/noise`);
});