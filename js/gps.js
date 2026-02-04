// ═══════════════════════════════════════════════════════
// GPS0S - GESTION GPS & ZONES
// ═══════════════════════════════════════════════════════

// Liste des 9 points GPS (CONSTANTE)
const GPS_POINTS = [
    { lat: 47.25865295634987, lon: -0.07232092747517298 },
    { lat: 47.25922301993599, lon: -0.07496422077580976 },
    { lat: 47.25957512835827, lon: -0.07585838017127501 },
    { lat: 47.25855640527987, lon: -0.07438732146623522 },
    { lat: 47.25777300506129, lon: -0.07572423946778357 },
    { lat: 47.257047880177915, lon: -0.07570440178130702 },
    { lat: 47.2566497660443, lon: -0.0740386275036121 },
    { lat: 47.253662326392785, lon: -0.07059828273820297 },
    { lat: 47.25564998079592, lon: -0.068996433977779 }
];

let currentPointIndex = 0;
let playerPosition = { lat: null, lon: null };
let gpsWatcher = null;

// Variables anti-triche
let lastValidDistance = null;
let distanceCheckCount = 0;

// ───────────────────────────────────────────────────────
// FONCTION : Démarrer le GPS
// ───────────────────────────────────────────────────────
function startGPS() {
    if (!navigator.geolocation) {
        alert("❌ Ton appareil ne supporte pas le GPS !");
        return;
    }

    console.log("🛰️ Démarrage du GPS...");

    gpsWatcher = navigator.geolocation.watchPosition(
        updatePlayerPosition,
        handleGPSError,
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// ───────────────────────────────────────────────────────
// FONCTION : Mettre à jour la position du joueur
// ───────────────────────────────────────────────────────
// ───────────────────────────────────────────────────────
// FONCTION : Démarrer le GPS
// ───────────────────────────────────────────────────────
function startGPS() {
    if (!navigator.geolocation) {
        alert("❌ Ton appareil ne supporte pas le GPS !");
        return;
    }

    console.log("🛰️ Démarrage du GPS...");

    gpsWatcher = navigator.geolocation.watchPosition(
        updatePlayerPosition,
        handleGPSError,
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// ───────────────────────────────────────────────────────
// FONCTION : Mettre à jour la position du joueur
// ───────────────────────────────────────────────────────
function updatePlayerPosition(position) {
    // 🎮 MODE DÉMO : Utiliser la position simulée si active
    if (typeof DemoMode !== 'undefined' && DemoMode.active) {
        const demoPos = DemoMode.getCurrentPosition();
        if (demoPos) {
            position = demoPos;
        }
    }

    playerPosition.lat = position.coords.latitude;
    playerPosition.lon = position.coords.longitude;

    console.log(`📍 Position : ${playerPosition.lat.toFixed(5)}, ${playerPosition.lon.toFixed(5)}`);
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

    const targetPoint = GPS_POINTS[currentPointIndex];
    const distance = calculateDistance(
        playerPosition.lat, 
        playerPosition.lon, 
        targetPoint.lat, 
        targetPoint.lon
    );

    // Affichage de base
    document.getElementById('distance').textContent = Math.round(distance) + 'm';
    document.getElementById('current-point').textContent = `${currentPointIndex + 1}/9`;

    // Détermination de la zone
    let zone = 'red';
    let zoneText = '🔴 Loin';

    if (distance <= 5) {
        // Vérification anti-triche (3 lectures < 5m)
        if (lastValidDistance !== null && lastValidDistance <= 5) {
            distanceCheckCount++;
        } else {
            distanceCheckCount = 0;
        }

        if (distanceCheckCount >= 2) {
            zone = 'blue';
            zoneText = '🔵 Zone AR !';
        } else {
            zone = 'green';
            zoneText = '🟢 Stabilisation...';
        }
    } else if (distance <= 29) {
        zone = 'green';
        zoneText = '🟢 Proche';
        distanceCheckCount = 0;
    } else if (distance <= 99) {
        zone = 'orange';
        zoneText = '🟠 Moyen';
        distanceCheckCount = 0;
    } else {
        zone = 'red';
        zoneText = '🔴 Loin';
        distanceCheckCount = 0;
    }

    lastValidDistance = distance;

    // Mise à jour visuelle
    const indicator = document.getElementById('zone-indicator');
    if (indicator) {
        indicator.className = 'zone-' + zone;
        indicator.textContent = zoneText;
    }

    // Mise à jour de la boussole (si elle existe)
    if (typeof updateCompassBearing === 'function') {
        updateCompassBearing(
            playerPosition.lat, 
            playerPosition.lon, 
            targetPoint.lat, 
            targetPoint.lon
        );
    }

    if (typeof adaptCompassToZone === 'function') {
        adaptCompassToZone(zone);
    }

    // Affichage des boutons
    const arBtn = document.getElementById('ar-btn');
    const gamesBtn = document.getElementById('games-btn');

    if (arBtn) {
        arBtn.style.display = (zone === 'blue') ? 'block' : 'none';
    }

    if (gamesBtn) {
        gamesBtn.style.display = (zone === 'green') ? 'block' : 'none';
    }

    console.log(`📏 ${Math.round(distance)}m → ${zone.toUpperCase()}`);
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

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// ───────────────────────────────────────────────────────
// FONCTION : Gérer les erreurs GPS
// ───────────────────────────────────────────────────────
function handleGPSError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("❌ Autorise la géolocalisation dans les paramètres !");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("❌ Signal GPS trop faible. Sors à l'extérieur !");
            break;
        case error.TIMEOUT:
            console.warn("⚠️ Timeout GPS (signal faible)");
            break;
    }
    console.error("Erreur GPS:", error);
}

// ───────────────────────────────────────────────────────
// FONCTION : Valider la capture AR (appelée depuis ar.js)
// ───────────────────────────────────────────────────────
function validateARCapture() {
    console.log(`✅ Lune ${currentPointIndex + 1}/9 capturée !`);

    const nextBtn = document.getElementById('next-btn');

    if (nextBtn) {
        nextBtn.style.display = 'block';

        if (currentPointIndex < GPS_POINTS.length - 1) {
            nextBtn.textContent = `➡️ Point ${currentPointIndex + 2}/9`;
        } else {
            nextBtn.textContent = '🎉 Scène Finale !';
        }
    }

    // Messages de la Lune sarcastiques
    const moonMessages = [
        "🌙 Bien joué ! Enfin un peu d'effort...",
        "🌙 Tu progresses. Miraculeux.",
        "🌙 Celle-là était facile. La prochaine, moins.",
        "🌙 Continue, tu vas y arriver... peut-être.",
        "🌙 Pas mal pour un humain.",
        "🌙 Oh, tu sais cliquer ? Bravo !",
        "🌙 Encore quelques-unes...",
        "🌙 Tu chauffes ! Ton cerveau, moins.",
        "🌙 Dernière ! Tu sens la victoire ?"
    ];

    if (typeof showMoonMessage === 'function') {
        showMoonMessage(moonMessages[currentPointIndex], 3000);
    }

    // Bonus d'énergie
    if (typeof rechargeEnergy === 'function') {
        rechargeEnergy(10);
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Passer au point suivant
// ───────────────────────────────────────────────────────
function nextGPSPoint() {
    currentPointIndex++;

    if (currentPointIndex >= GPS_POINTS.length) {
        endGame();
        return;
    }

    console.log(`➡️ Nouveau point : ${currentPointIndex + 1}/9`);

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.style.display = 'none';
    }

    // Reset anti-triche
    distanceCheckCount = 0;
    lastValidDistance = null;

    // Forcer une mise à jour immédiate
    updateDistance();

    if (typeof showMoonMessage === 'function') {
        showMoonMessage(`🌙 En route vers le point ${currentPointIndex + 1} !`, 2000);
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Fin du jeu
// ───────────────────────────────────────────────────────
function endGame() {
    console.log("🎉 JEU TERMINÉ !");

    // Arrêter le GPS
    if (gpsWatcher) {
        navigator.geolocation.clearWatch(gpsWatcher);
    }

    // Arrêter la boussole
    if (typeof deactivateCompass === 'function') {
        deactivateCompass();
    }

    if (typeof showMoonMessage === 'function') {
        showMoonMessage("🌙 GG ! Tu as toutes les lunes. Prépare-toi pour la fin...", 5000);
    }

    setTimeout(() => {
        // TODO: Lancer l'animation finale
        alert("🎬 Animation finale à venir !");
    }, 5000);
}

// ───────────────────────────────────────────────────────
// MODULE CHARGÉ (Pas d'auto-init)
// ───────────────────────────────────────────────────────
console.log("📡 Module GPS chargé (en attente d'activation par main.js)");
