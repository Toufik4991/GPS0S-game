// ═══════════════════════════════════════════════════════
// GPS0S - GESTION DE L'INTERFACE UTILISATEUR
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
            text-align: center;
            max-width: 90%;
            font-weight: bold;
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
// FONCTION : Afficher une notification (Success/Warning/Error)
// ───────────────────────────────────────────────────────
function showNotification(message, type = 'info', duration = 2000) {
    const notif = document.createElement('div');

    const colors = {
        success: '#00ff88',
        warning: '#ffaa00',
        error: '#ff0044',
        info: '#667eea'
    };

    notif.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        font-size: 14px;
        z-index: 9998;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
    `;

    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, duration);
}

// ───────────────────────────────────────────────────────
// FONCTION : Afficher un loader
// ───────────────────────────────────────────────────────
function showLoader(text = 'Chargement...') {
    let loader = document.getElementById('game-loader');

    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'game-loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        loader.innerHTML = `
            <div style="
                width: 50px;
                height: 50px;
                border: 5px solid #333;
                border-top: 5px solid #00ff88;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <p id="loader-text" style="color: white; margin-top: 20px; font-size: 16px;"></p>
        `;
        document.body.appendChild(loader);
    }

    document.getElementById('loader-text').textContent = text;
    loader.style.display = 'flex';
}

// ───────────────────────────────────────────────────────
// FONCTION : Masquer le loader
// ───────────────────────────────────────────────────────
function hideLoader() {
    const loader = document.getElementById('game-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Afficher un modal personnalisé
// ───────────────────────────────────────────────────────
function showModal(title, content, buttons = []) {
    const modal = document.createElement('div');
    modal.id = 'custom-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    let buttonsHTML = '';
    buttons.forEach((btn, index) => {
        buttonsHTML += `
            <button data-action="${index}" style="
                padding: 12px 24px;
                margin: 5px;
                background: ${btn.color || '#00ff88'};
                border: none;
                border-radius: 8px;
                color: ${btn.textColor || 'black'};
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
            ">${btn.text}</button>
        `;
    });

    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1e1e2e, #2a2a3e);
            padding: 30px;
            border-radius: 20px;
            max-width: 90%;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        ">
            <h2 style="color: #00ff88; margin-bottom: 20px;">${title}</h2>
            <p style="color: white; margin-bottom: 30px;">${content}</p>
            <div>${buttonsHTML}</div>
        </div>
    `;

    document.body.appendChild(modal);

    // Gérer les clics sur les boutons
    buttons.forEach((btn, index) => {
        modal.querySelector(`[data-action="${index}"]`).addEventListener('click', () => {
            if (btn.action) btn.action();
            modal.remove();
        });
    });
}

// ───────────────────────────────────────────────────────
// FONCTION : Mettre à jour le HUD (Point/Énergie/Lunes)
// ───────────────────────────────────────────────────────
function updateHUD() {
    // ✅ Point GPS actuel
    const pointElement = document.getElementById('current-point');
    if (pointElement && typeof currentPointIndex !== 'undefined') {
        pointElement.textContent = `${currentPointIndex + 1}/9`;
    }

    // ✅ Énergie actuelle
    const energyText = document.getElementById('energy-text');
    if (energyText && typeof getCurrentEnergy === 'function') {
        energyText.textContent = `${getCurrentEnergy()}%`;
    }

    // ✅ Lunes capturées
    const moonCount = document.getElementById('moon-count');
    if (moonCount) {
        const moons = JSON.parse(localStorage.getItem('capturedMoons') || '[]');
        moonCount.textContent = moons.length;
    }

    console.log("🎮 HUD mis à jour");
}

// ───────────────────────────────────────────────────────
// FONCTION : Ouvrir le coffre à lunes
// ───────────────────────────────────────────────────────
function openChest() {
    const moons = JSON.parse(localStorage.getItem('capturedMoons') || '[]');

    if (moons.length === 0) {
        showMoonMessage("🌙 Ton coffre est vide. Normal, tu n'as rien capturé.", 3000);
        return;
    }

    // Construction du contenu du modal
    let moonsHTML = '<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">';
    moons.forEach(moon => {
        moonsHTML += `
            <div style="
                background: rgba(255,255,255,0.1);
                padding: 10px;
                border-radius: 10px;
                text-align: center;
            ">
                <div style="font-size: 40px;">🌙</div>
                <p style="color: #00ff88; margin: 5px 0;">Point ${moon.point}</p>
                <p style="color: #888; font-size: 12px;">${new Date(moon.timestamp).toLocaleTimeString()}</p>
            </div>
        `;
    });
    moonsHTML += '</div>';

    showModal(
        `📦 COFFRE À LUNES (${moons.length}/9)`,
        moonsHTML,
        [
            {
                text: 'Fermer',
                color: '#667eea',
                textColor: 'white',
                action: () => console.log("Coffre fermé")
            }
        ]
    );

    console.log("📦 Coffre ouvert :", moons);
}

// ───────────────────────────────────────────────────────
// FONCTION : Animation de vibration
// ───────────────────────────────────────────────────────
function vibrate(pattern = [100]) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Effet de secousse sur un élément
// ───────────────────────────────────────────────────────
function shakeElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.animation = 'shake 0.5s';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Effet de pulsation sur un élément
// ───────────────────────────────────────────────────────
function pulseElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.animation = 'pulse 1s infinite';
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Arrêter les animations d'un élément
// ───────────────────────────────────────────────────────
function stopAnimation(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.animation = '';
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Initialiser les événements UI
// ───────────────────────────────────────────────────────
function initUI() {
    // Bouton Coffre
    const chestBtn = document.getElementById('chest-btn');
    if (chestBtn) {
        chestBtn.addEventListener('click', openChest);
        console.log("✅ Bouton Coffre connecté");
    }

    // Bouton Mini-jeux
    const gamesBtn = document.getElementById('games-btn');
    if (gamesBtn) {
        gamesBtn.addEventListener('click', () => {
            if (typeof openMinigamesMenu === 'function') {
                openMinigamesMenu();
            } else {
                showMoonMessage("🌙 Les mini-jeux ne sont pas encore prêts...", 2000);
            }
        });
        console.log("✅ Bouton Mini-jeux connecté");
    }

    console.log("🎨 Interface utilisateur initialisée");
}

// ───────────────────────────────────────────────────────
// AUTO-INIT AU CHARGEMENT
// ───────────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
} else {
    initUI();
}
