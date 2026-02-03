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

    // Initialiser l'affichage du coffre
    updateChestDisplay();

    console.log("📸 Système AR initialisé");
}

// ───────────────────────────────────────────────────────
// FONCTION : Lancer l'AR
// ───────────────────────────────────────────────────────
function launchAR() {
    console.log("📸 Lancement de l'AR...");

    // Vérifier si on est bien en zone bleue
    const zoneIndicator = document.getElementById('zone-indicator');
    if (!zoneIndicator || !zoneIndicator.classList.contains('zone-blue')) {
        if (typeof showMoonMessage === 'function') {
            showMoonMessage("🌙 Trop loin ! Approche-toi encore !", 3000);
        }
        return;
    }

    // Afficher le conteneur AR
    const arContainer = document.getElementById('ar-container');
    if (arContainer) {
        arContainer.style.display = 'flex';
    }

    // Configurer le <model-viewer>
    setupARViewer();

    arActive = true;
}

// ───────────────────────────────────────────────────────
// FONCTION : Configurer le <model-viewer>
// ───────────────────────────────────────────────────────
function setupARViewer() {
    const viewer = document.getElementById('ar-viewer');

    if (!viewer) {
        console.error("❌ <model-viewer> introuvable !");
        return;
    }

    // 🎯 AJUSTER LA TAILLE SELON LE POINT GPS
    const scale = getMoonScale();
    viewer.setAttribute('scale', `${scale} ${scale} ${scale}`);

    // Écouter le clic sur le modèle 3D
    viewer.addEventListener('click', captureMoon);

    // 🎭 LANCER L'ANIMATION (points 3+)
    animateMoon(viewer);

    console.log(`📸 Viewer AR configuré (échelle: ${scale})`);
}

// ───────────────────────────────────────────────────────
// FONCTION : Obtenir l'échelle de la Lune selon le point
// ───────────────────────────────────────────────────────
function getMoonScale() {
    // Récupérer le point actuel depuis le texte affiché
    const pointText = document.getElementById('current-point');
    if (!pointText) return '1.0';

    const match = pointText.textContent.match(/(\d+)\/9/);
    const currentPoint = match ? parseInt(match[1]) : 1;

    // Points 1-2 : Grosse (échelle 1.5)
    if (currentPoint <= 2) return '1.5';

    // Points 3-6 : Moyenne (échelle 1.0)
    if (currentPoint <= 6) return '1.0';

    // Points 7-9 : Petite (échelle 0.5)
    return '0.5';
}

// ───────────────────────────────────────────────────────
// FONCTION : Animer la Lune (points 3+)
// ───────────────────────────────────────────────────────
function animateMoon(viewer) {
    const pointText = document.getElementById('current-point');
    if (!pointText) return;

    const match = pointText.textContent.match(/(\d+)\/9/);
    const currentPoint = match ? parseInt(match[1]) : 1;

    // Points 1-2 : Pas d'animation
    if (currentPoint <= 2) return;

    // Points 3-6 : Mouvements imprévisibles
    if (currentPoint <= 6) {
        setInterval(() => {
            const x = (Math.random() - 0.5) * 2;
            const z = (Math.random() - 0.5) * 2;
            viewer.setAttribute('position', `${x} 0 ${z}`);
        }, 2000);
    }

    // Points 7-9 : Téléportations toutes les 10s
    if (currentPoint >= 7) {
        setInterval(() => {
            const x = (Math.random() - 0.5) * 4;
            const z = (Math.random() - 0.5) * 4;
            viewer.setAttribute('position', `${x} 0 ${z}`);
            console.log("🌙 Téléportation !");
        }, 10000);
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Capturer la Lune (clic sur le modèle)
// ───────────────────────────────────────────────────────
function captureMoon() {
    console.log("🌙 Lune capturée !");

    // Fermer l'AR
    closeAR();

    // Ajouter la lune au coffre (localStorage)
    addMoonToChest();

    // Afficher le bouton "Point suivant"
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.style.display = 'block';
    }

    // Cacher le bouton AR
    const arBtn = document.getElementById('ar-btn');
    if (arBtn) {
        arBtn.style.display = 'none';
    }

    // Message de la Lune
    const pointText = document.getElementById('current-point');
    const point = pointText ? pointText.textContent.split('/')[0] : '?';

    if (typeof showMoonMessage === 'function') {
        showMoonMessage(`🌙 Point ${point}/9 validé ! Bien joué !`, 3000);
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Ajouter la lune au coffre
// ───────────────────────────────────────────────────────
function addMoonToChest() {
    let moons = JSON.parse(localStorage.getItem('capturedMoons') || '[]');

    const pointText = document.getElementById('current-point');
    const point = pointText ? parseInt(pointText.textContent.split('/')[0]) : 1;

    moons.push({
        point: point,
        timestamp: Date.now(),
        scale: getMoonScale()
    });

    localStorage.setItem('capturedMoons', JSON.stringify(moons));

    // Mettre à jour l'affichage du coffre
    updateChestDisplay();

    console.log(`📦 Lune ${point} ajoutée au coffre`);
}

// ───────────────────────────────────────────────────────
// FONCTION : Mettre à jour l'affichage du coffre
// ───────────────────────────────────────────────────────
function updateChestDisplay() {
    const moons = JSON.parse(localStorage.getItem('capturedMoons') || '[]');
    const moonCount = document.getElementById('moon-count');

    if (moonCount) {
        moonCount.textContent = moons.length;
    }

    console.log(`📦 Coffre mis à jour : ${moons.length}/9 lunes`);
}

// ───────────────────────────────────────────────────────
// FONCTION : Fermer l'AR
// ───────────────────────────────────────────────────────
function closeAR() {
    const arContainer = document.getElementById('ar-container');
    if (arContainer) {
        arContainer.style.display = 'none';
    }

    arActive = false;
    console.log("📸 AR fermée");
}

// ───────────────────────────────────────────────────────
// MODULE CHARGÉ (Pas d'auto-init)
// ───────────────────────────────────────────────────────
console.log("📸 Module AR chargé (en attente d'activation par main.js)");
