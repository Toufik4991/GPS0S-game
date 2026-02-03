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
// FONCTION : Démarrer la consommation d'énergie
// ───────────────────────────────────────────────────────
function startEnergyConsumption() {
    if (energyInterval) return; // Déjà en cours
    
    energyInterval = setInterval(() => {
        if (currentEnergy > 0) {
            currentEnergy -= 1;
            updateEnergyDisplay();
            
            if (currentEnergy === 0) {
                console.log("⚠️ Plus d'énergie ! Boussole désactivée.");
                stopCompass(); // On verra cette fonction après
            }
        }
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
    showMoonMessage(`Ah, tu te réveilles enfin ? +${amount}% d'énergie. Ne me remercie pas.`);
}

// ───────────────────────────────────────────────────────
// FONCTION : Afficher un message de la Lune
// ───────────────────────────────────────────────────────
function showMoonMessage(text) {
    const moonDialog = document.getElementById('moon-dialog');
    moonDialog.textContent = text;
    moonDialog.style.display = 'block';
    
    setTimeout(() => {
        moonDialog.style.display = 'none';
    }, 3000); // Disparaît après 3 secondes
}
