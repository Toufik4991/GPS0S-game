c// ═══════════════════════════════════════════════════════
// GPS0S - GESTION DE LA BOUSSOLE
// ═══════════════════════════════════════════════════════

let compassActive = false; // État de la boussole
let compassInterval = null; // Timer de consommation d'énergie
let compassBearing = 0; // Direction vers le point GPS
let deviceHeading = 0; // Orientation du téléphone

// Timer pour l'aide automatique
let autoHelpTimer = null;
let autoHelpActive = false;

// ───────────────────────────────────────────────────────
// FONCTION : Initialiser la boussole
// ───────────────────────────────────────────────────────
function initCompass() {
    const compassBtn = document.getElementById('compass-btn');

    if (!compassBtn) {
        console.error("❌ Bouton 'compass-btn' introuvable !");
        return;
    }

    compassBtn.addEventListener('click', toggleCompass);

    // ✅ Listener d'orientation (UNE SEULE FOIS)
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (event) => {
            deviceHeading = event.alpha || 0; // Orientation du téléphone (0-360°)
            if (compassActive || autoHelpActive) {
                updateCompassArrowRotation();
            }
        });
        console.log("📱 Capteur d'orientation activé");
    } else {
        console.warn("⚠️ DeviceOrientation non supporté sur cet appareil");
    }

    // Démarrer le timer d'aide automatique (3 minutes)
    startAutoHelpTimer();

    console.log("🧭 Boussole initialisée");
}

// ───────────────────────────────────────────────────────
// FONCTION : Activer/Désactiver la boussole
// ───────────────────────────────────────────────────────
function toggleCompass() {
    if (autoHelpActive) {
        if (typeof showMoonMessage === 'function') {
            showMoonMessage("🌙 Aide gratuite en cours, profites-en !", 2000);
        }
        return;
    }

    // Vérifier l'énergie
    const energy = (typeof getCurrentEnergy === 'function') ? getCurrentEnergy() : 0;
    if (energy <= 0) {
        if (typeof showMoonMessage === 'function') {
            showMoonMessage("🌙 Plus d'énergie ! Va jouer aux mini-jeux, feignasse !", 3000);
        }
        return;
    }

    if (compassActive) {
        deactivateCompass();
    } else {
        activateCompass();
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Activer la boussole
// ───────────────────────────────────────────────────────
function activateCompass() {
    compassActive = true;

    const compassBtn = document.getElementById('compass-btn');
    const compassArrow = document.getElementById('compass-arrow');

    if (compassBtn) {
        compassBtn.textContent = '🧭 Désactiver';
        compassBtn.style.background = 'linear-gradient(135deg, #ff0044, #cc0033)';
    }

    if (compassArrow) {
        compassArrow.style.display = 'block';
    }

    // ✅ Démarrer la consommation d'énergie (-1% toutes les 3s)
    if (typeof startEnergyConsumption === 'function') {
        startEnergyConsumption();
    }

    console.log("🧭 Boussole activée (consommation : -1% / 3s)");
}

// ───────────────────────────────────────────────────────
// FONCTION : Désactiver la boussole
// ───────────────────────────────────────────────────────
function deactivateCompass() {
    compassActive = false;

    const compassBtn = document.getElementById('compass-btn');
    const compassArrow = document.getElementById('compass-arrow');

    if (compassBtn) {
        compassBtn.textContent = '🧭 Activer Boussole';
        compassBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
    }

    if (compassArrow) {
        compassArrow.style.display = 'none';
    }

    // ✅ Arrêter la consommation
    if (typeof stopEnergyConsumption === 'function') {
        stopEnergyConsumption();
    }

    console.log("🧭 Boussole désactivée");
}

// ───────────────────────────────────────────────────────
// FONCTION : Mettre à jour l'orientation de la boussole
// ───────────────────────────────────────────────────────
function updateCompassBearing(userLat, userLon, targetLat, targetLon) {
    // Calculer l'angle entre l'utilisateur et le point GPS
    const dLon = (targetLon - userLon) * Math.PI / 180;
    const lat1 = userLat * Math.PI / 180;
    const lat2 = targetLat * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360; // Normaliser entre 0-360°

    compassBearing = bearing;

    // Mettre à jour l'affichage
    if (compassActive || autoHelpActive) {
        updateCompassArrowRotation();
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Mettre à jour la rotation de la flèche
// ───────────────────────────────────────────────────────
function updateCompassArrowRotation() {
    const arrow = document.querySelector('#compass-arrow .arrow');
    if (!arrow) return;

    // Rotation = Direction GPS - Orientation téléphone
    const rotation = compassBearing - deviceHeading;
    arrow.style.transform = `rotate(${rotation}deg)`;
}

// ───────────────────────────────────────────────────────
// FONCTION : Adapter la boussole selon la zone
// ───────────────────────────────────────────────────────
function adaptCompassToZone(zone) {
    const arrow = document.querySelector('#compass-arrow .arrow');
    if (!arrow) return;

    switch(zone) {
        case 'red': // >100m : Stable
            arrow.style.animation = 'none';
            break;

        case 'orange': // 30-99m : Instable
            arrow.style.animation = 'shake 0.5s infinite';
            if (typeof showMoonMessage === 'function') {
                showMoonMessage("🌙 Tu t'approches... La boussole tremble !", 2000);
            }
            break;

        case 'green': // 6-29m : Folle (reste active)
            arrow.style.animation = 'spin 0.3s infinite linear';
            if (typeof showMoonMessage === 'function') {
                showMoonMessage("🌙 Trop proche ! La boussole devient folle !", 2000);
            }
            break;

        case 'blue': // ≤5m : SUPER FOLLE (reste active)
            arrow.style.animation = 'spin 0.1s infinite linear, shake 0.2s infinite';
            if (typeof showMoonMessage === 'function') {
                showMoonMessage("🌙 C'EST ICI ! Ouvre l'AR maintenant !", 3000);
            }
            break;
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Aide automatique toutes les 3 minutes
// ───────────────────────────────────────────────────────
function startAutoHelpTimer() {
    autoHelpTimer = setInterval(() => {
        if (!compassActive) {
            triggerAutoHelp();
        }
    }, 180000); // 3 minutes = 180 000 ms

    console.log("⏰ Timer d'aide automatique démarré (3 min)");
}

function triggerAutoHelp() {
    autoHelpActive = true;

    const compassBtn = document.getElementById('compass-btn');
    const compassArrow = document.getElementById('compass-arrow');

    if (compassBtn) {
        compassBtn.textContent = '🎁 Aide Gratuite !';
        compassBtn.style.background = 'linear-gradient(135deg, #ffaa00, #ff8800)';
        compassBtn.disabled = true;
    }

    if (compassArrow) {
        compassArrow.style.display = 'block';
    }

    if (typeof showMoonMessage === 'function') {
        showMoonMessage("🌙 Cadeau ! 10 secondes de boussole gratuite. Cours !", 3000);
    }

    // Désactiver après 10 secondes
    setTimeout(() => {
        autoHelpActive = false;

        if (compassBtn) {
            compassBtn.disabled = false;

            if (!compassActive) {
                compassBtn.textContent = '🧭 Activer Boussole';
                compassBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
            }
        }

        if (compassArrow && !compassActive) {
            compassArrow.style.display = 'none';
        }

        if (typeof showMoonMessage === 'function') {
            showMoonMessage("🌙 Fini ! Maintenant tu payes.", 2000);
        }
    }, 10000);

    console.log("🎁 Aide automatique activée (10s)");
}
