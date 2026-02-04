/* ═══════════════════════════════════════════════════════
   GPS0S - MODE DÉMO (GPS SIMULÉ)
   Permet de tester le jeu en intérieur sans bouger
   ═══════════════════════════════════════════════════════ */

const DemoMode = {
    active: false,
    currentPointIndex: 0,
    simulatedPosition: null,
    autoMoveInterval: null,
    speedMultiplier: 1, // Vitesse de déplacement (1 = réaliste, 5 = rapide)

    // Coordonnées GPS simulées (point de départ arbitraire)
    startPosition: {
        lat: 47.25865295634987,
        lon: -0.07232092747517298
    },

    /* ─────────────────────────────────────────────────────
       INITIALISATION
       ───────────────────────────────────────────────────── */
    init() {
        this.createDemoUI();
        this.setupEventListeners();
        console.log("🎮 Mode Démo initialisé (désactivé par défaut)");
    },

    /* ─────────────────────────────────────────────────────
       CRÉATION DE L'INTERFACE DÉVELOPPEUR
       ───────────────────────────────────────────────────── */
    createDemoUI() {
        const demoPanel = document.createElement('div');
        demoPanel.id = 'demo-controls';
        demoPanel.innerHTML = `
            <div class="demo-header">
                <span>🎮 MODE DÉMO</span>
                <button id="demo-toggle" class="demo-btn-off">OFF</button>
            </div>
            <div id="demo-actions" style="display: none;">
                <button id="demo-next-point" class="demo-btn">📍 Point Suivant</button>
                <button id="demo-teleport" class="demo-btn">⚡ Téléporter</button>
                <button id="demo-energy-boost" class="demo-btn">🔋 +50% Énergie</button>
                <button id="demo-add-points" class="demo-btn">💎 +100 Points</button>
                <div class="demo-speed">
                    <label>Vitesse : <span id="speed-value">1x</span></label>
                    <input type="range" id="demo-speed" min="1" max="10" value="1">
                </div>
            </div>
        `;
        document.body.appendChild(demoPanel);

        // Ajouter le style CSS
        this.injectStyles();
    },

    /* ─────────────────────────────────────────────────────
       STYLES DU PANNEAU DÉMO
       ───────────────────────────────────────────────────── */
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #demo-controls {
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(10, 10, 10, 0.95);
                border: 2px solid #00ffcc;
                border-radius: 10px;
                padding: 10px;
                z-index: 10000;
                font-family: 'Courier New', monospace;
                box-shadow: 0 0 20px rgba(0, 255, 204, 0.5);
                max-width: 200px;
            }

            .demo-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                color: #00ffcc;
                font-size: 0.9em;
                font-weight: bold;
            }

            .demo-btn, .demo-btn-off, .demo-btn-on {
                background: linear-gradient(135deg, #00ffcc, #00cc99);
                border: none;
                color: #000;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.8em;
                font-weight: bold;
                margin: 5px 0;
                width: 100%;
                font-family: inherit;
                transition: transform 0.1s;
            }

            .demo-btn:active {
                transform: scale(0.95);
            }

            .demo-btn-off {
                background: #555;
                color: #999;
            }

            .demo-btn-on {
                background: linear-gradient(135deg, #ff00ff, #ff0080);
                color: white;
                animation: demo-pulse 1s infinite;
            }

            @keyframes demo-pulse {
                0%, 100% { box-shadow: 0 0 10px rgba(255, 0, 255, 0.5); }
                50% { box-shadow: 0 0 20px rgba(255, 0, 255, 1); }
            }

            .demo-speed {
                margin-top: 10px;
                color: #00ffcc;
                font-size: 0.8em;
            }

            .demo-speed input {
                width: 100%;
                margin-top: 5px;
            }

            #demo-actions {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
        `;
        document.head.appendChild(style);
    },

    /* ─────────────────────────────────────────────────────
       ÉVÉNEMENTS
       ───────────────────────────────────────────────────── */
    setupEventListeners() {
        // Bouton ON/OFF
        document.getElementById('demo-toggle').addEventListener('click', () => {
            this.toggleDemoMode();
        });

        // Point suivant
        document.getElementById('demo-next-point').addEventListener('click', () => {
            this.moveToNextPoint();
        });

        // Téléportation instantanée
        document.getElementById('demo-teleport').addEventListener('click', () => {
            this.teleportToCurrentPoint();
        });

        // Boost d'énergie
        document.getElementById('demo-energy-boost').addEventListener('click', () => {
            GameState.addEnergy(50);
            Moon.speak("Énergie boostée ! T'as de la chance que ce soit un test... 🔋");
        });

        // Ajouter des points
        document.getElementById('demo-add-points').addEventListener('click', () => {
            GameState.addPoints(100);
            Moon.speak("100 points gratuits ! Profite-en, c'est du démo... 💎");
        });

        // Curseur de vitesse
        document.getElementById('demo-speed').addEventListener('input', (e) => {
            this.speedMultiplier = parseInt(e.target.value);
            document.getElementById('speed-value').textContent = `${this.speedMultiplier}x`;
        });
    },

    /* ─────────────────────────────────────────────────────
       ACTIVER/DÉSACTIVER LE MODE DÉMO
       ───────────────────────────────────────────────────── */
    toggleDemoMode() {
        this.active = !this.active;
        const toggleBtn = document.getElementById('demo-toggle');
        const actionsPanel = document.getElementById('demo-actions');

        if (this.active) {
            toggleBtn.textContent = 'ON';
            toggleBtn.className = 'demo-btn-on';
            actionsPanel.style.display = 'flex';
            
            // Position de départ = GPS actuel ou point 1
            this.simulatedPosition = this.startPosition;
            this.currentPointIndex = 0;
            
            Moon.speak("Mode Démo activé ! Je vais faire semblant de te croire... 🎮");
            console.log("🎮 Mode Démo ACTIVÉ");
        } else {
            toggleBtn.textContent = 'OFF';
            toggleBtn.className = 'demo-btn-off';
            actionsPanel.style.display = 'none';
            
            this.stopAutoMove();
            this.simulatedPosition = null;
            
            Moon.speak("Retour au monde réel... Oublie pas de marcher cette fois ! 🚶");
            console.log("🎮 Mode Démo DÉSACTIVÉ");
        }
    },

    /* ─────────────────────────────────────────────────────
       OBTENIR LA POSITION (RÉELLE OU SIMULÉE)
       ───────────────────────────────────────────────────── */
   /* ─────────────────────────────────────────────────────
   OBTENIR LA POSITION (RÉELLE OU SIMULÉE)
   ───────────────────────────────────────────────────── */
getCurrentPosition() {
    if (this.active && this.simulatedPosition) {
        return {
            coords: {
                latitude: this.simulatedPosition.lat,
                longitude: this.simulatedPosition.lon // ⚠️ Changé de "lng" à "lon"
            }
        };
    }
    return null; // Utiliser le GPS réel
},

    /* ─────────────────────────────────────────────────────
       SE DÉPLACER VERS LE PROCHAIN POINT
       ───────────────────────────────────────────────────── */
    moveToNextPoint() {
        if (this.currentPointIndex >= GPS_POINTS.length) {
            Moon.speak("T'as déjà fait tous les points ! Relance le jeu ! 🏁");
            return;
        }

        const targetPoint = GPS_POINTS[this.currentPointIndex];
        Moon.speak(`Direction le point ${this.currentPointIndex + 1}... En mode turbo ! 🚀`);

        this.startAutoMove(targetPoint);
    },

    /* ─────────────────────────────────────────────────────
       DÉPLACEMENT AUTOMATIQUE (SIMULATION)
       ───────────────────────────────────────────────────── */
   startAutoMove(targetPoint) {
    this.stopAutoMove();

    this.autoMoveInterval = setInterval(() => {
        // Calcul de la direction
        const deltaLat = targetPoint.lat - this.simulatedPosition.lat;
        const deltaLon = targetPoint.lon - this.simulatedPosition.lon; // ⚠️ Changé
        const distance = Math.sqrt(deltaLat**2 + deltaLon**2);

        // Arrivé au point ?
        if (distance < 0.00005) {
            this.stopAutoMove();
            Moon.speak(`Point ${this.currentPointIndex + 1} atteint ! Clique sur AR maintenant ! 📍`);
            return;
        }

        // Avancer vers le point (proportionnel à la vitesse)
        const step = 0.00001 * this.speedMultiplier;
        this.simulatedPosition.lat += (deltaLat / distance) * step;
        this.simulatedPosition.lon += (deltaLon / distance) * step; // ⚠️ Changé

        // Mettre à jour l'affichage GPS
        updateDistance(); // ⚠️ Appel direct de ta fonction

    }, 100);
},


    /* ─────────────────────────────────────────────────────
       ARRÊTER LE DÉPLACEMENT AUTO
       ───────────────────────────────────────────────────── */
    stopAutoMove() {
        if (this.autoMoveInterval) {
            clearInterval(this.autoMoveInterval);
            this.autoMoveInterval = null;
        }
    },

    /* ─────────────────────────────────────────────────────
       TÉLÉPORTATION INSTANTANÉE
       ───────────────────────────────────────────────────── */
    teleportToCurrentPoint() {
    if (this.currentPointIndex >= GPS_POINTS.length) {
        Moon.speak("Y'a plus de points ! T'es déjà au bout ! 🏁");
        return;
    }

    const targetPoint = GPS_POINTS[this.currentPointIndex];
    this.simulatedPosition = { 
        lat: targetPoint.lat, 
        lon: targetPoint.lon  // ⚠️ Changé de "lng" à "lon"
    };

    this.stopAutoMove();
    updateDistance(); // ⚠️ Appel direct de ta fonction
    
    Moon.speak(`POUF ! Téléporté au point ${this.currentPointIndex + 1} ! Magique non ? ✨`);
},

    /* ─────────────────────────────────────────────────────
       PASSER AU POINT SUIVANT (APRÈS VALIDATION AR)
       ───────────────────────────────────────────────────── */
    nextPoint() {
        this.currentPointIndex++;
        if (this.currentPointIndex < GPS_POINTS.length) {
            Moon.speak(`Prêt pour le point ${this.currentPointIndex + 1} ? Clique sur "Point Suivant" ! 🎯`);
        } else {
            Moon.speak("GG ! T'as validé tous les points en mode démo ! 🎉");
        }
    }
};

/* ═══════════════════════════════════════════════════════
   INITIALISATION AU CHARGEMENT
   ═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    DemoMode.init();
});
