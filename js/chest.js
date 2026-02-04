/* ═══════════════════════════════════════════════════════
   🏆 GPS0S - SYSTÈME DE COFFRE & COLLECTE DES LUNES
   Fonction : Gestion des 9 Lunes + Progression + Final
   ═══════════════════════════════════════════════════════ */

console.log("🏆 Module Coffre chargé");

// ════════════════════════════════════════════════════════════
// 🌙 NOMS DES 9 LUNES (Phases lunaires mythologiques)
// ════════════════════════════════════════════════════════════
const MOON_NAMES = [
    "🌑 Lune n°1 - Némésis",
    "🌒 Lune n°2 - Séléné",
    "🌓 Lune n°3 - Artémis",
    "🌔 Lune n°4 - Hécate",
    "🌕 Lune n°5 - Phœbé",
    "🌖 Lune n°6 - Callisto",
    "🌗 Lune n°7 - Io",
    "🌘 Lune n°8 - Europa",
    "🌚 Lune n°9 - Titan"
];

// ════════════════════════════════════════════════════════════
// 🔧 VARIABLES GLOBALES COFFRE
// ════════════════════════════════════════════════════════════
let capturedMoons = [];
let currentMoonID = 1; // ID du point GPS actuel

// ════════════════════════════════════════════════════════════
// 🚀 INITIALISATION DU COFFRE
// ════════════════════════════════════════════════════════════
function initChest() {
    console.log("🏆 Initialisation du Coffre...");

    // ──────────────────────────────────────────────────────
    // 1️⃣ CHARGER LES LUNES SAUVEGARDÉES
    // ──────────────────────────────────────────────────────
    const saved = localStorage.getItem('gps0s-captured-moons');
    if (saved) {
        try {
            capturedMoons = JSON.parse(saved);
            console.log(`📦 ${capturedMoons.length}/9 Lune(s) chargée(s)`);
        } catch (e) {
            console.warn("⚠️ Données corrompues, reset du coffre");
            capturedMoons = [];
        }
    }

    // ──────────────────────────────────────────────────────
    // 2️⃣ CHARGER LE POINT GPS ACTUEL
    // ──────────────────────────────────────────────────────
    const savedPoint = localStorage.getItem('gps0s-current-point');
    if (savedPoint) {
        currentMoonID = parseInt(savedPoint);
    }

    // ──────────────────────────────────────────────────────
    // 3️⃣ METTRE À JOUR L'INTERFACE
    // ──────────────────────────────────────────────────────
    updateChestButton();

    console.log(`✅ Coffre initialisé (Point ${currentMoonID}, ${capturedMoons.length}/9)`);
}

