console.log("📍 Module GPS chargé");

// ════════════════════════════════════════════════════════════
// POINTS GPS (Ordre 1 → 9)
// ════════════════════════════════════════════════════════════
const GPS_POINTS = [
    { lat: 47.25865295634987, lng: -0.07232092747517298, name: "Point 1" },
    { lat: 47.25922301993599, lng: -0.07496422077580976, name: "Point 2" },
    { lat: 47.25957512835827, lng: -0.07585838017127501, name: "Point 3" },
    { lat: 47.25855640527987, lng: -0.07438732146623522, name: "Point 4" },
    { lat: 47.25777300506129, lng: -0.07572423946778357, name: "Point 5" },
    { lat: 47.257047880177915, lng: -0.07570440178130702, name: "Point 6" },
    { lat: 47.2566497660443, lng: -0.0740386275036121, name: "Point 7" },
    { lat: 47.253662326392785, lng: -0.07059828273820297, name: "Point 8" },
    { lat: 47.25564998079592, lng: -0.068996433977779, name: "Point 9" }
];

let currentGPSIndex = 0;
let userPosition = null;
let watchId = null;

// ════════════════════════════════════════════════════════════
// DÉMARRER LE GPS
// ════════════════════════════════════════════════════════════
function startGPS() {
    console.log("🛰️ Démarrage du GPS...");
    
    if (!navigator.geolocation) {
        alert("❌ GPS non disponible sur cet appareil");
        return;
    }
    
    watchId = navigator.geolocation.watchPosition(
        (position) => {
            userPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            console.log("📍 Position actuelle:", userPosition);
            updateDistance();
        },
        (error) => {
            console.error("❌ Erreur GPS:", error);
            document.getElementById('distance').textContent = "GPS indisponible";
        },
        {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000
        }
    );
}

// ════════════════════════════════════════════════════════════
// CALCULER LA DISTANCE
// ════════════════════════════════════════════════════════════
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance en mètres
}

// ════════════════════════════════════════════════════════════
// METTRE À JOUR L'AFFICHAGE
// ════════════════════════════════════════════════════════════
function updateDistance() {
    if (!userPosition) return;
    
    const target = GPS_POINTS[currentGPSIndex];
    const distance = calculateDistance(
        userPosition.lat, userPosition.lng,
        target.lat, target.lng
    );
    
    // Afficher la distance
    const distanceEl = document.getElementById('distance');
    if (distanceEl) {
        distanceEl.textContent = `${Math.round(distance)}m`;
    }
    
    // Gérer les zones de couleur
    updateZone(distance);
    
    console.log(`📏 Distance au ${target.name}: ${Math.round(distance)}m`);
}

// ════════════════════════════════════════════════════════════
// ZONES DE COULEUR
// ════════════════════════════════════════════════════════════
function updateZone(distance) {
    const arBtn = document.getElementById('ar-btn');
    
    if (distance <= 5) {
        // 🔵 Zone Bleue - AR disponible
        document.body.style.setProperty('--zone-color', '#00f2ff');
        if (arBtn) arBtn.style.display = 'block';
        console.log("🔵 ZONE BLEUE - Lance l'AR !");
        
    } else if (distance <= 29) {
        // 🟢 Zone Verte - Boussole folle
        document.body.style.setProperty('--zone-color', '#00ff88');
        if (arBtn) arBtn.style.display = 'none';
        console.log("🟢 ZONE VERTE");
        
    } else if (distance <= 99) {
        // 🟠 Zone Orange - Boussole instable
        document.body.style.setProperty('--zone-color', '#ff9500');
        if (arBtn) arBtn.style.display = 'none';
        console.log("🟠 ZONE ORANGE");
        
    } else {
        // 🔴 Zone Rouge - Boussole stable
        document.body.style.setProperty('--zone-color', '#ff0055');
        if (arBtn) arBtn.style.display = 'none';
        console.log("🔴 ZONE ROUGE");
    }
}

// ════════════════════════════════════════════════════════════
// PASSER AU POINT SUIVANT
// ════════════════════════════════════════════════════════════
function nextGPSPoint() {
    if (currentGPSIndex < GPS_POINTS.length - 1) {
        currentGPSIndex++;
        document.getElementById('current-gps').textContent = currentGPSIndex + 1;
        console.log(`✅ Passage au point ${currentGPSIndex + 1}`);
        updateDistance();
    } else {
        console.log("🎉 Tous les points validés !");
        alert("🎉 Bravo ! Tu as trouvé tous les points !");
    }
}
