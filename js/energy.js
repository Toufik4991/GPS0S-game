// ═══════════════════════════════════════════════════════
// GPS0S - GESTION DE L'ÉNERGIE
// ═══════════════════════════════════════════════════════

let currentEnergy = 100; // Énergie de départ
let energyInterval = null; // Timer pour la consommation

// ───────────────────────────────────────────────────────
// FONCTION : Initialiser le système d'énergie
// ───────────────────────────────────────────────────────
function initEnergy() {
    updateEnergyDisplay();
    console.log("🔋 Système d'énergie initialisé (100%)");
}

// ───────────────────────────────────────────────────────
// FONCTION : Mettre à jour l'affichage de l'énergie
// ───────────────────────────────────────────────────────
function updateEnergyDisplay() {
    const energyBar = document.getElementById('energy-bar');
    const energyText = document.getElementById('energy-text');

    if (!energyBar || !energyText) {
        console.error("❌ Éléments d'énergie introuvables !");
        return;
    }

    energyBar.style.width = currentEnergy + '%';
    energyText.textContent = currentEnergy + '%';

    // Changer la couleur selon le niveau
    if (currentEnergy > 50) {
        energyBar.style.background = 'linear-gradient(90deg, #00ff88, #00cc66)';
    } else if (currentEnergy > 20) {
        energyBar.style.background = 'linear-gradient(90deg, #ffaa00, #ff8800)';
    } else {
        energyBar.style.background = 'linear-gradient(90deg, #ff0044, #cc0033)';
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Consommer de l'énergie (appelée par compass.js)
// ───────────────────────────────────────────────────────
function consumeEnergy(amount) {
    if (currentEnergy > 0) {
        currentEnergy = Math.max(0, currentEnergy - amount);
        updateEnergyDisplay();

        if (currentEnergy === 0) {
            console.log("⚠️ Plus d'énergie ! Boussole désactivée.");

            // ✅ Appeler la fonction de compass.js
            if (typeof deactivateCompass === 'function') {
                deactivateCompass();
            }

            // Message de la Lune
            if (typeof showMoonMessage === 'function') {
                showMoonMessage("🌙 À sec ? Joue aux mini-jeux pour recharger, génie.", 4000);
            }
        }
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Démarrer la consommation d'énergie
// ───────────────────────────────────────────────────────
function startEnergyConsumption() {
    if (energyInterval) return; // Déjà en cours

    energyInterval = setInterval(() => {
        consumeEnergy(1);
    }, 3000); // -1% toutes les 3 secondes

    console.log("⚡ Consommation d'énergie démarrée");
}

// ───────────────────────────────────────────────────────
// FONCTION : Arrêter la consommation d'énergie
// ───────────────────────────────────────────────────────
function stopEnergyConsumption() {
    if (energyInterval) {
        clearInterval(energyInterval);
        energyInterval = null;
        console.log("🛑 Consommation d'énergie arrêtée");
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Recharger l'énergie (via mini-jeux)
// ───────────────────────────────────────────────────────
function rechargeEnergy(amount) {
    currentEnergy = Math.min(100, currentEnergy + amount);
    updateEnergyDisplay();
    console.log(`⚡ +${amount}% d'énergie ! (Total: ${currentEnergy}%)`);

    // Message de la Lune
    if (typeof showMoonMessage === 'function') {
        showMoonMessage(`🌙 Ah, tu te réveilles ? +${amount}% d'énergie. Ne me remercie pas.`, 3000);
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Obtenir l'énergie actuelle (getter)
// ───────────────────────────────────────────────────────
function getCurrentEnergy() {
    return currentEnergy;
}

// ───────────────────────────────────────────────────────
// MODULE CHARGÉ (Pas d'auto-init)
// ───────────────────────────────────────────────────────
console.log("🔋 Module Énergie chargé (en attente d'activation par main.js)");
