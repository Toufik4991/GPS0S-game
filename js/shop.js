// ═══════════════════════════════════════════════════════
// GPS0S - BOUTIQUE (SYSTÈME DE POINTS)
// ═══════════════════════════════════════════════════════

let playerPoints = 0;

// ───────────────────────────────────────────────────────
// CATALOGUE DE LA BOUTIQUE
// ───────────────────────────────────────────────────────
const shopItems = [
    {
        id: 'energy-small',
        name: 'Recharge 25%',
        description: 'Recharge 25% d\'énergie',
        price: 50,
        icon: '⚡',
        effect: () => addEnergy(25)
    },
    {
        id: 'energy-medium',
        name: 'Recharge 50%',
        description: 'Recharge 50% d\'énergie',
        price: 80,
        icon: '⚡⚡',
        effect: () => addEnergy(50)
    },
    {
        id: 'energy-full',
        name: 'Recharge 100%',
        description: 'Recharge complète',
        price: 150,
        icon: '⚡⚡⚡',
        effect: () => addEnergy(100)
    },
    {
        id: 'hint-distance',
        name: 'Indice Distance',
        description: 'Affiche la distance exacte (30s)',
        price: 30,
        icon: '📍',
        effect: () => activateDistanceHint()
    },
    {
        id: 'hint-direction',
        name: 'Indice Direction',
        description: 'Affiche une flèche précise (30s)',
        price: 40,
        icon: '🧭',
        effect: () => activateDirectionHint()
    },
    {
        id: 'bonus-score',
        name: 'Multiplicateur x2',
        description: 'Double les points (1 mini-jeu)',
        price: 100,
        icon: '✨',
        effect: () => activateScoreBonus()
    }
];

// ───────────────────────────────────────────────────────
// FONCTION : Initialiser la boutique
// ───────────────────────────────────────────────────────
function initShop() {
    // Charger les points sauvegardés
    playerPoints = parseInt(localStorage.getItem('playerPoints') || '0');
    
    // Afficher les points
    updatePointsDisplay();
    
    // Générer le catalogue
    renderShopItems();
    
    console.log(`🛒 Boutique initialisée (${playerPoints} pts)`);
}

// ───────────────────────────────────────────────────────
// FONCTION : Afficher les articles de la boutique
// ───────────────────────────────────────────────────────
function renderShopItems() {
    const shopContainer = document.getElementById('shop-items');
    
    if (!shopContainer) {
        console.warn("⚠️ Conteneur boutique introuvable");
        return;
    }
    
    shopContainer.innerHTML = '';
    
    shopItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        itemDiv.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
            </div>
            <button 
                class="shop-item-btn" 
                data-id="${item.id}"
                ${playerPoints < item.price ? 'disabled' : ''}
            >
                ${item.price} pts
            </button>
        `;
        
        // Ajouter l'événement d'achat
        const btn = itemDiv.querySelector('.shop-item-btn');
        btn.addEventListener('click', () => purchaseItem(item.id));
        
        shopContainer.appendChild(itemDiv);
    });
}

// ───────────────────────────────────────────────────────
// FONCTION : Acheter un article
// ───────────────────────────────────────────────────────
function purchaseItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    
    if (!item) {
        console.error(`❌ Article ${itemId} introuvable`);
        return;
    }
    
    // Vérifier si assez de points
    if (playerPoints < item.price) {
        if (typeof showMoonMessage === 'function') {
            showMoonMessage("🌙 Pas assez de points ! Joue aux mini-jeux.", 3000);
        }
        return;
    }
    
    // Déduire les points
    playerPoints -= item.price;
    localStorage.setItem('playerPoints', playerPoints);
    
    // Appliquer l'effet
    item.effect();
    
    // Mettre à jour l'affichage
    updatePointsDisplay();
    renderShopItems();
    
    // Message de la Lune
    if (typeof moonMessageShopPurchase === 'function') {
        moonMessageShopPurchase(item.name);
    }
    
    console.log(`🛒 Acheté : ${item.name} (-${item.price} pts)`);
}

// ───────────────────────────────────────────────────────
// FONCTION : Mettre à jour l'affichage des points
// ───────────────────────────────────────────────────────
function updatePointsDisplay() {
    const pointsDisplay = document.getElementById('player-points');
    
    if (pointsDisplay) {
        pointsDisplay.textContent = playerPoints;
    }
}

// ───────────────────────────────────────────────────────
// FONCTION : Ajouter des points (appelé par mini-jeux)
// ───────────────────────────────────────────────────────
function addPoints(amount) {
    playerPoints += amount;
    localStorage.setItem('playerPoints', playerPoints);
    updatePointsDisplay();
    
    console.log(`💰 +${amount} pts (Total: ${playerPoints})`);
}

// ───────────────────────────────────────────────────────
// EFFETS DES ARTICLES
// ───────────────────────────────────────────────────────

function addEnergy(percentage) {
    if (typeof currentEnergy !== 'undefined') {
        currentEnergy = Math.min(100, currentEnergy + percentage);
        if (typeof updateEnergyDisplay === 'function') {
            updateEnergyDisplay();
        }
        console.log(`⚡ +${percentage}% énergie`);
    }
}

function activateDistanceHint() {
    // Afficher la distance exacte pendant 30s
    const distanceDisplay = document.getElementById('distance');
    if (distanceDisplay) {
        distanceDisplay.classList.add('hint-active');
        setTimeout(() => {
            distanceDisplay.classList.remove('hint-active');
        }, 30000);
    }
    console.log("📍 Indice distance activé (30s)");
}

function activateDirectionHint() {
    // Afficher une flèche précise pendant 30s
    // (À implémenter avec une flèche CSS/SVG)
    console.log("🧭 Indice direction activé (30s)");
    if (typeof showMoonMessage === 'function') {
        showMoonMessage("🌙 Flèche direction activée ! Suis-la.", 3000);
    }
}

function activateScoreBonus() {
    // Double les points du prochain mini-jeu
    localStorage.setItem('scoreBonusActive', 'true');
    console.log("✨ Bonus x2 activé (1 jeu)");
}

// ───────────────────────────────────────────────────────
// BOUTON OUVRIR/FERMER LA BOUTIQUE
// ───────────────────────────────────────────────────────
function toggleShop() {
    const shopModal = document.getElementById('shop-modal');
    
    if (shopModal) {
        shopModal.classList.toggle('active');
    }
}

// ───────────────────────────────────────────────────────
// MODULE CHARGÉ
// ───────────────────────────────────────────────────────
console.log("🛒 Module Boutique chargé");
