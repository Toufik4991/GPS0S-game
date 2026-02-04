/* ═══════════════════════════════════════════════════════
   GPS0S - SYSTÈME AUDIO (VERSION FINALE)
   ═══════════════════════════════════════════════════════ */

const AudioManager = {
    // État global
    enabled: true,
    musicVolume: 0.4,
    sfxVolume: 0.6,
    
    // Instances audio
    currentMusic: null,
    
    // Musiques de fond (loop)
    music: {
        ambiance: null,      // Exploration GPS (zikambiance.mp3)
        final: null,         // Écran final (zikfin.mp3)
        game1: null,         // Jeu 1
        game2: null,         // Jeu 2
        game3: null,         // Jeu 3
        game4: null,         // Jeu 4
        game5: null,         // Jeu 5
        game6: null,         // Jeu 6
        game7: null,         // Jeu 7
        game8: null,         // Jeu 8
        game9: null          // Jeu 9
    },
    
    // Sons courts (one-shot)
    sfx: {
        achat: null,           // achatsound.mp3
        victoire: null,        // victoire.mp3
        perdu: null,           // perdu.mp3
        gameStart: null,       // gamestart.mp3
        bip: null,             // bip.mp3
        bipError: null,        // biperror.mp3
        bipClick: null,        // bipclick.mp3
        recupEnergie: null,    // recupenergie.mp3
        zoneBleu: null,        // entreenzonebleu.mp3
        moquerie: null         // moqueriemoon.mp3
    },
    
    // Initialisation
    init() {
        console.log("🎵 Chargement du système audio...");
        
        // Charger les préférences
        const savedVolume = localStorage.getItem('gpsos_music_volume');
        const savedSFX = localStorage.getItem('gpsos_sfx_volume');
        const savedEnabled = localStorage.getItem('gpsos_audio_enabled');
        
        if (savedVolume) this.musicVolume = parseFloat(savedVolume);
        if (savedSFX) this.sfxVolume = parseFloat(savedSFX);
        if (savedEnabled !== null) this.enabled = savedEnabled === 'true';
        
        // Précharger les musiques (loop)
        this.loadMusic('ambiance', 'assets/sounds/zikambiance.mp3', true);
        this.loadMusic('final', 'assets/sounds/zikfin.mp3', false);
        this.loadMusic('game1', 'assets/sounds/zik1jeu.mp3', true);
        this.loadMusic('game2', 'assets/sounds/zik2jeu.mp3', true);
        this.loadMusic('game3', 'assets/sounds/zik3jeu.mp3', true);
        this.loadMusic('game4', 'assets/sounds/zik4jeu.mp3', true);
        this.loadMusic('game5', 'assets/sounds/zik5jeu.mp3', true);
        this.loadMusic('game6', 'assets/sounds/zik6jeu.mp3', true);
        this.loadMusic('game7', 'assets/sounds/zik7jeu.mp3', true);
        this.loadMusic('game8', 'assets/sounds/zik8jeu.mp3', true);
        this.loadMusic('game9', 'assets/sounds/zik9jeu.mp3', true);
        
        // Précharger les SFX
        this.loadSFX('achat', 'assets/sounds/achatsound.mp3');
        this.loadSFX('victoire', 'assets/sounds/victoire.mp3');
        this.loadSFX('perdu', 'assets/sounds/perdu.mp3');
        this.loadSFX('gameStart', 'assets/sounds/gamestart.mp3');
        this.loadSFX('bip', 'assets/sounds/bip.mp3');
        this.loadSFX('bipError', 'assets/sounds/biperror.mp3');
        this.loadSFX('bipClick', 'assets/sounds/bipclick.mp3');
        this.loadSFX('recupEnergie', 'assets/sounds/recupenergie.mp3');
        this.loadSFX('zoneBleu', 'assets/sounds/entreenzonebleu.mp3');
        this.loadSFX('moquerie', 'assets/sounds/moqueriemoon.mp3');
        
        console.log("✅ Système audio prêt (musiques: " + 
                    Object.keys(this.music).length + 
                    " | SFX: " + Object.keys(this.sfx).length + ")");
    },
    
    // Charger une musique
    loadMusic(key, path, loop = true) {
        try {
            this.music[key] = new Audio(path);
            this.music[key].loop = loop;
            this.music[key].volume = this.musicVolume;
            this.music[key].preload = 'auto';
        } catch (error) {
            console.warn(`⚠️ Musique introuvable: ${path}`);
        }
    },
    
    // Charger un SFX
    loadSFX(key, path) {
        try {
            this.sfx[key] = new Audio(path);
            this.sfx[key].volume = this.sfxVolume;
            this.sfx[key].preload = 'auto';
        } catch (error) {
            console.warn(`⚠️ SFX introuvable: ${path}`);
        }
    },
    
    // Jouer une musique de fond
    playMusic(type) {
        if (!this.enabled) return;
        
        // Arrêter la musique actuelle (fade out)
        if (this.currentMusic && this.currentMusic !== this.music[type]) {
            this.fadeOut(this.currentMusic, 500);
        }
        
        // Démarrer la nouvelle musique
        const music = this.music[type];
        if (music && music !== this.currentMusic) {
            music.volume = 0;
            music.play().then(() => {
                this.fadeIn(music, this.musicVolume, 500);
            }).catch(err => {
                console.warn("⚠️ Autoplay bloqué (normal au 1er clic)");
            });
            
            this.currentMusic = music;
            console.log(`🎵 Musique: ${type}`);
        }
    },
    
    // Jouer un effet sonore
    playSFX(type) {
        if (!this.enabled) return;
        
        const sound = this.sfx[type];
        if (sound) {
            // Cloner pour permettre plusieurs instances simultanées
            const sfxClone = sound.cloneNode();
            sfxClone.volume = this.sfxVolume;
            sfxClone.play().catch(err => {
                console.warn(`⚠️ SFX ${type} bloqué`);
            });
            
            // Nettoyer après lecture
            sfxClone.addEventListener('ended', () => {
                sfxClone.remove();
            });
        }
    },
    
    // Arrêter toute musique
    stopMusic(fadeOut = true) {
        if (this.currentMusic) {
            if (fadeOut) {
                this.fadeOut(this.currentMusic, 500);
            } else {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
            }
            this.currentMusic = null;
        }
    },
    
    // Fade in (montée progressive du volume)
    fadeIn(audio, targetVolume, duration) {
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = targetVolume / steps;
        let currentStep = 0;
        
        const interval = setInterval(() => {
            if (currentStep >= steps) {
                clearInterval(interval);
                audio.volume = targetVolume;
            } else {
                audio.volume = volumeStep * currentStep;
                currentStep++;
            }
        }, stepTime);
    },
    
    // Fade out (descente progressive du volume)
    fadeOut(audio, duration) {
        const steps = 20;
        const stepTime = duration / steps;
        const startVolume = audio.volume;
        const volumeStep = startVolume / steps;
        let currentStep = 0;
        
        const interval = setInterval(() => {
            if (currentStep >= steps) {
                clearInterval(interval);
                audio.pause();
                audio.currentTime = 0;
                audio.volume = startVolume; // Reset pour prochaine lecture
            } else {
                audio.volume = startVolume - (volumeStep * currentStep);
                currentStep++;
            }
        }, stepTime);
    },
    
    // Régler le volume de la musique
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
        
        localStorage.setItem('gpsos_music_volume', this.musicVolume);
        console.log(`🔊 Volume musique: ${Math.round(this.musicVolume * 100)}%`);
    },
    
    // Régler le volume des SFX
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('gpsos_sfx_volume', this.sfxVolume);
        console.log(`🔊 Volume SFX: ${Math.round(this.sfxVolume * 100)}%`);
    },
    
    // Activer/Désactiver le son
    toggle() {
        this.enabled = !this.enabled;
        
        if (!this.enabled) {
            this.stopMusic(false);
        } else {
            this.playMusic('ambiance'); // Reprendre la musique d'exploration
        }
        
        localStorage.setItem('gpsos_audio_enabled', this.enabled);
        console.log(`🔊 Audio: ${this.enabled ? 'ON' : 'OFF'}`);
        
        return this.enabled;
    }
};

/* ═══════════════════════════════════════════════════════
   RACCOURCIS GLOBAUX (pour faciliter l'utilisation)
   ═══════════════════════════════════════════════════════ */

function playMusic(type) {
    AudioManager.playMusic(type);
}

function playSFX(type) {
    AudioManager.playSFX(type);
}

function stopMusic(fadeOut = true) {
    AudioManager.stopMusic(fadeOut);
}

function toggleAudio() {
    return AudioManager.toggle();
}

console.log("✅ audio.js chargé");
