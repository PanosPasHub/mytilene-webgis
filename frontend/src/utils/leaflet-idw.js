/* eslint-disable */
import L from 'leaflet';

export function setupIDW() {
    if (typeof window === "undefined") return;
    
    const Leaflet = L || window.L;
    if (!Leaflet) return;

    if (Leaflet.IdwLayer) return;

    Leaflet.IdwLayer = Leaflet.Layer.extend({
        options: {
            opacity: 0.5,
            cellSize: 3, // ΜΕΙΩΣΗ: Από 10 σε 3 για πολύ υψηλότερη ανάλυση (πιο "λείο" αποτέλεσμα)
            exp: 2,
            max: 100,
            maxDistance: 0.0015,
            gradient: {
                0.0: '#00ff00', 0.5: '#ffff00', 1.0: '#ff0000'
            }
        },

        initialize: function (latlngs, options) {
            this._latlngs = latlngs;
            Leaflet.setOptions(this, options);
        },

        setLatLngs: function (latlngs) {
            this._latlngs = latlngs;
            this.redraw();
        },

        onAdd: function (map) {
            this._map = map;
            this._canvas = Leaflet.DomUtil.create("canvas", "leaflet-idw-layer");
            this._canvas.style.pointerEvents = 'none';
            
            const size = this._map.getSize();
            this._canvas.width = size.x;
            this._canvas.height = size.y;

            const pane = map.getPanes().overlayPane;
            pane.appendChild(this._canvas);

            map.on("moveend", this.redraw, this);
            map.on("resize", this._resize, this);
            map.on("zoomend", this.redraw, this);

            this.redraw();
        },

        onRemove: function (map) {
            if (this._canvas.parentNode) {
                this._canvas.parentNode.removeChild(this._canvas);
            }
            map.off("moveend", this.redraw, this);
            map.off("resize", this._resize, this);
            map.off("zoomend", this.redraw, this);
        },

        _resize: function (e) {
            const size = e.newSize;
            this._canvas.width = size.x;
            this._canvas.height = size.y;
            this.redraw();
        },

        redraw: function () {
            if (!this._map || !this._latlngs || this._latlngs.length === 0) return;

            const size = this._map.getSize();
            const bounds = this._map.getBounds();

            if (this._canvas.width !== size.x || this._canvas.height !== size.y) {
                this._canvas.width = size.x;
                this._canvas.height = size.y;
            }

            const topLeft = this._map.containerPointToLayerPoint([0, 0]);
            Leaflet.DomUtil.setPosition(this._canvas, topLeft);

            const ctx = this._canvas.getContext("2d");
            ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

            const cellSize = this.options.cellSize;
            const exp = this.options.exp;
            const maxVal = this.options.max;
            const minVal = this.options.minValue || 0;
            const maxDist = this.options.maxDistance;

            // Gradient Cache
            if (!this._gradArray) {
                const gradCanvas = document.createElement('canvas');
                const gCtx = gradCanvas.getContext('2d');
                const grad = gCtx.createLinearGradient(0, 0, 0, 256);
                gradCanvas.width = 1; gradCanvas.height = 256;
                const gradient = this.options.gradient;
                Object.keys(gradient).sort((a,b)=>a-b).forEach(k => grad.addColorStop(k, gradient[k]));
                gCtx.fillStyle = grad; gCtx.fillRect(0, 0, 1, 256);
                this._gradArray = gCtx.getImageData(0, 0, 1, 256).data;
            }

            for (let x = 0; x < size.x; x += cellSize) {
                for (let y = 0; y < size.y; y += cellSize) {
                    const latlng = this._map.containerPointToLatLng([x + cellSize/2, y + cellSize/2]);

                    if (!bounds.contains(latlng)) continue;

                    let sum = 0;
                    let wsum = 0;
                    let maxLocalValue = 0; // Κρατάμε τη μέγιστη τιμή που βρήκαμε κοντά

                    for (let i = 0; i < this._latlngs.length; i++) {
                        const p = this._latlngs[i];
                        const d = Math.pow(latlng.lat - p[0], 2) + Math.pow(latlng.lng - p[1], 2);

                        if (d < 0.0000001) {
                            sum = p[2];
                            wsum = Infinity;
                            break;
                        }

                        if (maxDist && d > maxDist * maxDist) continue;

                        // --- DOMINANCE LOGIC ---
                        // Αν το σημείο έχει πολύ δυνατό ήχο (π.χ. > 75dB), αυξάνουμε "τεχνητά" το βάρος του (weight).
                        // Αυτό κάνει τον δυνατό ήχο να "κερδίζει" τον χαμηλό.
                        let boost = 1;
                        if (p[2] > 75) boost = 4; // Τα δυνατά σημεία μετράνε x4
                        else if (p[2] > 60) boost = 2;

                        const w = (1 / Math.pow(d, exp/2)) * boost;
                        
                        sum += w * p[2];
                        wsum += w;

                        // Καταγράφουμε αν υπάρχει πολύ δυνατό σημείο κοντά
                        if (p[2] > maxLocalValue) maxLocalValue = p[2];
                    }

                    if (wsum === 0) continue;

                    let val = (wsum === Infinity) ? sum : (sum / wsum);

                    // --- HYBRID APPROACH ---
                    // Αν ο υπολογισμός (μέσος όρος) ρίξει την τιμή πολύ χαμηλά ενώ υπάρχει δυνατό σημείο κοντά,
                    // τραβάμε την τιμή προς τα πάνω.
                    // Π.χ. Αν έχω 90dB και 40dB, το IDW βγάζει ~65. Εμείς θέλουμε ~80+.
                    // Παίρνουμε το μέγιστο μεταξύ του IDW και του (MaxLocal * 0.9).
                    if (wsum !== Infinity) {
                        val = Math.max(val, maxLocalValue * 0.85); 
                    }

                    if (val > 0) {
                        const norm = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
                        const idx = Math.floor(norm * 255) * 4;
                        
                        if (this._gradArray[idx+3] > 0) {
                             const r = this._gradArray[idx];
                             const g = this._gradArray[idx+1];
                             const b = this._gradArray[idx+2];
                             const a = this.options.opacity;

                             ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
                             ctx.fillRect(x, y, cellSize, cellSize);
                        }
                    }
                }
            }
        }
    });

    Leaflet.idwLayer = function (latlngs, options) {
        return new Leaflet.IdwLayer(latlngs, options);
    };
}