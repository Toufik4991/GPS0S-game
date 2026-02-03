// ═══════════════════════════════════════════════════════
// GPS0S - GESTION GPS & ZONES
// ═══════════════════════════════════════════════════════

// Les 9 points GPS (ordre chronologique)
const GPS_POINTS = [
    { id: 1, lat: 47.25865295634987, lon: -0.07232092747517298, name: "Point 1" },
    { id: 2, lat: 47.25922301993599, lon: -0.07496422077580976, name: "Point 2" },
    { id: 3, lat: 47.25957512835827, lon: -0.07585838017127501, name: "Point 3" },
    { id: 4, lat: 47.25855640527987, lon: -0.07438732146623522, name: "Point 4" },
    { id: 5, lat: 47.25777300506129, lon: -0.07572423946778357, name: "Point 5" },
    { id: 6, lat: 47.257047880177915, lon: -0.07570440178130702, name: "Point 6" },
    { id: 7, lat: 47.2566497660443, lon: -0.0740386275036121, name: "Point 7" },
    { id: 8, lat: 47.253662326392785, lon: -0.07059828273820297, name: "Point 8" },
    { id: 9, lat: 47.25564998079592, lon: -0.068996433977779, name: "Point 9" }
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
// FONCTION : Gérer les erreurs GPS
// ───────────────────────────────────────────────────────
function handleGPSError(error) {
    console.error("❌ Erreur GPS :", error.message);
    
    const distanceText = document.getElementById('distance-text');
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            distanceText.textContent = "❌ Active la géolocalisation !";
            break;
        case error.POSITION_UNAVAILABLE:
            distanceText.textContent = "❌ Position indisponible";
            break;
        case error.TIMEOUT:
            distanceText.textContent = "⏱️ GPS trop lent...";
            break;
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Calculer la distance (Haversine)
// ───────────────────────────────────────────────────────
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance en mètres
}

// ───────────────────────────────────────────────────────
// FONCTION : Mettre à jour l'affichage de distance
// ───────────────────────────────────────────────────────
function updateDistance() {
    if (!playerPosition.lat) return;

    const targetPoint = GPS_POINTS[currentPointIndex];
    const distance = calculateDistance(
        playerPosition.lat,
        playerPosition.lon,
        targetPoint.lat,
        targetPoint.lon
    );

    const distanceText = document.getElementById('distance-text');
    const zoneIndicator = document.getElementById('zone-indicator');

    // Déterminer la zone et afficher
    let zoneClass = '';
    let message = '';

    if (distance > 100) {
        // 🔴 ZONE ROUGE (>100m)
        zoneClass = 'zone-red';
        message = `🔴 ${Math.round(distance)}m du ${targetPoint.name}`;
    } else if (distance > 30) {
        // 🟠 ZONE ORANGE (30-100m)
        zoneClass = 'zone-orange';
        message = `🟠 ${Math.round(distance)}m du ${targetPoint.name}`;
    } else if (distance > 5) {
        // 🟢 ZONE VERTE (6-29m)
        zoneClass = 'zone-green';
        message = `🟢 ${Math.round(distance)}m - Mini-jeux débloqués !`;
        showGamesButton(); // Afficher bouton mini-jeux
    } else {
        // 🔵 ZONE BLEUE (≤5m)
        zoneClass = 'zone-blue';
        message = `🔵 ZONE DE CAPTURE ! (${Math.round(distance)}m)`;
        showARButton(); // Afficher bouton AR
    }

    distanceText.textContent = message;
    zoneIndicator.className = zoneClass;
}

// ───────────────────────────────────────────────────────
// FONCTION : Afficher le bouton AR (Zone Bleue)
// ───────────────────────────────────────────────────────
function showARButton() {
    document.getElementById('ar-btn').style.display = 'block';
    document.getElementById('games-btn').style.display = 'none';
}

// ───────────────────────────────────────────────────────
// FONCTION : Afficher le bouton Mini-Jeux (Zone Verte)
// ───────────────────────────────────────────────────────
function showGamesButton() {
    document.getElementById('games-btn').style.display = 'block';
    document.getElementById('ar-btn').style.display = 'none';
}

// ───────────────────────────────────────────────────────
// FONCTION : Passer au point suivant
// ───────────────────────────────────────────────────────
function nextGPSPoint() {
    if (currentPointIndex < GPS_POINTS.length - 1) {
        currentPointIndex++;
        console.log(`✅ Passage au ${GPS_POINTS[currentPointIndex].name}`);
        
        // Cacher le bouton "Point suivant"
        document.getElementById('next-btn').style.display = 'none';
        
        // Mettre à jour la distance
        updateDistance();
    } else {
        // Tous les points validés → Animation finale
        console.log("🎉 TOUS LES POINTS VALIDÉS !");
        endGame();
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Fin du jeu (à compléter plus tard)
// ───────────────────────────────────────────────────────
function endGame() {
    alert("🎉 BRAVO ! Tu as capturé les 9 lunes !");
    // TODO: Animation finale
}
