/* ═══════════════════════════════════════════════════════
   🧭 GPS0S - GESTION DE LA BOUSSOLE
   Fonction : Orientation GPS + Consommation d'énergie
   ═══════════════════════════════════════════════════════ */

console.log("🧭 Module Boussole chargé");

// ════════════════════════════════════════════════════════════
// 🔧 VARIABLES GLOBALES BOUSSOLE
// ════════════════════════════════════════════════════════════
let compassActive = false;      // État de la boussole
let compassBearing = 0;          // Direction vers le point GPS (0-360°)
let deviceHeading = 0;           // Orientation du téléphone (0-360°)
let compassInterval = null;      // Timer de consommation d'énergie
let autoHelpTimer = null;        // Timer d'aide automatique (3 min)
let autoHelpActive = false;      // État de l'aide gratuite
let currentZone = 'red';         // Zone GPS actuelle

// ════════════════════════════════════════════════════════════
// 🚀 INITIALISATION DE LA BOUSSOLE
// ════════════════════════════════════════════════════════════
function initCompass() {
    console.log("🧭 Initialisation de la boussole...");

    const compassBtn = document.getElementById('compass-btn');
    if (!compassBtn) {
        console.error("❌ Bouton 'compass-btn' introuvable !");
        return;
    }

    // Événement du bouton
    compassBtn.addEventListener('click', toggleCompass);

    // Capteur d'orientation du téléphone
    if (window.DeviceOrientationEvent) {
        // iOS nécessite une demande de permission
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            console.log("📱 iOS détecté - Permission requise");
        } else {
            activateOrientationListener();
        }
    } else {
        console.warn("⚠️ DeviceOrientation non supporté");
        alert("⚠️ Ton appareil ne supporte pas la boussole !");
    }

    // Démarrer le timer d'aide automatique
    startAutoHelpTimer();

    console.log("✅ Boussole initialisée");
}

// ════════════════════════════════════════════════════════════
// 📱 ACTIVER LE LISTENER D'ORIENTATION
// ════════════════════════════════════════════════════════════
function activateOrientationListener() {
    window.addEventListener('deviceorientation', handleOrientation);
    console.log("✅ Capteur d'orientation activé");
}

function handleOrientation(event) {
    // Alpha = orientation du téléphone (0-360°)
    deviceHeading = event.alpha || 0;

    // Si iOS, utiliser webkitCompassHeading
    if (event.webkitCompassHeading) {
        deviceHeading = event.webkitCompassHeading;
    }

    // Mise à jour en temps réel si boussole active
    if (compassActive || autoHelpActive) {
        updateCompassArrow();
    }
}

// ════════════════════════════════════════════════════════════
// 🎮 ACTIVER/DÉSACTIVER LA BOUSSOLE
// ════════════════════════════════════════════════════════════
function toggleCompass() {
    // Demander permission iOS si nécessaire
    if (typeof DeviceOrientationEvent.requestPermission === 'function' && !compassActive) {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    activateOrientationListener();
                    startCompass();
                } else {
                    alert("⚠️ Permission refusée pour la boussole");
                }
            })
            .catch(console.error);
        return;
    }

    if (compassActive) {
        stopCompass();
    } else {
        startCompass();
    }
}

// ════════════════════════════════════════════════════════════
// ▶️ DÉMARRER LA BOUSSOLE
// ════════════════════════════════════════════════════════════
function startCompass() {
    // Vérifier si l'énergie est suffisante
    if (typeof getEnergy === 'function' && getEnergy() <= 0) {
        alert("⚠️ Plus d'énergie ! Joue à un mini-jeu pour recharger.");
        if (typeof showMoonDialog === 'function') {
            showMoonDialog("🌙 Ta batterie est à plat ! Va jouer, feignasse !");
        }
        return;
    }

    compassActive = true;

    // Mise à jour du bouton
    const compassBtn = document.getElementById('compass-btn');
    if (compassBtn) {
        compassBtn.textContent = '🧭 Désactiver';
        compassBtn.classList.add('active');
        compassBtn.style.background = 'linear-gradient(135deg, #ff0044, #cc0033)';
    }

    // Afficher la boussole
    const compassArrow = document.getElementById('compass-arrow');
    if (compassArrow) {
        compassArrow.style.display = 'flex';
    }

    // Démarrer la consommation d'énergie (-1% toutes les 3s)
    compassInterval = setInterval(() => {
        if (typeof consumeEnergy === 'function') {
            consumeEnergy(1);
        }

        // Arrêter si énergie = 0
        if (typeof getEnergy === 'function' && getEnergy() <= 0) {
            stopCompass();
            if (typeof showMoonDialog === 'function') {
                showMoonDialog("🌙 Fin de l'énergie ! Maintenant tu marches à l'aveugle.");
            }
        }
    }, 3000);

    // Sons
    playSound('compass-on');
    if (typeof playMusic === 'function') {
        playMusic('compass');
    }

    console.log("🧭 Boussole activée (consommation : -1% / 3s)");
}

// ════════════════════════════════════════════════════════════
// ⏸️ ARRÊTER LA BOUSSOLE
// ════════════════════════════════════════════════════════════
function stopCompass() {
    compassActive = false;

    // Mise à jour du bouton
    const compassBtn = document.getElementById('compass-btn');
    if (compassBtn) {
        compassBtn.textContent = '🧭 Activer Boussole';
        compassBtn.classList.remove('active');
        compassBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
    }

    // Masquer la boussole
    const compassArrow = document.getElementById('compass-arrow');
    if (compassArrow) {
        compassArrow.style.display = 'none';
    }

    // Arrêter la consommation
    if (compassInterval) {
        clearInterval(compassInterval);
        compassInterval = null;
    }

    // Sons
    playSound('compass-off');
    if (typeof playMusic === 'function') {
        playMusic('main');
    }

    console.log("🧭 Boussole désactivée");
}

