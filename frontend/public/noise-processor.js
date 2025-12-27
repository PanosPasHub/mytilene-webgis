class NoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Ρύθμιση για το πόσο συχνά στέλνουμε δεδομένα (κάθε πόσα frames)
    // 128 frames είναι το ελάχιστο (περίπου 3ms).
    // Θα μαζεύουμε λίγα δεδομένα για να μην "μπουκώνουμε" το main thread.
    this._volume = 0;
    this._bufferSize = 2048; // Επεξεργασία ανά πακέτα για ακρίβεια
    this._bufferIndex = 0;
    this._sum = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    // Αν δεν υπάρχει input, επιστρέφουμε
    if (input.length > 0) {
      const samples = input[0];

      // Υπολογισμός τετραγώνων για RMS (Root Mean Square)
      for (let i = 0; i < samples.length; ++i) {
        this._sum += samples[i] * samples[i];
        this._bufferIndex++;
      }

      // Όταν γεμίσει το buffer μας (π.χ. 2048 δείγματα), στέλνουμε το αποτέλεσμα
      if (this._bufferIndex >= this._bufferSize) {
        const rms = Math.sqrt(this._sum / this._bufferSize);
        
        // Στέλνουμε το RMS στο React component
        this.port.postMessage({ volume: rms });

        // Reset για το επόμενο πακέτο
        this._sum = 0;
        this._bufferIndex = 0;
      }
    }

    return true; // Keep alive
  }
}

registerProcessor('noise-processor', NoiseProcessor);