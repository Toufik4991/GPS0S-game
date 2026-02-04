// ═══════════════════════════════════════════════════════
// GPS0S - SCRIPT PRINCIPAL
// ═══════════════════════════════════════════════════════

console.log("🚀 GPS0S - Initialisation...");

// ───────────────────────────────────────────────────────
// ÉTAPE 1 : ÉCRAN DE CHARGEMENT
// ───────────────────────────────────────────────────────
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const progressFill = document.getElementById('progress-fill');
    
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 10;
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
                
                // Vérifier si le selfie existe déjà
                checkSelfieStatus();
            }, 500);
        }
    }, 200);
});

// ───────────────────────────────────────────────────────
// ÉTAPE 2 : VÉRIFIER LE SELFIE
// ───────────────────────────────────────────────────────
function checkSelfieStatus() {
    const savedSelfie = localStorage.getItem('playerSelfie');
    const selfieScreen = document.getElementById('selfie-screen');
    const gameContainer = document.getElementById('game-container');
    
    if (savedSelfie) {
        // Selfie déjà pris, lancer le jeu directement
        console.log("✅ Selfie trouvé, lancement du jeu...");
        if (selfieScreen) selfieScreen.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'flex';
        initGame();
    } else {
        // Pas de selfie, afficher l'écran selfie
        console.log("📸 Aucun selfie, activation de la caméra...");
        if (selfieScreen) selfieScreen.style.display = 'flex';
        if (typeof initSelfie === 'function') {
            initSelfie();
        }
    }
}

// ───────────────────────────────────────────────────────
// ÉTAPE 3 : INITIALISER LE JEU
// ───────────────────────────────────────────────────────
function initGame() {
    console.log("🎮 Initialisation du jeu...");
    
    // Initialiser les modules dans l'ordre
    if (typeof initGPS === 'function') {
        initGPS();
    } else {
        console.error("❌ Module GPS non chargé !");
    }
    
    if (typeof initEnergy === 'function') {
        initEnergy();
    } else {
        console.error("❌ Module Énergie non chargé !");
    }
    
    if (typeof initAR === 'function') {
        initAR();
    } else {
        console.error("❌ Module AR non chargé !");
    }
    
    if (typeof initMoon === 'function') {
        initMoon();
    } else {
        console.error("❌ Module Lune non chargé !");
    }
    
    if (typeof initShop === 'function') {
        initShop();
    } else {
        console.error("❌ Module Boutique non chargé !");
    }
    
    console.log("✅ Jeu initialisé !");
}

// ───────────────────────────────────────────────────────
// BOUTON DÉMARRER (après le selfie)
// ───────────────────────────────────────────────────────
const startGameBtn = document.getElementById('start-game-btn');
if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        const selfieScreen = document.getElementById('selfie-screen');
        const gameContainer = document.getElementById('game-container');
        
        if (selfieScreen) selfieScreen.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'flex';
        
        initGame();
    });
}

console.log("✅ Main.js chargé");


