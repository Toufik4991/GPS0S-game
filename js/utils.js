// Ajouter le son de clic sur tous les boutons
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('btn')) {
            playSFX('bipClick');
        }
    });
});
