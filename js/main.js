// ═══════════════════════════════════════════════════════
// GPS0S - LOGIQUE PRINCIPALE
// ═══════════════════════════════════════════════════════

window.addEventListener('DOMContentLoaded', () => {
    console.log("🌙 GPS0S - Jeu démarré !");

    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        console.log("✅ Interface principale affichée");
        
        // 🚀 DÉMARRER LE GPS
        startGPS();
    }, 2000);

    // Bouton "Point GPS Suivant"
    document.getElementById('next-btn').addEventListener('click', nextGPSPoint);
});
