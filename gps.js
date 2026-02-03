// ═══════════════════════════════════════════════════════
// GPS0S - GESTION GPS & ZONES
// ═══════════════════════════════════════════════════════

// Liste des 9 points GPS
const gpsPoints = [
    { lat: 47.25865295634987, lon: -0.07232092747517298 },  // Point 1
    { lat: 47.25922301993599, lon: -0.07496422077580976 },  // Point 2
    { lat: 47.25957512835827, lon: -0.07585838017127501 },  // Point 3
    { lat: 47.25855640527987, lon: -0.07438732146623522 },  // Point 4
    { lat: 47.25777300506129, lon: -0.07572423946778357 },  // Point 5
    { lat: 47.257047880177915, lon: -0.07570440178130702 }, // Point 6
    { lat: 47.2566497660443, lon: -0.0740386275036121 },    // Point 7
    { lat: 47.253662326392785, lon: -0.07059828273820297 }, // Point 8
    { lat: 47.25564998079592, lon: -0.068996433977779 }     // Point 9
];

// Point GPS actuel (commence au 1er)
let currentPointIndex = 0;

// Position du joueur
let playerPosition = { lat: null, lon: null };

// Watcher GPS (pour mettre à jour en continu)
let gpsWatcher = null;

// ───────────────────────────────────────────────────────
// FONCTION : Démarrer le GPS
// ───────────────────────────────────────────────────────
function startGPS() {
    if (!navigator.geolocation) {
        alert("❌ Ton appareil ne supporte pas le GPS !");
        return;
    }

    console.log("🛰️ Démarrage du GPS...");

    // Surveiller la position en continu
    gpsWatcher = navigator.geolocation.watchPosition(
        updatePlayerPosition,  // Succès
        handleGPSError,        // Erreur
        {
            enableHighAccuracy: true,  // GPS précis
            timeout: 5000,             // 5s max pour obtenir la position
            maximumAge: 0              // Pas de cache
        }
    );
}

// ───────────────────────────────────────────────────────
// FONCTION : Mettre à jour la position du joueur
// ───────────────────────────────────────────────────────
function updatePlayerPosition(position) {
    playerPosition.lat = position.coords.latitude;
    playerPosition.lon = position.coords.longitude;

    console.log(`📍 Position actuelle : ${playerPosition.lat}, ${playerPosition.lon}`);

    // Calculer la distance au point actuel
    updateDistance();
}

// ───────────────────────────────────────────────────────
// FONCTION : Calculer et afficher la distance
// ───────────────────────────────────────────────────────
function updateDistance() {
    if (!playerPosition.lat || !playerPosition.lon) {
        console.warn("⚠️ Position GPS non disponible");
        return;
    }

    // Récupérer le point GPS actuel
    const targetPoint = gpsPoints[currentPointIndex];
    
    // Calculer la distance
    const distance = calculateDistance(
        playerPosition.lat, 
        playerPosition.lon, 
        targetPoint.lat, 
        targetPoint.lon
    );

    // Afficher la distance
    document.getElementById('distance').textContent = Math.round(distance) + 'm';

    // Mettre à jour l'affichage du point actuel
    document.getElementById('current-point').textContent = `${currentPointIndex + 1}/9`;

    // Déterminer la zone
    let zone = 'red';    // Par défaut : >100m
    let zoneText = '🔴 Loin';
    
    if (distance <= 5) {
        zone = 'blue';
        zoneText = '🔵 Zone AR !';
    } else if (distance <= 29) {
        zone = 'green';
        zoneText = '🟢 Mini-jeux';
    } else if (distance <= 99) {
        zone = 'orange';
        zoneText = '🟠 Proche';
    }

    // Mettre à jour l'indicateur visuel
    const indicator = document.getElementById('zone-indicator');
    indicator.className = 'zone-' + zone;
    indicator.textContent = zoneText;

    // 🆕 METTRE À JOUR LA BOUSSOLE (si elle existe)
    if (typeof updateCompassBearing === 'function') {
        updateCompassBearing(
            playerPosition.lat, 
            playerPosition.lon, 
            targetPoint.lat, 
            targetPoint.lon
        );
    }

    // 🆕 ADAPTER LA BOUSSOLE À LA ZONE
    if (typeof adaptCompassToZone === 'function') {
        adaptCompassToZone(zone);
    }

    // Afficher/Masquer les boutons selon la zone
    document.getElementById('ar-btn').style.display = (zone === 'blue') ? 'block' : 'none';
    document.getElementById('games-btn').style.display = (zone === 'green') ? 'block' : 'none';

    console.log(`📏 Distance au point ${currentPointIndex + 1} : ${Math.round(distance)}m (${zone})`);
}

// ───────────────────────────────────────────────────────
// FONCTION : Calculer la distance entre deux points GPS
// ───────────────────────────────────────────────────────
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
}

// ───────────────────────────────────────────────────────
// FONCTION : Gérer les erreurs GPS
// ───────────────────────────────────────────────────────
function handleGPSError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("❌ Tu dois autoriser la géolocalisation !");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("❌ Position GPS indisponible");
            break;
        case error.TIMEOUT:
            alert("❌ Timeout GPS, réessaye");
            break;
    }
    console.error("Erreur GPS:", error);
}

// ───────────────────────────────────────────────────────
// FONCTION : Passer au point GPS suivant
// ───────────────────────────────────────────────────────
function nextGPSPoint() {
    currentPointIndex++;
    
    if (currentPointIndex >= gpsPoints.length) {
        endGame();
        return;
    }
    
    console.log(`➡️ Passage au point ${currentPointIndex + 1}/9`);
    
    // Masquer le bouton "Suivant"
    document.getElementById('next-btn').style.display = 'none';
    
    // Mettre à jour l'affichage
    updateDistance();
    
    // Message de la Lune
    if (typeof showMoonMessage === 'function') {
        showMoonMessage(`🌙 Point ${currentPointIndex + 1}/9. En route !`, 3000);
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Fin du jeu
// ───────────────────────────────────────────────────────
function endGame() {
    alert("🎉 BRAVO ! Tu as capturé les 9 lunes !");
    // TODO: Animation finale
}
