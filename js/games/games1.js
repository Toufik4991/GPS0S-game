// À la fin d'un mini-jeu
function endGame(won) {
    if (won) {
        playSFX('victoire');
        earnPoints(50);
        showMoonMessage("🎉 Bien joué ! Bon, c'était facile.", false);
    } else {
        playSFX('perdu');
        showMoonMessage("😂 Raté ! Retente ta chance !", true);
    }
    
    // Retour à la musique d'exploration
    setTimeout(() => {
        playMusic('ambiance');
    }, 3000);
}
function startGame(gameNumber) {
    console.log(`🎮 Lancement Jeu ${gameNumber}`);
    
    // Musique spécifique au jeu
    playMusic(`game${gameNumber}`);
    
    // ... (reste du code du jeu)
}
