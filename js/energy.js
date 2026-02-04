/* ═══════════════════════════════════════════════════════
   🔋 GPS0S - GESTION DE L'ÉNERGIE
   Fonction : Barre d'énergie + Consommation boussole
   ═══════════════════════════════════════════════════════ */

console.log("🔋 Module Énergie chargé");

// ════════════════════════════════════════════════════════════
// 🔧 VARIABLES GLOBALES ÉNERGIE
// ════════════════════════════════════════════════════════════
let currentEnergy = 100;        // Énergie de départ (0-100%)
let energyInterval = null;      // Timer pour la consommation
let lowEnergyWarned = false;    // Pour n'alerter qu'une fois à 20%

// ════════════════════════════════════════════════════════════
// 🚀 INITIALISATION DU SYSTÈME D'ÉNERGIE
// ════════════════════════════════════════════════════════════
function initEnergy() {
    // Charger l'énergie sauvegardée (si elle existe)
    const savedEnergy = localStorage.getItem('gps0s-energy');
    if (savedEnergy !== null) {
        currentEnergy = parseInt(savedEnergy);
        console.log(`🔋 Énergie restaurée : ${currentEnergy}%`);
    }

    updateEnergyDisplay();
    console.log("✅ Système d'énergie initialisé");
}

// ════════════════════════════════════════════════════════════
// 🎨 METTRE À JOUR L'AFFICHAGE DE LA BARRE
// ════════════════════════════════════════════════════════════
function updateEnergyDisplay() {
    const energyBar = document.getElementById('energy-bar');
    const energyText = document.getElementById('energy-text');

    if (!energyBar || !energyText) {
        console.error("❌ Éléments 'energy-bar' ou 'energy-text' introuvables !");
        return;
    }

    // Mise à jour de la largeur
    energyBar.style.width = currentEnergy + '%';
    energyText.textContent = currentEnergy + '%';

    // Couleur dynamique selon le niveau
    if (currentEnergy > 50) {
        energyBar.style.background = 'linear-gradient(90deg, #00ff88, #00cc66)';
        energyBar.style.boxShadow = '0 0 10px #00ff88';
    } else if (currentEnergy > 20) {
        energyBar.style.background = 'linear-gradient(90deg, #ffaa00, #ff8800)';
        energyBar.style.boxShadow = '0 0 10px #ffaa00';
    } else {
        energyBar.style.background = 'linear-gradient(90deg, #ff0044, #cc0033)';
        energyBar.style.boxShadow = '0 0 10px #ff0044';
        
        // Animation de pulsation en mode critique
        energyBar.style.animation = 'pulse 1s infinite';
    }

    // Sauvegarder dans localStorage
    localStorage.setItem('gps0s-energy', currentEnergy);
}

// ════════════════════════════════════════════════════════════
// ⚡ CONSOMMER DE L'ÉNERGIE
// ════════════════════════════════════════════════════════════
function consumeEnergy(amount) {
    if (currentEnergy <= 0) {
        return; // Déjà vide
    }

    currentEnergy = Math.max(0, currentEnergy - amount);
    updateEnergyDisplay();

    console.log(`⚡ Consommation : -${amount}% (Restant: ${currentEnergy}%)`);

    // Alerte à 20%
    if (currentEnergy === 20 && !lowEnergyWarned) {
        lowEnergyWarned = true;
        playSound('energy-low');
        
        if (typeof showMoonDialog === 'function') {
            showMoonDialog("🌙 Attention ! 20% d'énergie. Tu vas morfler bientôt.", 3000);
        }
    }

    // Énergie épuisée
    if (currentEnergy === 0) {
        onEnergyDepleted();
    }
}

// ════════════════════════════════════════════════════════════
// 🚨 GESTION DE L'ÉNERGIE ÉPUISÉE
// ════════════════════════════════════════════════════════════
function onEnergyDepleted() {
    console.log("🚨 ÉNERGIE ÉPUISÉE !");

    // Arrêter la consommation
    stopEnergyConsumption();

    // Désactiver la boussole
    if (typeof stopCompass === 'function') {
        stopCompass();
    }

    // Son d'alerte
    playSound('energy-depleted');

    // Message de la Lune
    if (typeof showMoonDialog === 'function') {
        showMoonDialog("🌙 À sec ? Tu veux que je t'applaudisse ? Va jouer aux mini-jeux pour recharger.", 5000);
    }

    // Afficher la modale des mini-jeux
    if (typeof showMinigamesModal === 'function') {
        setTimeout(() => {
            showMinigamesModal();
        }, 2000);
    }

    lowEnergyWarned = false; // Reset pour la prochaine fois
}

