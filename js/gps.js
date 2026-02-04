/* ═══════════════════════════════════════════════════════
   📍 GPS0S - MODULE GPS
   Gestion : Géolocalisation, Zones, Anti-triche
   ═══════════════════════════════════════════════════════ */

console.log("📍 Module GPS chargé");

// ════════════════════════════════════════════════════════════
// 🗺️ POINTS GPS (Ordre 1 → 9)
// ════════════════════════════════════════════════════════════
const GPS_POINTS = [
    { lat: 47.25865295634987, lng: -0.07232092747517298, name: "Point 1", game: "1-2-3 Soleil" },
    { lat: 47.25922301993599, lng: -0.07496422077580976, name: "Point 2", game: "Memory Lunaire" },
    { lat: 47.25957512835827, lng: -0.07585838017127501, name: "Point 3", game: "Puzzle Lunaire" },
    { lat: 47.25855640527987, lng: -0.07438732146623522, name: "Point 4", game: "Dodgeball Lunaire" },
    { lat: 47.25777300506129, lng: -0.07572423946778357, name: "Point 5", game: "Flappy Selfie" },
    { lat: 47.257047880177915, lng: -0.07570440178130702, name: "Point 6", game: "Plateforme Lunaire" },
    { lat: 47.2566497660443, lng: -0.0740386275036121, name: "Point 7", game: "Labyrinthe Lunaire" },
    { lat: 47.253662326392785, lng: -0.07059828273820297, name: "Point 8", game: "Course Spatiale" },
    { lat: 47.25564998079592, lng: -0.068996433977779, name: "Point 9", game: "Combat 1v1" }
];

// ════════════════════════════════════════════════════════════
// 🔧 VARIABLES GLOBALES GPS
// ════════════════════════════════════════════════════════════
let currentGPSIndex = 0;
let userPosition = null;
let watchId = null;
let lastValidDistance = null;
let distanceCheckCount = 0;

// ════════════════════════════════════════════════════════════
// 🚀 INITIALISATION DU SYSTÈME GPS
// ════════════════════════════════════════════════════════════
function initGPS() {
    console.log("🛰️ Initialisation du système GPS...");

    // Vérifier si GPS disponible
    if (!navigator.geolocation) {
        alert("❌ Ton appareil ne supporte pas le GPS !");
        return;
    }

    // Charger la progression sauvegardée
    const savedIndex = localStorage.getItem('gps0s-current-point');
    if (savedIndex) {
        currentGPSIndex = parseInt(savedIndex);
        console.log(`📌 Progression chargée : Point ${currentGPSIndex + 1}`);
    }

    // Mettre à jour l'affichage
    updateCurrentPointDisplay();

    // Démarrer la géolocalisation
    startGPSTracking();

    console.log("✅ GPS initialisé");
}

// ════════════════════════════════════════════════════════════
// 🛰️ DÉMARRER LE SUIVI GPS
// ════════════════════════════════════════════════════════════
function startGPSTracking() {
    console.log("🛰️ Démarrage du suivi GPS...");

    watchId = navigator.geolocation.watchPosition(
        onGPSSuccess,
        onGPSError,
        {
            enableHighAccuracy: true,
            maximumAge: 3000,
            timeout: 10000
        }
    );
}

// ════════════════════════════════════════════════════════════
// ✅ GPS : SUCCÈS
// ════════════════════════════════════════════════════════════
function onGPSSuccess(position) {
    userPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
    };

    console.log("📍 Position mise à jour:", userPosition);
    console.log(`🎯 Précision : ±${Math.round(userPosition.accuracy)}m`);

    // Mettre à jour l'affichage
    updateDistance();
}

