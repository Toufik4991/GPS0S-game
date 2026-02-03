// ═══════════════════════════════════════════════════════
// GPS0S - GESTION DU STOCKAGE LOCAL
// ═══════════════════════════════════════════════════════

const STORAGE_KEYS = {
    SELFIE: 'gps0s_selfie',
    CURRENT_POINT: 'gps0s_current_point',
    ENERGY: 'gps0s_energy',
    MOONS_COLLECTED: 'gps0s_moons_collected',
    GAME_STARTED: 'gps0s_game_started',
    PLAYER_NAME: 'gps0s_player_name',
    HIGH_SCORE: 'gps0s_high_score',
    TOTAL_TIME: 'gps0s_total_time',
    START_TIME: 'gps0s_start_time'
};

// ───────────────────────────────────────────────────────
// FONCTION : Sauvegarder le selfie
// ───────────────────────────────────────────────────────
function saveSelfie(imageData) {
    try {
        localStorage.setItem(STORAGE_KEYS.SELFIE, imageData);
        console.log("✅ Selfie sauvegardé");
        return true;
    } catch (e) {
        console.error("❌ Erreur sauvegarde selfie:", e);
        return false;
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Récupérer le selfie
// ───────────────────────────────────────────────────────
function getSelfie() {
    return localStorage.getItem(STORAGE_KEYS.SELFIE);
}

// ───────────────────────────────────────────────────────
// FONCTION : Vérifier si un selfie existe
// ───────────────────────────────────────────────────────
function hasSelfie() {
    return localStorage.getItem(STORAGE_KEYS.SELFIE) !== null;
}

// ───────────────────────────────────────────────────────
// FONCTION : Supprimer le selfie
// ───────────────────────────────────────────────────────
function deleteSelfie() {
    localStorage.removeItem(STORAGE_KEYS.SELFIE);
    console.log("🗑️ Selfie supprimé");
}

// ───────────────────────────────────────────────────────
// FONCTION : Sauvegarder le point GPS actuel
// ───────────────────────────────────────────────────────
function saveCurrentPoint(pointIndex) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_POINT, pointIndex.toString());
    console.log(`💾 Point ${pointIndex + 1} sauvegardé`);
}

// ───────────────────────────────────────────────────────
// FONCTION : Récupérer le point GPS actuel
// ───────────────────────────────────────────────────────
function getCurrentPoint() {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_POINT);
    return saved ? parseInt(saved) : 0;
}

// ───────────────────────────────────────────────────────
// FONCTION : Sauvegarder l'énergie
// ───────────────────────────────────────────────────────
function saveEnergy(energyValue) {
    localStorage.setItem(STORAGE_KEYS.ENERGY, energyValue.toString());
}

// ───────────────────────────────────────────────────────
// FONCTION : Récupérer l'énergie
// ───────────────────────────────────────────────────────
function getEnergy() {
    const saved = localStorage.getItem(STORAGE_KEYS.ENERGY);
    return saved ? parseInt(saved) : 100;
}

// ───────────────────────────────────────────────────────
// FONCTION : Sauvegarder les lunes collectées
// ───────────────────────────────────────────────────────
function saveMoonsCollected(moonsArray) {
    localStorage.setItem(STORAGE_KEYS.MOONS_COLLECTED, JSON.stringify(moonsArray));
}

// ───────────────────────────────────────────────────────
// FONCTION : Récupérer les lunes collectées
// ───────────────────────────────────────────────────────
function getMoonsCollected() {
    const saved = localStorage.getItem(STORAGE_KEYS.MOONS_COLLECTED);
    return saved ? JSON.parse(saved) : [];
}

// ───────────────────────────────────────────────────────
// FONCTION : Sauvegarder le temps de démarrage
// ───────────────────────────────────────────────────────
function saveStartTime() {
    const startTime = Date.now();
    localStorage.setItem(STORAGE_KEYS.START_TIME, startTime.toString());
    console.log("⏱️ Timer démarré");
}

