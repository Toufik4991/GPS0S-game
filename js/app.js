/* ═══════════════════════════════════════════════════════
   🚀 GPS0S - INITIALISATION PRINCIPALE
   Fonction : Orchestre tous les modules du jeu
   ═══════════════════════════════════════════════════════ */

console.log("🚀 GPS0S - App.js chargé");

// ════════════════════════════════════════════════════════════
// 🎮 FONCTION PRINCIPALE : INITIALISER LE JEU
// ════════════════════════════════════════════════════════════
function initGame() {
    console.log("🎮 Initialisation du jeu...");

    // ──────────────────────────────────────────────────────
    // 1️⃣ VÉRIFIER SI LE JEU EST DÉJÀ DÉMARRÉ
    // ──────────────────────────────────────────────────────
    if (localStorage.getItem('gameStarted') === 'true') {
        console.log("⚠️ Jeu déjà initialisé");
        return;
    }

    // ──────────────────────────────────────────────────────
    // 2️⃣ INITIALISER TOUS LES MODULES
    // ──────────────────────────────────────────────────────
    console.log("📦 Chargement des modules...");

    // Stockage
    if (typeof initStorage === 'function') {
        initStorage();
    }

    // Audio
    if (typeof initAudio === 'function') {
        initAudio();
    }

    // GPS & Géolocalisation
    if (typeof initGPS === 'function') {
        initGPS();
    } else {
        console.error("❌ Module gps.js non chargé !");
    }

    // Énergie
    if (typeof initEnergy === 'function') {
        initEnergy();
    } else {
        console.error("❌ Module energy.js non chargé !");
    }

    // Boussole
    if (typeof initCompass === 'function') {
        initCompass();
    } else {
        console.error("❌ Module compass.js non chargé !");
    }

    // Réalité Augmentée
    if (typeof initAR === 'function') {
        initAR();
    } else {
        console.error("❌ Module ar.js non chargé !");
    }

    // Lune Narratrice
    if (typeof initMoon === 'function') {
        initMoon();
    } else {
        console.error("❌ Module moon.js non chargé !");
    }

    // Boutique
    if (typeof initShop === 'function') {
        initShop();
    } else {
        console.error("❌ Module shop.js non chargé !");
    }

    // Coffre
    if (typeof initChest === 'function') {
        initChest();
    } else {
        console.error("❌ Module chest.js non chargé !");
    }

    // Mini-jeux
    if (typeof initMinigames === 'function') {
        initMinigames();
    }

    // ──────────────────────────────────────────────────────
    // 3️⃣ ENREGISTRER L'HEURE DE DÉBUT
    // ──────────────────────────────────────────────────────
    if (!localStorage.getItem('startTime')) {
        localStorage.setItem('startTime', Date.now().toString());
    }

    // ──────────────────────────────────────────────────────
    // 4️⃣ MESSAGE DE BIENVENUE DE LA LUNE
    // ──────────────────────────────────────────────────────
    setTimeout(() => {
        if (typeof showMoonMessage === 'function') {
            showMoonMessage(
                "🌙 Bienvenue, mortel(le). Je suis la Lune, ta guide sarcastique. " +
                "Va chercher mes 9 fragments... si t'en es capable.",
                5000
            );
        }
    }, 1000);

    // ──────────────────────────────────────────────────────
    // 5️⃣ JOUER LA MUSIQUE DE FOND
    // ──────────────────────────────────────────────────────
    if (typeof playMusic === 'function') {
        playMusic('gameplay');
    }

    // ──────────────────────────────────────────────────────
    // 6️⃣ MARQUER LE JEU COMME DÉMARRÉ
    // ──────────────────────────────────────────────────────
    localStorage.setItem('gameStarted', 'true');

    console.log("✅ Jeu initialisé avec succès !");
}

// ════════════════════════════════════════════════════════════
// 🔧 FONCTION POUR MARQUER LE JEU COMME DÉMARRÉ
// ════════════════════════════════════════════════════════════
function markGameStarted() {
    localStorage.setItem('gameStarted', 'true');
    console.log("✅ Jeu marqué comme démarré");
}

// ════════════════════════════════════════════════════════════
// 🔧 MODE DÉVELOPPEUR
// ════════════════════════════════════════════════════════════
const DEV_CODE = "MOON42";

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDevMode);
} else {
    initDevMode();
}

function initDevMode() {
    const btnActivateDev = document.getElementById('btn-activate-dev');
    if (btnActivateDev) {
        btnActivateDev.addEventListener('click', () => {
            const input = document.getElementById('dev-code-input');
            const status = document.getElementById('dev-status');
            const panel = document.getElementById('dev-panel');

            if (input && input.value === DEV_CODE) {
                status.classList.remove('hidden');
                panel.classList.remove('hidden');
                localStorage.setItem('devMode', 'true');
                console.log("🔧 Mode Dev activé");
            } else {
                alert("❌ Code incorrect");
            }
        });
        console.log("🔧 Bouton Dev Mode connecté");
    }
}

// ════════════════════════════════════════════════════════════
// 🎮 EXPORT POUR DEBUG
// ════════════════════════════════════════════════════════════
window.GameDebug = {
    restart: () => {
        if (confirm("🔄 Recommencer le jeu ?")) {
            localStorage.clear();
            location.reload();
        }
    },
    skipSelfie: () => {
        localStorage.setItem('playerSelfie', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        location.reload();
    },
    modules: () => {
        console.log("📦 Modules chargés:");
        console.log("GPS:", typeof initGPS !== 'undefined');
        console.log("Energy:", typeof initEnergy !== 'undefined');
        console.log("Compass:", typeof initCompass !== 'undefined');
        console.log("AR:", typeof initAR !== 'undefined');
        console.log("Shop:", typeof initShop !== 'undefined');
        console.log("Chest:", typeof initChest !== 'undefined');
        console.log("Moon:", typeof initMoon !== 'undefined');
        console.log("Minigames:", typeof initMinigames !== 'undefined');
    },
    forceInit: () => {
        console.log("🚀 Forcer l'initialisation...");
        initGame();
    }
};

console.log("✅ App.js chargé - Tapez GameDebug dans la console");