// ════════════════════════════════════════════════════════════
// ❌ GPS : ERREUR
// ════════════════════════════════════════════════════════════
function onGPSError(error) {
    console.error("❌ Erreur GPS:", error);

    const distanceEl = document.getElementById('distance');
    const zoneIndicator = document.getElementById('zone-indicator');

    switch(error.code) {
        case error.PERMISSION_DENIED:
            if (distanceEl) distanceEl.textContent = "GPS refusé";
            alert("⚠️ Active la localisation dans les paramètres !");
            break;
        case error.POSITION_UNAVAILABLE:
            if (distanceEl) distanceEl.textContent = "GPS indisponible";
            break;
        case error.TIMEOUT:
            if (distanceEl) distanceEl.textContent = "GPS timeout";
            break;
    }

    if (zoneIndicator) {
        zoneIndicator.classList.add('zone-error');
    }
}

// ════════════════════════════════════════════════════════════
// 📏 CALCULER LA DISTANCE (HAVERSINE)
// ════════════════════════════════════════════════════════════
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * 
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en mètres
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// ════════════════════════════════════════════════════════════
// 📊 METTRE À JOUR L'AFFICHAGE DE DISTANCE
// ════════════════════════════════════════════════════════════
function updateDistance() {
    if (!userPosition) {
        console.warn("⚠️ Position utilisateur non disponible");
        return;
    }

    const target = GPS_POINTS[currentGPSIndex];
    const distance = calculateDistance(
        userPosition.lat, 
        userPosition.lng,
        target.lat, 
        target.lng
    );

    // Anti-triche : vérifier les sauts de distance suspects
    if (lastValidDistance !== null) {
        const distanceChange = Math.abs(distance - lastValidDistance);
        
        if (distanceChange > 50) {
            distanceCheckCount++;
            console.warn(`⚠️ Saut de distance suspect : ${Math.round(distanceChange)}m`);
            
            if (distanceCheckCount > 3) {
                alert("⚠️ Position GPS suspecte détectée !");
                return;
            }
        } else {
            distanceCheckCount = 0;
        }
    }

    lastValidDistance = distance;

    // Afficher la distance
    updateDistanceDisplay(distance);

    // Gérer les zones de couleur
    updateZone(distance);

    // Mettre à jour la boussole
    if (typeof updateCompassDirection === 'function') {
        updateCompassDirection(userPosition, target);
    }
}

// ════════════════════════════════════════════════════════════
// 🎨 AFFICHAGE DE LA DISTANCE
// ════════════════════════════════════════════════════════════
function updateDistanceDisplay(distance) {
    const distanceEl = document.getElementById('distance');
    if (!distanceEl) return;

    let displayText = '';
    
    if (distance >= 1000) {
        displayText = `${(distance / 1000).toFixed(1)} km`;
    } else if (distance >= 100) {
        displayText = `${Math.round(distance)} m`;
    } else if (distance >= 10) {
        displayText = `${Math.round(distance)} m`;
    } else {
        displayText = `${distance.toFixed(1)} m`;
    }

    distanceEl.textContent = displayText;
}

// ════════════════════════════════════════════════════════════
// 🎨 ZONES DE COULEUR GPS
// ════════════════════════════════════════════════════════════
function updateZone(distance) {
    const zoneIndicator = document.getElementById('zone-indicator');
    const arBtn = document.getElementById('ar-btn');
    const compassBtn = document.getElementById('compass-btn');
    const zoneText = document.querySelector('.zone-text');

    // Retirer toutes les classes de zone
    if (zoneIndicator) {
        zoneIndicator.classList.remove('zone-red', 'zone-orange', 'zone-green', 'zone-blue');
    }

    if (distance <= 5) {
        // 🔵 ZONE BLEUE - AR disponible
        if (zoneIndicator) zoneIndicator.classList.add('zone-blue');
        if (arBtn) arBtn.classList.add('show');
        if (compassBtn) compassBtn.disabled = true;
        if (zoneText) zoneText.textContent = "AR DISPONIBLE !";
        
        console.log("🔵 ZONE BLEUE - Lance l'AR !");
        playSound('zone-blue');

    } else if (distance <= 29) {
        // 🟢 ZONE VERTE - Boussole folle
        if (zoneIndicator) zoneIndicator.classList.add('zone-green');
        if (arBtn) arBtn.classList.remove('show');
        if (compassBtn) compassBtn.disabled = false;
        if (zoneText) zoneText.textContent = "Boussole instable";
        
        console.log("🟢 ZONE VERTE");

    } else if (distance <= 99) {
        // 🟠 ZONE ORANGE - Boussole instable
        if (zoneIndicator) zoneIndicator.classList.add('zone-orange');
        if (arBtn) arBtn.classList.remove('show');
        if (compassBtn) compassBtn.disabled = false;
        if (zoneText) zoneText.textContent = "Vous vous rapprochez...";
        
        console.log("🟠 ZONE ORANGE");

    } else {
        // 🔴 ZONE ROUGE - Boussole stable
        if (zoneIndicator) zoneIndicator.classList.add('zone-red');
        if (arBtn) arBtn.classList.remove('show');
        if (compassBtn) compassBtn.disabled = false;
        if (zoneText) zoneText.textContent = "Encore loin...";
        
        console.log("🔴 ZONE ROUGE");
    }
}

