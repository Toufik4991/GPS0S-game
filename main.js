// ═══════════════════════════════════════════════════════
// GPS0S - LOGIQUE PRINCIPALE
// ═══════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────
// FONCTION : Afficher un message de la Lune
// ───────────────────────────────────────────────────────
function showMoonMessage(message, duration = 3000) {
    let msgBox = document.getElementById('moon-message');
    
    if (!msgBox) {
        msgBox = document.createElement('div');
        msgBox.id = 'moon-message';
        msgBox.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 25px;
            border-radius: 15px;
            font-size: 16px;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
        `;
        document.body.appendChild(msgBox);
    }

    msgBox.textContent = message;
    msgBox.style.display = 'block';

    setTimeout(() => {
        msgBox.style.display = 'none';
    }, duration);
}

// ───────────────────────────────────────────────────────
// DÉMARRAGE DU JEU
// ───────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    console.log("🌙 GPS0S - Jeu démarré !");

    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        console.log("✅ Interface principale affichée");
        
        // 🚀 DÉMARRER LES SYSTÈMES
        startGPS();
        initEnergy();
        initCompass();
        initAR(); 
    }, 2000);

    // Bouton "Point GPS Suivant"
    document.getElementById('next-btn').addEventListener('click', nextGPSPoint);
});
