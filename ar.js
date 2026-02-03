// ═══════════════════════════════════════════════════════
// GPS0S - GESTION DE LA RÉALITÉ AUGMENTÉE
// ═══════════════════════════════════════════════════════

let arActive = false;

// ───────────────────────────────────────────────────────
// FONCTION : Initialiser l'AR
// ───────────────────────────────────────────────────────
function initAR() {
    const arBtn = document.getElementById('ar-btn');

    if (!arBtn) {
        console.error("❌ Bouton AR introuvable !");
        return;
    }

    arBtn.addEventListener('click', launchAR);

    console.log("📸 Système AR initialisé");
}

// ───────────────────────────────────────────────────────
// FONCTION : Lancer l'AR
// ───────────────────────────────────────────────────────
function launchAR() {
    console.log("📸 Lancement de l'AR...");

    // Vérifier si on est bien en zone bleue
    const distanceText = document.getElementById('distance').textContent;
    if (!distanceText.includes('blue')) {
        showMoonMessage("🌙 Trop loin ! Approche-toi encore !", 3000);
        return;
    }

    // Afficher le conteneur AR
    const arContainer = document.getElementById('ar-container');
    arContainer.style.display = 'flex';

    // Créer le <model-viewer> dynamiquement
    createARViewer();

    arActive = true;
}

// ───────────────────────────────────────────────────────
// FONCTION : Créer le <model-viewer>
// ───────────────────────────────────────────────────────
function createARViewer() {
    const arContainer = document.getElementById('ar-container');

    // Supprimer l'ancien viewer s'il existe
    const oldViewer = document.querySelector('model-viewer');
    if (oldViewer) oldViewer.remove();

    // Créer le <model-viewer>
    const viewer = document.createElement('model-viewer');
    viewer.setAttribute('src', getMoonModel());
    viewer.setAttribute('ios-src', getMoonModelIOS());
    viewer.setAttribute('ar', '');
    viewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
    viewer.setAttribute('camera-controls', '');
    viewer.setAttribute('shadow-intensity', '1');
    viewer.setAttribute('autoplay', '');
    
    // 🎯 AJUSTER LA TAILLE SELON LE POINT GPS
    const scale = getMoonScale();
    viewer.setAttribute('scale', `${scale} ${scale} ${scale}`);
    
    viewer.style.cssText = `
        width: 100%;
        height: 100%;
    `;

    // Écouter le clic sur le modèle 3D
    viewer.addEventListener('click', captureMoon);

    arContainer.appendChild(viewer);

    console.log(`📸 <model-viewer> créé (échelle: ${scale})`);
}

// ───────────────────────────────────────────────────────
// FONCTION : Obtenir le modèle 3D selon le point GPS
// ───────────────────────────────────────────────────────
function getMoonModel() {
    const point = currentPointIndex + 1;

    // Points 1-2 : Grosse lune immobile
    if (point <= 2) {
        return 'models/moon_big.glb';
    }
    // Points 3-6 : Lune moyenne avec animations
    else if (point <= 6) {
        return 'models/moon_medium.glb';
    }
    // Points 7-9 : Petite lune rapide
    else {
        return 'models/moon_small.glb';
    }
}

function getMoonModelIOS() {
    const point = currentPointIndex + 1;

    if (point <= 2) {
        return 'models/moon_big.usdz';
    } else if (point <= 6) {
        return 'models/moon_medium.usdz';
    } else {
        return 'models/moon_small.usdz';
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Capturer la Lune (validation du point GPS)
// ───────────────────────────────────────────────────────
function captureMoon() {
    if (!arActive) return;

    console.log("✅ Lune capturée !");

    // Fermer l'AR
    document.getElementById('ar-container').style.display = 'none';
    arActive = false;

    // Ajouter la lune au coffre (localStorage)
    addMoonToChest();

    // Afficher le bouton "Point suivant"
    document.getElementById('next-btn').style.display = 'block';

    // Message de la Lune
    showMoonMessage(`🌙 Point ${currentPointIndex + 1}/9 validé ! Bien joué !`, 3000);

    // TODO : Animation de capture (particules, son, etc.)
}

// ───────────────────────────────────────────────────────
// FONCTION : Ajouter la lune au coffre
// ───────────────────────────────────────────────────────
function addMoonToChest() {
    let moons = JSON.parse(localStorage.getItem('capturedMoons') || '[]');
    
    moons.push({
        point: currentPointIndex + 1,
        timestamp: Date.now(),
        model: getMoonModel()
    });

    localStorage.setItem('capturedMoons', JSON.stringify(moons));
    
    // Mettre à jour l'affichage du coffre
    updateChestDisplay();

    console.log(`📦 Lune ${currentPointIndex + 1} ajoutée au coffre`);
}

// ───────────────────────────────────────────────────────
// FONCTION : Mettre à jour l'affichage du coffre
// ───────────────────────────────────────────────────────
function updateChestDisplay() {
    const moons = JSON.parse(localStorage.getItem('capturedMoons') || '[]');
    const chestCount = document.querySelector('#chest-btn .count');
    
    if (chestCount) {
        chestCount.textContent = moons.length;
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Fermer l'AR
// ───────────────────────────────────────────────────────
function closeAR() {
    document.getElementById('ar-container').style.display = 'none';
    arActive = false;
    console.log("📸 AR fermée");
}