// ════════════════════════════════════════════════════════════
// ▶️ DÉMARRER LA CONSOMMATION (Appelée par compass.js)
// ════════════════════════════════════════════════════════════
function startEnergyConsumption() {
    if (energyInterval) {
        console.warn("⚠️ Consommation déjà active");
        return;
    }

    energyInterval = setInterval(() => {
        consumeEnergy(1); // -1% toutes les 3 secondes
    }, 3000);

    console.log("⚡ Consommation d'énergie démarrée (-1% / 3s)");
}

// ════════════════════════════════════════════════════════════
// ⏸️ ARRÊTER LA CONSOMMATION
// ════════════════════════════════════════════════════════════
function stopEnergyConsumption() {
    if (energyInterval) {
        clearInterval(energyInterval);
        energyInterval = null;
        console.log("🛑 Consommation d'énergie arrêtée");
    }
}

// ════════════════════════════════════════════════════════════
// ⚡ RECHARGER L'ÉNERGIE (Récompense mini-jeu)
// ════════════════════════════════════════════════════════════
function rechargeEnergy(amount) {
    const oldEnergy = currentEnergy;
    currentEnergy = Math.min(100, currentEnergy + amount);
    updateEnergyDisplay();

    const actualGain = currentEnergy - oldEnergy;

    console.log(`⚡ Recharge : +${actualGain}% (Total: ${currentEnergy}%)`);

    // Son de recharge
    playSound('energy-recharge');

    // Message de la Lune
    if (typeof showMoonDialog === 'function') {
        const messages = [
            `🌙 Ah, tu te réveilles ? +${actualGain}% d'énergie. Ne me remercie pas.`,
            `🌙 +${actualGain}% ! Tu vois, c'était pas si dur. Continue.`,
            `🌙 Bien joué ! +${actualGain}% d'énergie. Tu progresses... lentement.`,
            `🌙 Tiens, cadeau : +${actualGain}%. Maintenant bouge-toi !`
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        showMoonDialog(randomMsg, 3000);
    }

    // Animation visuelle (effet de recharge)
    const energyBar = document.getElementById('energy-bar');
    if (energyBar) {
        energyBar.style.animation = 'recharge-flash 0.5s';
        setTimeout(() => {
            energyBar.style.animation = '';
        }, 500);
    }

    // Reset du warning si on repasse au-dessus de 20%
    if (currentEnergy > 20) {
        lowEnergyWarned = false;
    }
}

// ════════════════════════════════════════════════════════════
// 📊 GETTER/SETTER POUR LES AUTRES MODULES
// ════════════════════════════════════════════════════════════
function getEnergy() {
    return currentEnergy;
}

function setEnergy(value) {
    currentEnergy = Math.max(0, Math.min(100, value));
    updateEnergyDisplay();
}

// ════════════════════════════════════════════════════════════
// 💰 ACHETER DE L'ÉNERGIE (BOUTIQUE)
// ════════════════════════════════════════════════════════════
function buyEnergy(points, energyAmount) {
    // Vérifier si le joueur a assez de points
    if (typeof getPoints === 'function') {
        const currentPoints = getPoints();
        if (currentPoints < points) {
            alert(`⚠️ Pas assez de points ! (${currentPoints}/${points})`);
            return false;
        }

        // Dépenser les points
        if (typeof spendPoints === 'function') {
            spendPoints(points);
        }

        // Recharger l'énergie
        rechargeEnergy(energyAmount);

        playSound('purchase');
        console.log(`💰 Achat : ${energyAmount}% d'énergie pour ${points} points`);
        return true;
    }
    return false;
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
window.EnergyDebug = {
    get: getEnergy,
    set: setEnergy,
    recharge: rechargeEnergy,
    consume: consumeEnergy,
    reset: () => {
        currentEnergy = 100;
        updateEnergyDisplay();
        console.log("🔄 Énergie réinitialisée à 100%");
    }
};

console.log("✅ Module Énergie chargé - Tapez EnergyDebug dans la console");