// ════════════════════════════════════════════════════════════
// ➡️ PASSER AU POINT SUIVANT
// ════════════════════════════════════════════════════════════
function nextGPSPoint() {
    if (currentGPSIndex < GPS_POINTS.length - 1) {
        currentGPSIndex++;
        
        // Sauvegarder la progression
        localStorage.setItem('gps0s-current-point', currentGPSIndex);
        
        // Mettre à jour l'affichage
        updateCurrentPointDisplay();
        
        // Recalculer la distance
        if (userPosition) {
            updateDistance();
        }

        // Message de la Lune
        const target = GPS_POINTS[currentGPSIndex];
        if (typeof showMoonDialog === 'function') {
            showMoonDialog(`Point ${currentGPSIndex + 1} : ${target.game}. Trouve-moi ! 🌙`);
        }

        console.log(`✅ Passage au ${target.name}`);
        playSound('point-validated');

    } else {
        // Tous les points validés
        console.log("🎉 TOUS LES POINTS VALIDÉS !");
        showFinalAnimation();
    }
}

// ════════════════════════════════════════════════════════════
// 📊 METTRE À JOUR L'AFFICHAGE DU POINT ACTUEL
// ════════════════════════════════════════════════════════════
function updateCurrentPointDisplay() {
    const currentPointEl = document.getElementById('current-point');
    if (currentPointEl) {
        currentPointEl.textContent = `${currentGPSIndex + 1}/9`;
    }

    // Mettre à jour le nom du point dans l'interface
    const pointNameEl = document.getElementById('point-name');
    if (pointNameEl) {
        const target = GPS_POINTS[currentGPSIndex];
        pointNameEl.textContent = target.name;
    }
}

// ════════════════════════════════════════════════════════════
// 🎬 ANIMATION FINALE
// ════════════════════════════════════════════════════════════
function showFinalAnimation() {
    alert("🎉 BRAVO ! Tu as trouvé toutes les Lunes !\n\nAnimation finale en cours...");
    
    // TODO: Implémenter l'animation finale avec le selfie
    if (typeof startFinalAnimation === 'function') {
        startFinalAnimation();
    }
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
// 🛑 ARRÊTER LE GPS
// ════════════════════════════════════════════════════════════
function stopGPS() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        console.log("🛑 GPS arrêté");
    }
}

// ════════════════════════════════════════════════════════════
// 🌙 EXPORT POUR DEBUG
// ════════════════════════════════════════════════════════════
window.GPSDebug = {
    points: GPS_POINTS,
    currentIndex: () => currentGPSIndex,
    userPos: () => userPosition,
    goToNext: nextGPSPoint,
    resetProgress: () => {
        currentGPSIndex = 0;
        localStorage.removeItem('gps0s-current-point');
        updateCurrentPointDisplay();
        console.log("🔄 Progression GPS réinitialisée");
    }
};

console.log("✅ Module GPS chargé - Tapez GPSDebug dans la console");
