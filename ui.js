// ═══════════════════════════════════════════════════════
// FONCTION : Afficher un message de la Lune
// ═══════════════════════════════════════════════════════
function showMoonMessage(message, duration = 3000) {
    // Créer l'élément de message s'il n'existe pas
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

    // Masquer après le délai
    setTimeout(() => {
        msgBox.style.display = 'none';
    }, duration);
}
