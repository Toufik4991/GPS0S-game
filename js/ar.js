/* ═══════════════════════════════════════════════════════
   📸 GPS0S - SYSTÈME DE RÉALITÉ AUGMENTÉE
   Fonction : Affichage 3D + Capture Lune + Évolution
   ═══════════════════════════════════════════════════════ */

console.log("📸 Module AR chargé");

// ════════════════════════════════════════════════════════════
// 🔧 VARIABLES GLOBALES AR
// ════════════════════════════════════════════════════════════
let arActive = false;
let currentMoonSize = 1;        // 1 = grosse, 0.6 = moyenne, 0.3 = petite
let moonMoveInterval = null;
let captureAttempts = 0;        // Compteur d'essais de capture

// ════════════════════════════════════════════════════════════
// 🚀 INITIALISATION DU SYSTÈME AR
// ════════════════════════════════════════════════════════════
function initAR() {
    console.log("📸 Initialisation du système AR...");

    const arBtn = document.getElementById('ar-btn');
    if (!arBtn) {
        console.error("❌ Bouton 'ar-btn' introuvable !");
        return;
    }

    arBtn.addEventListener('click', launchAR);

    // Vérifier le support de model-viewer
    if (!customElements.get('model-viewer')) {
        console.warn("⚠️ model-viewer non chargé, vérifier le script dans index.html");
    }

    console.log("✅ Système AR initialisé");
}