// ════════════════════════════════════════════════════════════
// 🌙 CAPTURE D'UNE LUNE (Appelée depuis AR)
// ════════════════════════════════════════════════════════════
function captureMoon(moonID, screenshot = null) {
    console.log(`🎯 Tentative de capture : Lune ${moonID}`);

    // ──────────────────────────────────────────────────────
    // 1️⃣ VÉRIFIER SI DÉJÀ CAPTURÉE
    // ──────────────────────────────────────────────────────
    if (isMoonCaptured(moonID)) {
        playSound('error');
        if (typeof showMoonDialog === 'function') {
            showMoonDialog("🌙 Tu l'as déjà capturée, celle-là ! 🙄", 2000);
        }
        return false;
    }

    // ──────────────────────────────────────────────────────
    // 2️⃣ CRÉER L'OBJET LUNE
    // ──────────────────────────────────────────────────────
    const moon = {
        id: moonID,
        name: MOON_NAMES[moonID - 1],
        timestamp: Date.now(),
        image: screenshot || null
    };

    // ──────────────────────────────────────────────────────
    // 3️⃣ AJOUTER AU COFFRE
    // ──────────────────────────────────────────────────────
    capturedMoons.push(moon);
    saveMoons();

    // ──────────────────────────────────────────────────────
    // 4️⃣ SONS & ANIMATIONS
    // ──────────────────────────────────────────────────────
    playSound('moon-collected');
    playSound('victory');

    // ──────────────────────────────────────────────────────
    // 5️⃣ MESSAGES SELON LA PROGRESSION
    // ──────────────────────────────────────────────────────
    const progress = capturedMoons.length;

    if (progress === 9) {
        // 🎉 TOUTES LES LUNES COLLECTÉES
        if (typeof showMoonDialog === 'function') {
            showMoonDialog("🎉 LES 9 LUNES ! T'as enfin fini... Bravo, je suppose. 👏", 5000);
        }
        setTimeout(() => {
            triggerFinalSequence();
        }, 5000);

    } else {
        // 📢 MESSAGE DE PROGRESSION
        const messages = [
            `✨ ${moon.name} capturée ! (${progress}/9)`,
            `🌙 Bien joué ! Plus que ${9 - progress} à trouver.`,
            `👏 ${progress}/9. Continue comme ça, champion.`,
            `🎯 Encore ${9 - progress} et c'est fini. Courage !`
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        
        if (typeof showMoonDialog === 'function') {
            showMoonDialog(randomMsg, 3000);
        }

        // Débloquer le prochain point GPS
        unlockNextPoint();
    }

    // ──────────────────────────────────────────────────────
    // 6️⃣ METTRE À JOUR L'INTERFACE
    // ──────────────────────────────────────────────────────
    updateChestButton();
    pulseChestButton();

    console.log(`✅ Lune ${moonID} capturée ! (${capturedMoons.length}/9)`);
    return true;
}

// ════════════════════════════════════════════════════════════
// 🔓 DÉBLOCAGE DU PROCHAIN POINT GPS
// ════════════════════════════════════════════════════════════
function unlockNextPoint() {
    if (currentMoonID < 9) {
        currentMoonID++;
        localStorage.setItem('gps0s-current-point', currentMoonID.toString());

        // Mettre à jour la cible GPS (fonction dans gps.js)
        if (typeof setGPSTarget === 'function') {
            setGPSTarget(currentMoonID - 1); // Index 0-8
        }

        playSound('unlock');

        if (typeof showMoonDialog === 'function') {
            showMoonDialog(`🗺️ Prochain objectif : ${MOON_NAMES[currentMoonID - 1]}`, 3000);
        }

        console.log(`🎯 Point GPS ${currentMoonID} débloqué`);
    }
}

// ════════════════════════════════════════════════════════════
// 🔍 VÉRIFICATIONS & GETTERS
// ════════════════════════════════════════════════════════════
function isMoonCaptured(moonID) {
    return capturedMoons.some(moon => moon.id === moonID);
}

function getMoonByID(moonID) {
    return capturedMoons.find(moon => moon.id === moonID);
}

function getProgress() {
    return {
        current: capturedMoons.length,
        total: 9,
        percentage: Math.round((capturedMoons.length / 9) * 100)
    };
}

function getCurrentMoonID() {
    return currentMoonID;
}

// ════════════════════════════════════════════════════════════
// 💾 SAUVEGARDE & RESET
// ════════════════════════════════════════════════════════════
function saveMoons() {
    localStorage.setItem('gps0s-captured-moons', JSON.stringify(capturedMoons));
    console.log("💾 Coffre sauvegardé");
}

function resetChest() {
    if (confirm("⚠️ Réinitialiser le coffre ? (Toutes les Lunes seront perdues)")) {
        capturedMoons = [];
        currentMoonID = 1;

        localStorage.removeItem('gps0s-captured-moons');
        localStorage.setItem('gps0s-current-point', '1');

        updateChestButton();
        closeChest();

        playSound('error');

        if (typeof showMoonDialog === 'function') {
            showMoonDialog("🗑️ Coffre vidé. Recommence depuis le début !", 3000);
        }

        console.log("🗑️ Coffre réinitialisé");
    }
}

// ════════════════════════════════════════════════════════════
// 🎨 INTERFACE : BOUTON COFFRE (HUD)
// ════════════════════════════════════════════════════════════
function updateChestButton() {
    const btn = document.getElementById('btn-chest');
    if (!btn) return;

    const count = capturedMoons.length;
    const countSpan = btn.querySelector('.count');

    if (countSpan) {
        countSpan.textContent = `${count}/9`;
    }

    // Changer la couleur selon la progression
    if (count === 0) {
        btn.style.borderColor = '#666';
        btn.style.boxShadow = 'none';
    } else if (count < 9) {
        btn.style.borderColor = '#00ffff';
        btn.style.boxShadow = '0 0 15px #00ffff';
    } else {
        btn.style.borderColor = '#00ff00';
        btn.style.boxShadow = '0 0 20px #00ff00';
        btn.style.animation = 'pulse 1s infinite';
    }
}

function pulseChestButton() {
    const btn = document.getElementById('btn-chest');
    if (!btn) return;

    btn.classList.add('pulse-animation');
    setTimeout(() => {
        btn.classList.remove('pulse-animation');
    }, 1000);
}

// ════════════════════════════════════════════════════════════
// 📦 MODAL COFFRE (Grille des 9 Lunes)
// ════════════════════════════════════════════════════════════
function openChest() {
    const modal = document.getElementById('modal-chest');
    if (!modal) {
        console.error("❌ Modal 'modal-chest' introuvable");
        return;
    }

    playSound('open-chest');

    // ──────────────────────────────────────────────────────
    // 1️⃣ GÉNÉRER LA GRILLE DES 9 LUNES
    // ──────────────────────────────────────────────────────
    const grid = document.getElementById('moon-collection');
    if (grid) {
        grid.innerHTML = '';

        for (let i = 1; i <= 9; i++) {
            const moon = getMoonByID(i);
            const captured = moon !== undefined;

            const card = document.createElement('div');
            card.className = `moon-card ${captured ? 'captured' : 'locked'}`;
            card.dataset.moonId = i;

            card.innerHTML = `
                <div class="moon-icon">
                    ${captured ? '🌕' : '🌑'}
                </div>
                <div class="moon-name">
                    ${captured ? MOON_NAMES[i - 1] : '???'}
                </div>
                ${captured ? `
                    <div class="moon-date">
                        ${formatDate(moon.timestamp)}
                    </div>
                ` : ''}
            `;

            // Clic sur une Lune capturée → Détails
            if (captured) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    showMoonDetails(moon);
                });
            }

            grid.appendChild(card);
        }
    }

    // ──────────────────────────────────────────────────────
    // 2️⃣ AFFICHER LA PROGRESSION
    // ──────────────────────────────────────────────────────
    const progress = getProgress();
    const progressText = document.getElementById('chest-progress');
    if (progressText) {
        progressText.textContent = `${progress.current}/9 Lunes collectées (${progress.percentage}%)`;
    }

    modal.style.display = 'flex';
    console.log("📦 Coffre ouvert");
}

