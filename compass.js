// ═══════════════════════════════════════════════════════
// GPS0S - GESTION DE LA BOUSSOLE
// ═══════════════════════════════════════════════════════

let compassActive = false; // État de la boussole
let compassInterval = null; // Timer de consommation d'énergie
let compassBearing = 0; // Direction vers le point GPS

// Timer pour l'aide automatique
let autoHelpTimer = null;
let autoHelpActive = false;

// ───────────────────────────────────────────────────────
// FONCTION : Initialiser la boussole
// ───────────────────────────────────────────────────────
function initCompass() {
    const compassBtn = document.getElementById('compass-btn');
    
    compassBtn.addEventListener('click', toggleCompass);
    
    // Démarrer le timer d'aide automatique (3 minutes)
    startAutoHelpTimer();
    
    console.log("🧭 Boussole initialisée");
}

// ───────────────────────────────────────────────────────
// FONCTION : Activer/Désactiver la boussole
// ───────────────────────────────────────────────────────
function toggleCompass() {
    if (autoHelpActive) {
        showMoonMessage("🌙 Aide gratuite en cours, profites-en !", 2000);
        return;
    }
    
    if (currentEnergy <= 0) {
        showMoonMessage("🌙 Plus d'énergie ! Va jouer aux mini-jeux, feignasse !", 3000);
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
    
    compassBtn.textContent = '🧭 Désactiver';
    compassBtn.style.background = 'linear-gradient(135deg, #ff0044, #cc0033)';
    compassArrow.style.display = 'block';
    
    // Démarrer la consommation d'énergie (-1% toutes les 3s)
    compassInterval = setInterval(() => {
        if (!autoHelpActive) {
            consumeEnergy(1);
        }
        
        if (currentEnergy <= 0) {
            deactivateCompass();
            showMoonMessage("🌙 Batterie à plat ! T'as cru que c'était gratuit ?", 3000);
        }
    }, 3000);
    
    console.log("🧭 Boussole activée (consommation : -1% / 3s)");
}

// ───────────────────────────────────────────────────────
// FONCTION : Désactiver la boussole
// ───────────────────────────────────────────────────────
function deactivateCompass() {
    compassActive = false;
    
    const compassBtn = document.getElementById('compass-btn');
    const compassArrow = document.getElementById('compass-arrow');
    
    compassBtn.textContent = '🧭 Activer Boussole';
    compassBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
    compassArrow.style.display = 'none';
    
    // Arrêter la consommation
    if (compassInterval) {
        clearInterval(compassInterval);
        compassInterval = null;
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
        rotateCompassArrow(bearing);
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Faire tourner la flèche de la boussole
// ───────────────────────────────────────────────────────
function rotateCompassArrow(bearing) {
    const arrow = document.querySelector('#compass-arrow .arrow');
    if (!arrow) return;
    
    // Appliquer la rotation (en tenant compte de l'orientation du téléphone)
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (event) => {
            const heading = event.alpha || 0; // Orientation du téléphone
            const rotation = bearing - heading;
            arrow.style.transform = `rotate(${rotation}deg)`;
        });
    } else {
        // Fallback : rotation simple sans orientation du device
        arrow.style.transform = `rotate(${bearing}deg)`;
    }
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
            break;
            
        case 'green': // 6-29m : Folle
            arrow.style.animation = 'spin 0.3s infinite linear';
            if (compassActive && !autoHelpActive) {
                deactivateCompass();
                showMoonMessage("🌙 Trop proche ! La boussole pète un câble !", 2000);
            }
            break;
            
        case 'blue': // ≤5m : Désactivée
            if (compassActive) {
                deactivateCompass();
                showMoonMessage("🌙 Tu y es ! Ouvre l'AR maintenant !", 2000);
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
    
    compassBtn.textContent = '🎁 Aide Gratuite !';
    compassBtn.style.background = 'linear-gradient(135deg, #ffaa00, #ff8800)';
    compassBtn.disabled = true;
    compassArrow.style.display = 'block';
    
    showMoonMessage("🌙 Cadeau ! 10 secondes de boussole gratuite. Cours !", 3000);
    
    // Désactiver après 10 secondes
    setTimeout(() => {
        autoHelpActive = false;
        compassBtn.disabled = false;
        
        if (!compassActive) {
            compassBtn.textContent = '🧭 Activer Boussole';
            compassBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
            compassArrow.style.display = 'none';
        }
        
        showMoonMessage("🌙 Fini ! Maintenant tu payes.", 2000);
    }, 10000);
    
    console.log("🎁 Aide automatique activée (10s)");
}

// ───────────────────────────────────────────────────────
// EXPORT (pour main.js)
// ───────────────────────────────────────────────────────
// Les fonctions sont globales, pas besoin d'export en vanilla JS