// ════════════════════════════════════════════════════════════
// 📱 LANCER L'AR
// ════════════════════════════════════════════════════════════
function launchAR() {
    console.log("📸 Lancement de l'AR...");

    // Vérifier qu'on est bien en zone bleue
    if (typeof getCurrentZone === 'function') {
        const zone = getCurrentZone();
        if (zone !== 'blue') {
            alert("⚠️ Rapproche-toi encore (≤5m) !");
            return;
        }
    }

    // Récupérer le point GPS actuel
    const currentPoint = (typeof currentGPSIndex !== 'undefined') ? currentGPSIndex + 1 : 1;

    // Déterminer la taille de la Lune selon la progression
    if (currentPoint <= 3) {
        currentMoonSize = 1;      // Grosse (Points 1-3)
    } else if (currentPoint <= 6) {
        currentMoonSize = 0.6;    // Moyenne (Points 4-6)
    } else {
        currentMoonSize = 0.3;    // Petite (Points 7-9)
    }

    // Afficher le conteneur AR
    const arContainer = document.getElementById('ar-container');
    if (!arContainer) {
        console.error("❌ Conteneur 'ar-container' introuvable !");
        return;
    }

    arContainer.style.display = 'flex';
    arActive = true;
    captureAttempts = 0;

    // Créer le model-viewer
    createARViewer(currentPoint);

    // Désactiver la boussole pendant l'AR
    if (typeof stopCompass === 'function') {
        stopCompass();
    }

    // Son de lancement AR
    playSound('ar-launch');

    // Message de la Lune
    if (typeof showMoonDialog === 'function') {
        const messages = [
            "🌙 Allez, cherche-moi... si tu peux ! 😏",
            "🌙 Je suis là, mais où ? Réfléchis un peu ! 🧠",
            "🌙 Trop facile pour toi, non ? On va voir ça... 😈"
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        showMoonDialog(randomMsg, 3000);
    }

    console.log(`📸 AR active (Point ${currentPoint}, Taille: ${currentMoonSize})`);
}

// ════════════════════════════════════════════════════════════
// 🎨 CRÉER LE MODEL-VIEWER
// ════════════════════════════════════════════════════════════
function createARViewer(currentPoint) {
    const arContainer = document.getElementById('ar-container');

    // Nettoyer l'ancien viewer
    arContainer.innerHTML = '';

    // ──────────────────────────────────────────────────────
    // 1️⃣ MODEL-VIEWER (Lune 3D)
    // ──────────────────────────────────────────────────────
    const viewer = document.createElement('model-viewer');
    viewer.id = 'moon-viewer';
    viewer.src = 'assets/models/moon.glb';              // Android/Web
    viewer.iosSrc = 'assets/models/moon.usdz';          // iOS Quick Look
    viewer.alt = 'Lune 3D à capturer';
    viewer.setAttribute('ar', '');
    viewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
    viewer.setAttribute('camera-controls', '');
    viewer.setAttribute('auto-rotate', '');
    viewer.setAttribute('ar-scale', 'fixed');
    viewer.style.width = '100%';
    viewer.style.height = '100%';
    viewer.style.background = 'transparent';

    // Définir la taille de la Lune
    viewer.scale = `${currentMoonSize} ${currentMoonSize} ${currentMoonSize}`;

    // ──────────────────────────────────────────────────────
    // 2️⃣ BOUTON "CAPTURER LA LUNE"
    // ──────────────────────────────────────────────────────
    const captureBtn = document.createElement('button');
    captureBtn.id = 'capture-moon-btn';
    captureBtn.className = 'ar-capture-btn';
    captureBtn.textContent = '🌙 CAPTURER LA LUNE';
    captureBtn.onclick = captureMoonFromAR;

    // ──────────────────────────────────────────────────────
    // 3️⃣ BOUTON "FERMER L'AR"
    // ──────────────────────────────────────────────────────
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ar-close-btn';
    closeBtn.textContent = '✕';
    closeBtn.onclick = closeAR;

    // ──────────────────────────────────────────────────────
    // 4️⃣ INDICATEUR DE DIFFICULTÉ
    // ──────────────────────────────────────────────────────
    const difficultyText = document.createElement('div');
    difficultyText.className = 'ar-difficulty';
    difficultyText.style.cssText = `
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.7);
        color: #00ff88;
        padding: 10px 20px;
        border-radius: 20px;
        font-family: 'Press Start 2P', monospace;
        font-size: 12px;
        z-index: 1001;
    `;

    if (currentPoint <= 3) {
        difficultyText.textContent = '😊 FACILE - Grosse Lune';
    } else if (currentPoint <= 6) {
        difficultyText.textContent = '😅 MOYEN - Lune Mobile';
    } else {
        difficultyText.textContent = '😈 DIFFICILE - Téléportation !';
    }

    // ──────────────────────────────────────────────────────
    // 5️⃣ AJOUTER LES ÉLÉMENTS AU DOM
    // ──────────────────────────────────────────────────────
    arContainer.appendChild(viewer);
    arContainer.appendChild(difficultyText);
    arContainer.appendChild(captureBtn);
    arContainer.appendChild(closeBtn);

    // ──────────────────────────────────────────────────────
    // 6️⃣ DÉMARRER LES MOUVEMENTS (Points 4+)
    // ──────────────────────────────────────────────────────
    if (currentPoint >= 4) {
        startMoonMovement(viewer, currentPoint);
    }
}

// ════════════════════════════════════════════════════════════
// 🌀 MOUVEMENTS DE LA LUNE (Difficulté évolutive)
// ════════════════════════════════════════════════════════════
function startMoonMovement(viewer, currentPoint) {
    if (currentPoint >= 7) {
        // ──────────────────────────────────────────────────
        // LUNES 7-9 : Téléportation toutes les 10s
        // ──────────────────────────────────────────────────
        moonMoveInterval = setInterval(() => {
            const randomX = (Math.random() - 0.5) * 90;  // -45° à 45°
            const randomY = 50 + (Math.random() * 40);   // 50° à 90°
            const randomZ = 1 + (Math.random() * 2);     // 1m à 3m
            viewer.cameraOrbit = `${randomX}deg ${randomY}deg ${randomZ}m`;
            
            playSound('teleport');
            console.log("🌀 Lune téléportée !");
        }, 10000);

    } else {
        // ──────────────────────────────────────────────────
        // LUNES 4-6 : Mouvements doux toutes les 3s
        // ──────────────────────────────────────────────────
        moonMoveInterval = setInterval(() => {
            const randomX = (Math.random() - 0.5) * 60;
            const randomY = 60 + (Math.random() * 30);
            viewer.cameraOrbit = `${randomX}deg ${randomY}deg 2m`;
        }, 3000);
    }
}

// ════════════════════════════════════════════════════════════
// 🎯 CAPTURER LA LUNE DEPUIS L'AR
// ════════════════════════════════════════════════════════════
function captureMoonFromAR() {
    console.log("🌙 Tentative de capture...");
    captureAttempts++;

    // Arrêter les mouvements
    if (moonMoveInterval) {
        clearInterval(moonMoveInterval);
        moonMoveInterval = null;
    }

    // Récupérer l'ID du point GPS actuel
    const moonID = (typeof currentGPSIndex !== 'undefined') ? currentGPSIndex + 1 : 1;

    // Ajouter la Lune au coffre (fonction dans chest.js)
    if (typeof addMoonToChest === 'function') {
        addMoonToChest(moonID);
    }

    // Sons de célébration
    playSound('moon-collected');

    // Message de la Lune (sarcastique)
    if (typeof showMoonDialog === 'function') {
        const messages = [
            `🌙 Bien joué... après ${captureAttempts} essai(s). Pas mal ! 👏`,
            "🌙 Encore 8 et tu pourras rentrer chez toi. Courage ! 😏",
            "🌙 Tu chauffes... mais ton cerveau refroidit. 🧠",
            "🌙 Bravo, champion(ne) du GPS ! Continue. 🏆",
            "🌙 Tu vois ? C'était pas si dur. Ou si ? 🤔"
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        showMoonDialog(randomMsg, 4000);
    }

    // Passer au point GPS suivant
    if (typeof nextGPSPoint === 'function') {
        setTimeout(() => {
            nextGPSPoint();
            closeAR();
        }, 2000);
    } else {
        setTimeout(closeAR, 2000);
    }

    console.log(`✅ Lune ${moonID} capturée !`);
}

// ════════════════════════════════════════════════════════════
// ❌ FERMER L'AR
// ════════════════════════════════════════════════════════════
function closeAR() {
    const arContainer = document.getElementById('ar-container');
    if (arContainer) {
        arContainer.style.display = 'none';
        arContainer.innerHTML = ''; // Nettoyer le DOM
    }

    // Arrêter les mouvements
    if (moonMoveInterval) {
        clearInterval(moonMoveInterval);
        moonMoveInterval = null;
    }

    arActive = false;
    captureAttempts = 0;

    playSound('ar-close');
    console.log("📸 AR fermée");
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
window.ARDebug = {
    isActive: () => arActive,
    launch: launchAR,
    capture: captureMoonFromAR,
    close: closeAR,
    size: () => currentMoonSize
};

console.log("✅ Module AR chargé - Tapez ARDebug dans la console");