// ════════════════════════════════════════════════════════════
// 📐 CALCULER LA DIRECTION VERS LE POINT GPS
// ════════════════════════════════════════════════════════════
function updateCompassDirection(userPos, targetPoint) {
    if (!userPos || !targetPoint) return;

    // Formule du relèvement (bearing)
    const lat1 = toRadians(userPos.lat);
    const lat2 = toRadians(targetPoint.lat);
    const dLon = toRadians(targetPoint.lng - userPos.lng);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360; // Normaliser 0-360°

    compassBearing = bearing;

    // Mise à jour visuelle
    if (compassActive || autoHelpActive) {
        updateCompassArrow();
    }
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// ════════════════════════════════════════════════════════════
// 🎨 METTRE À JOUR LA FLÈCHE VISUELLE
// ════════════════════════════════════════════════════════════
function updateCompassArrow() {
    const arrow = document.querySelector('#compass-arrow .arrow');
    if (!arrow) return;

    // Rotation = Direction GPS - Orientation téléphone
    let rotation = compassBearing - deviceHeading;
    
    // Normaliser entre -180 et 180
    rotation = ((rotation + 180) % 360) - 180;

    arrow.style.transform = `rotate(${rotation}deg)`;
}

// ════════════════════════════════════════════════════════════
// 🎨 ADAPTER LA BOUSSOLE SELON LA ZONE GPS
// ════════════════════════════════════════════════════════════
function adaptCompassToZone(zone) {
    currentZone = zone;

    const arrow = document.querySelector('#compass-arrow .arrow');
    const compassContainer = document.getElementById('compass-arrow');
    
    if (!arrow || !compassContainer) return;

    // Retirer toutes les animations
    arrow.style.animation = 'none';
    compassContainer.classList.remove('zone-red', 'zone-orange', 'zone-green', 'zone-blue');

    switch(zone) {
        case 'red': // >100m : Stable
            compassContainer.classList.add('zone-red');
            break;

        case 'orange': // 30-99m : Légèrement instable
            compassContainer.classList.add('zone-orange');
            arrow.style.animation = 'shake 0.5s infinite';
            if (typeof showMoonDialog === 'function') {
                showMoonDialog("🌙 Tu t'approches... Je sens ton souffle !", 2000);
            }
            break;

        case 'green': // 6-29m : Très instable
            compassContainer.classList.add('zone-green');
            arrow.style.animation = 'spin 0.3s infinite linear, shake 0.3s infinite';
            if (typeof showMoonDialog === 'function') {
                showMoonDialog("🌙 Trop proche ! La boussole pète un câble !", 2000);
            }
            break;

        case 'blue': // ≤5m : SUPER FOLLE
            compassContainer.classList.add('zone-blue');
            arrow.style.animation = 'spin 0.1s infinite linear, shake 0.1s infinite';
            
            // Désactiver la boussole en zone bleue
            if (compassActive) {
                stopCompass();
            }
            
            if (typeof showMoonDialog === 'function') {
                showMoonDialog("🌙 C'EST ICI ! Ouvre l'AR maintenant, boulet !", 3000);
            }
            break;
    }
}

// ════════════════════════════════════════════════════════════
// 🎁 AIDE AUTOMATIQUE (TOUTES LES 3 MINUTES)
// ════════════════════════════════════════════════════════════
function startAutoHelpTimer() {
    autoHelpTimer = setInterval(() => {
        if (!compassActive && !autoHelpActive) {
            triggerAutoHelp();
        }
    }, 180000); // 3 minutes

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
        compassArrow.style.display = 'flex';
    }

    playSound('gift');
    if (typeof showMoonDialog === 'function') {
        showMoonDialog("🌙 Cadeau ! 10 secondes de boussole gratuite. Cours, mortel !", 3000);
    }

    // Désactiver après 10 secondes
    setTimeout(() => {
        autoHelpActive = false;

        if (compassBtn) {
            compassBtn.disabled = false;
            compassBtn.textContent = '🧭 Activer Boussole';
            compassBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
        }

        if (compassArrow && !compassActive) {
            compassArrow.style.display = 'none';
        }

        playSound('timeout');
        if (typeof showMoonDialog === 'function') {
            showMoonDialog("🌙 Fini la charité ! Maintenant tu payes.", 2000);
        }
    }, 10000);

    console.log("🎁 Aide automatique activée (10s)");
}

// ════════════════════════════════════════════════════════════
// 🔊 UTILITAIRES AUDIO
// ════════════════════════════════════════════════════════════
function playSound(soundName) {
    if (typeof playAudio === 'function') {
        playAudio(soundName);
    }
}

// ════════════════════════════════════════════════════════════
// 🌙 EXPORT POUR DEBUG
// ════════════════════════════════════════════════════════════
window.CompassDebug = {
    isActive: () => compassActive,
    bearing: () => compassBearing,
    heading: () => deviceHeading,
    zone: () => currentZone,
    forceHelp: triggerAutoHelp,
    toggle: toggleCompass
};

console.log("✅ Module Boussole chargé - Tapez CompassDebug dans la console");
