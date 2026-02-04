// ═══════════════════════════════════════════════════════
// GPS0S - LUNE NARRATRICE SARCASTIQUE 🌙
// ═══════════════════════════════════════════════════════

let moonMessageTimeout = null;

// ───────────────────────────────────────────────────────
// FONCTION : Initialiser la Lune
// ───────────────────────────────────────────────────────
function initMoon() {
    console.log("🌙 Lune narratrice activée");
    
    // Message de bienvenue après 2 secondes
    setTimeout(() => {
        showMoonMessage("🌙 Tiens tiens... Un nouveau joueur. Prêt à te perdre ?", 4000);
    }, 2000);
}

// ───────────────────────────────────────────────────────
// FONCTION : Afficher un message de la Lune
// ───────────────────────────────────────────────────────
function showMoonMessage(message, duration = 3000) {
    const moonDialog = document.getElementById('moon-dialog');
    const moonText = document.getElementById('moon-text');
    
    if (!moonDialog || !moonText) {
        console.warn("⚠️ Dialogue de la Lune introuvable dans le HTML");
        return;
    }

    // Annuler le timeout précédent si existant
    if (moonMessageTimeout) {
        clearTimeout(moonMessageTimeout);
    }

    // Afficher le message
    moonText.textContent = message;
    moonDialog.classList.add('active');

    console.log(`🌙 "${message}"`);

    // Masquer après la durée
    moonMessageTimeout = setTimeout(() => {
        moonDialog.classList.remove('active');
    }, duration);
}

// ───────────────────────────────────────────────────────
// MESSAGES CONTEXTUELS (appelés par d'autres modules)
// ───────────────────────────────────────────────────────

// Quand le joueur se rapproche (Zone Orange)
function moonMessageApproaching() {
    const messages = [
        "🌙 Oh, tu chauffes... mais ton cerveau refroidit.",
        "🌙 Encore un effort, ou abandonne maintenant.",
        "🌙 Tu te rapproches... comme une tortue.",
    ];
    showMoonMessage(messages[Math.floor(Math.random() * messages.length)], 3000);
}

// Quand le joueur est très proche (Zone Verte)
function moonMessageVeryClose() {
    const messages = [
        "🌙 Presque là ! Ta boussole panique, pas moi.",
        "🌙 Cherche mieux, je suis juste sous ton nez.",
        "🌙 Zone verte = cerveau rouge. Continue !",
    ];
    showMoonMessage(messages[Math.floor(Math.random() * messages.length)], 3000);
}

// Quand le joueur active l'AR
function moonMessageARActivated() {
    const messages = [
        "🌙 Ah, tu me vois enfin. Clique sur moi... si tu peux.",
        "🌙 Je suis là ! Mais je ne vais pas me laisser faire.",
        "🌙 Attrape-moi... si tu es assez rapide.",
    ];
    showMoonMessage(messages[Math.floor(Math.random() * messages.length)], 3000);
}

// Quand le joueur capture une lune
function moonMessageCaptured(pointNumber) {
    const messages = [
        `🌙 Point ${pointNumber}/9... Tu progresses, bravo petit humain.`,
        `🌙 ${pointNumber}/9. Pas mal, mais les suivantes seront plus dures.`,
        `🌙 ${pointNumber} de fait. Continue, si tu oses.`,
    ];
    showMoonMessage(messages[Math.floor(Math.random() * messages.length)], 4000);
}

// Quand l'énergie est basse (<20%)
function moonMessageLowEnergy() {
    const messages = [
        "🌙 Ta batterie est faible... comme ta motivation ?",
        "🌙 Plus d'énergie ? Va jouer aux mini-jeux, feignant.",
        "🌙 20% d'énergie... Tu vas abandonner maintenant ?",
    ];
    showMoonMessage(messages[Math.floor(Math.random() * messages.length)], 3000);
}

// Quand l'énergie atteint 0%
function moonMessageNoEnergy() {
    showMoonMessage("🌙 0% ? Vraiment ? Va recharger dans la boutique.", 4000);
}

// Quand le joueur lance un mini-jeu
function moonMessageGameStart(gameName) {
    const messages = [
        `🌙 ${gameName} ? Bon courage, tu vas en avoir besoin.`,
        `🌙 Ah, ${gameName}... Mon préféré pour te voir échouer.`,
        `🌙 ${gameName}... Essaie de ne pas pleurer.`,
    ];
    showMoonMessage(messages[Math.floor(Math.random() * messages.length)], 3000);
}

// Quand le joueur gagne un mini-jeu
function moonMessageGameWin(points) {
    const messages = [
        `🌙 +${points} pts. Pas mal... pour un débutant.`,
        `🌙 Bravo, tu as gagné ${points} pts. La chance, sûrement.`,
        `🌙 ${points} pts ? Continue, tu vas en avoir besoin.`,
    ];
    showMoonMessage(messages[Math.floor(Math.random() * messages.length)], 3000);
}

// Quand le joueur perd un mini-jeu
function moonMessageGameLose() {
    const messages = [
        "🌙 Perdu ? Quelle surprise...",
        "🌙 Même un mini-jeu, c'est trop dur pour toi ?",
        "🌙 Réessaie. Ou abandonne. Ton choix.",
    ];
    showMoonMessage(messages[Math.floor(Math.random() * messages.length)], 3000);
}

// Quand le joueur achète quelque chose
function moonMessageShopPurchase(item) {
    const messages = [
        `🌙 ${item} acheté. Tu dépenses bien ton argent virtuel.`,
        `🌙 ${item} ? Bon choix... ou pas.`,
        `🌙 Transaction validée. Continue de consommer.`,
    ];
    showMoonMessage(messages[Math.floor(Math.random() * messages.length)], 3000);
}

// Message final (9/9 lunes capturées)
function moonMessageVictory() {
    showMoonMessage("🌙 9/9... Impressionnant. Mais ce n'est que le début.", 5000);
}

// ───────────────────────────────────────────────────────
// MODULE CHARGÉ
// ───────────────────────────────────────────────────────
console.log("🌙 Module Lune narratrice chargé");