function closeChest() {
    const modal = document.getElementById('modal-chest');
    if (modal) {
        modal.style.display = 'none';
    }
    playSound('close');
}

// ════════════════════════════════════════════════════════════
// 🔍 DÉTAILS D'UNE LUNE (Modal secondaire)
// ════════════════════════════════════════════════════════════
function showMoonDetails(moon) {
    const detailsHTML = `
        <div class="moon-details">
            <h3>${moon.name}</h3>
            <p class="moon-emoji">🌕</p>
            <p><strong>Capturée le :</strong><br>${formatDateTime(moon.timestamp)}</p>
            ${moon.image ? `<img src="${moon.image}" alt="Screenshot AR" class="moon-screenshot">` : ''}
            <button onclick="closeMoonDetails()" class="btn-close">Fermer</button>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'moon-details-overlay';
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.innerHTML = detailsHTML;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Fermer en cliquant à l'extérieur
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeMoonDetails();
        }
    });

    playSound('click');
}

function closeMoonDetails() {
    const overlay = document.getElementById('moon-details-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// ════════════════════════════════════════════════════════════
// 📅 UTILITAIRES DE FORMATAGE
// ════════════════════════════════════════════════════════════
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
    });
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ════════════════════════════════════════════════════════════
// 🎬 SÉQUENCE FINALE (9/9 LUNES COLLECTÉES)
// ════════════════════════════════════════════════════════════
function triggerFinalSequence() {
    console.log("🎬 SÉQUENCE FINALE DÉCLENCHÉE !");

    // Arrêter la musique d'exploration
    if (typeof stopMusic === 'function') {
        stopMusic(true);
    }

    // Attendre le fade out
    setTimeout(() => {
        // Lancer la musique finale
        if (typeof playMusic === 'function') {
            playMusic('final');
        }

        // Masquer le jeu principal
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.transition = 'opacity 2s';
            gameContainer.style.opacity = '0';

            setTimeout(() => {
                gameContainer.style.display = 'none';
                showFinalScreen();
            }, 2000);
        } else {
            showFinalScreen();
        }
    }, 500);
}

// ════════════════════════════════════════════════════════════
// 🏆 ÉCRAN FINAL (Statistiques + Crédits)
// ════════════════════════════════════════════════════════════
function showFinalScreen() {
    // Calculer le temps total
    const startTime = localStorage.getItem('gps0s-start-time');
    const totalTime = startTime ? Math.floor((Date.now() - parseInt(startTime)) / 1000 / 60) : 0;

    // Récupérer le selfie
    const selfie = localStorage.getItem('gps0s-selfie');

    // Récupérer l'énergie (si disponible)
    const energy = (typeof getEnergy === 'function') ? getEnergy() : 'N/A';

    // Récupérer les points (si disponibles)
    const points = (typeof getPoints === 'function') ? getPoints() : 'N/A';

    const finalScreen = document.createElement('div');
    finalScreen.id = 'final-screen';
    finalScreen.className = 'final-screen';
    finalScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #0a0a0a, #1a1a2e);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 2s;
    `;

    finalScreen.innerHTML = `
        <div class="final-content" style="text-align: center; color: #fff; font-family: 'Press Start 2P', monospace;">
            <h1 class="glitch" data-text="MISSION ACCOMPLIE" style="font-size: 2.5em; margin-bottom: 30px; color: #00ff88;">
                MISSION ACCOMPLIE
            </h1>

            ${selfie ? `<img src="${selfie}" alt="Ton selfie" class="final-selfie" style="width: 150px; height: 150px; border-radius: 50%; border: 3px solid #00ff88; margin-bottom: 30px;">` : ''}

            <div class="final-stats" style="margin: 30px 0; font-size: 1em;">
                <p>🌕 <strong>9/9 Lunes collectées</strong></p>
                <p>⏱️ Temps total : <strong>${totalTime} minutes</strong></p>
                <p>⚡ Énergie restante : <strong>${energy}%</strong></p>
                <p>🎮 Points : <strong>${points}</strong></p>
            </div>

            <div class="final-message" style="margin: 30px 0; font-size: 0.9em; color: #ffaa00;">
                <p class="moon-speech">"Bon, je dois l'admettre... T'as bien joué."</p>
                <p class="moon-speech">"Mais je te surveillerai toujours. 🌙"</p>
            </div>

            <h2 class="final-word" style="font-size: 3em; margin: 40px 0; color: #ff0088;">FIN</h2>

            <button onclick="resetGame()" class="btn-final" style="
                padding: 15px 40px;
                font-size: 1em;
                background: linear-gradient(135deg, #ff0088, #cc0066);
                border: 2px solid #fff;
                color: #fff;
                cursor: pointer;
                font-family: 'Press Start 2P', monospace;
                border-radius: 10px;
            ">
                Recommencer
            </button>
        </div>
    `;

    document.body.appendChild(finalScreen);

    // Animation d'apparition
    setTimeout(() => {
        finalScreen.style.opacity = '1';
    }, 100);

    console.log("🎬 Écran final affiché");
}

function resetGame() {
    if (confirm("🔄 Recommencer une nouvelle partie ? (Toutes les données seront effacées)")) {
        localStorage.clear();
        location.reload();
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
// 🌙 EXPORT POUR DEBUG
// ════════════════════════════════════════════════════════════
window.ChestDebug = {
    moons: () => capturedMoons,
    progress: getProgress,
    current: getCurrentMoonID,
    capture: (id) => captureMoon(id),
    reset: resetChest,
    final: triggerFinalSequence
};

console.log("✅ Module Coffre chargé - Tapez ChestDebug dans la console");