// ───────────────────────────────────────────────────────
// FONCTION : Calculer le temps total de jeu
// ───────────────────────────────────────────────────────
function getTotalPlayTime() {
    const startTime = localStorage.getItem(STORAGE_KEYS.START_TIME);
    if (!startTime) return 0;

    const elapsed = Date.now() - parseInt(startTime);
    return Math.floor(elapsed / 1000); // En secondes
}

// ───────────────────────────────────────────────────────
// FONCTION : Formater le temps (secondes → MM:SS)
// ───────────────────────────────────────────────────────
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ───────────────────────────────────────────────────────
// FONCTION : Sauvegarder le nom du joueur
// ───────────────────────────────────────────────────────
function savePlayerName(name) {
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name);
}

// ───────────────────────────────────────────────────────
// FONCTION : Récupérer le nom du joueur
// ───────────────────────────────────────────────────────
function getPlayerName() {
    return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || 'Joueur';
}

// ───────────────────────────────────────────────────────
// FONCTION : Sauvegarder le meilleur score
// ───────────────────────────────────────────────────────
function saveHighScore(score) {
    const currentBest = getHighScore();
    if (score > currentBest) {
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
        console.log(`🏆 Nouveau record : ${score} points !`);
        return true;
    }
    return false;
}

// ───────────────────────────────────────────────────────
// FONCTION : Récupérer le meilleur score
// ───────────────────────────────────────────────────────
function getHighScore() {
    const saved = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return saved ? parseInt(saved) : 0;
}

// ───────────────────────────────────────────────────────
// FONCTION : Vérifier si une partie est en cours
// ───────────────────────────────────────────────────────
function hasGameStarted() {
    return localStorage.getItem(STORAGE_KEYS.GAME_STARTED) === 'true';
}

// ───────────────────────────────────────────────────────
// FONCTION : Marquer le jeu comme démarré
// ───────────────────────────────────────────────────────
function markGameStarted() {
    localStorage.setItem(STORAGE_KEYS.GAME_STARTED, 'true');
    saveStartTime();
}

// ───────────────────────────────────────────────────────
// FONCTION : Réinitialiser la partie
// ───────────────────────────────────────────────────────
function resetGame() {
    const keepSelfie = getSelfie(); // On garde le selfie
    const keepName = getPlayerName(); // On garde le nom
    const keepHighScore = getHighScore(); // On garde le record

    localStorage.clear();

    // Restaurer les données persistantes
    if (keepSelfie) saveSelfie(keepSelfie);
    if (keepName) savePlayerName(keepName);
    if (keepHighScore) saveHighScore(keepHighScore);

    console.log("🔄 Partie réinitialisée");
}

// ───────────────────────────────────────────────────────
// FONCTION : Supprimer TOUTES les données
// ───────────────────────────────────────────────────────
function clearAllData() {
    localStorage.clear();
    console.log("🗑️ Toutes les données supprimées");
}

// ───────────────────────────────────────────────────────
// FONCTION : Obtenir un résumé de la sauvegarde
// ───────────────────────────────────────────────────────
function getSaveInfo() {
    return {
        hasSelfie: hasSelfie(),
        currentPoint: getCurrentPoint() + 1,
        energy: getEnergy(),
        moonsCollected: getMoonsCollected().length,
        playerName: getPlayerName(),
        highScore: getHighScore(),
        playTime: formatTime(getTotalPlayTime()),
        gameStarted: hasGameStarted()
    };
}

// ───────────────────────────────────────────────────────
// DEBUG : Afficher les infos de sauvegarde
// ───────────────────────────────────────────────────────
function debugStorage() {
    const info = getSaveInfo();
    console.log("💾 === INFOS SAUVEGARDE ===");
    console.log("Selfie:", info.hasSelfie ? "✅" : "❌");
    console.log("Point actuel:", info.currentPoint + "/9");
    console.log("Énergie:", info.energy + "%");
    console.log("Lunes:", info.moonsCollected + "/9");
    console.log("Joueur:", info.playerName);
    console.log("Record:", info.highScore + " pts");
    console.log("Temps:", info.playTime);
    console.log("Partie en cours:", info.gameStarted ? "Oui" : "Non");
    console.log("========================");
}
