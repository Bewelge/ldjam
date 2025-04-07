var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Add more sound types as needed
// Define different behaviors for sound effects
export var SoundBehavior;
(function (SoundBehavior) {
    // Restart the sound when triggered again before it finishes
    SoundBehavior[SoundBehavior["RESTART"] = 0] = "RESTART";
    // Ignore new triggers if the sound is already playing
    SoundBehavior[SoundBehavior["IGNORE_WHILE_PLAYING"] = 1] = "IGNORE_WHILE_PLAYING";
    // Allow multiple instances of the same sound to play simultaneously
    SoundBehavior[SoundBehavior["OVERLAP"] = 2] = "OVERLAP";
})(SoundBehavior || (SoundBehavior = {}));
export const soundList = {
    // Background music - loops continuously
    BACKGROUND_MUSIC: {
        url: "audio/backgroundMusic.mp3",
        loop: true,
        volume: 0.0,
        behavior: SoundBehavior.IGNORE_WHILE_PLAYING,
    },
    DRILL: {
        url: "audio/drill.mp3",
        loop: false,
        behavior: SoundBehavior.OVERLAP,
    },
    BREAK: {
        url: "audio/break.mp3",
        loop: false,
        behavior: SoundBehavior.OVERLAP,
    },
    // Sound effects - play once when triggered
    // CLICK: {
    // 	url: "sounds/click.mp3",
    // 	loop: false,
    // 	behavior: SoundBehavior.RESTART,
    // },
    // EXPLOSION: {
    // 	url: "sounds/explosion.mp3",
    // 	loop: false,
    // 	behavior: SoundBehavior.OVERLAP,
    // },
    // POWERUP: {
    // 	url: "sounds/powerup.mp3",
    // 	loop: false,
    // 	behavior: SoundBehavior.IGNORE_WHILE_PLAYING,
    // },
};
export class SoundManager {
    constructor() {
        this.sounds = {};
        this.activeSounds = new Map();
        this.loaded = 0;
        this.muted = false;
    }
    loadSounds() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const totalSounds = Object.keys(soundList).length;
                this.loaded = 0;
                Object.entries(soundList).forEach(([key, val]) => {
                    let audio = new Audio();
                    audio.src = val.url;
                    audio.volume = val.volume || 1;
                    this.sounds[key] = Object.assign(Object.assign({}, val), { audio });
                    audio.oncanplaythrough = () => {
                        this.loaded++;
                        console.log(`Loaded sound: ${key}`);
                        // Configure audio settings
                        if (val.loop) {
                            audio.loop = true;
                        }
                        if (this.loaded >= totalSounds) {
                            resolve(this.sounds);
                        }
                    };
                    audio.onerror = error => {
                        reject(`Failed to load sound: ${val.url}`);
                    };
                });
            });
        });
    }
    playSound(key) {
        const soundData = this.sounds[key];
        if (!soundData || !soundData.audio || this.muted) {
            return;
        }
        // Get or initialize the array of active instances for this sound
        let activeInstances = this.activeSounds.get(key) || [];
        // Handle sound based on its behavior
        switch (soundData.behavior) {
            case SoundBehavior.RESTART:
                // Stop all existing instances and start a new one
                activeInstances.forEach(audio => {
                    audio.pause();
                    audio.currentTime = 0;
                });
                activeInstances = []; // Clear the array
                break;
            case SoundBehavior.IGNORE_WHILE_PLAYING:
                // If any instance is already playing, don't play another
                if (activeInstances.some(audio => !audio.paused)) {
                    return;
                }
                break;
            case SoundBehavior.OVERLAP:
                // Allow multiple instances to play simultaneously
                // No special handling needed
                break;
        }
        // Create a new audio instance for this play
        const newAudio = new Audio(soundData.audio.src);
        newAudio.loop = soundData.loop;
        newAudio.volume = soundData.volume || 1;
        // Track this instance
        activeInstances.push(newAudio);
        this.activeSounds.set(key, activeInstances);
        // Start playing
        newAudio.play().catch(error => {
            console.error(`Error playing sound ${key}:`, error);
        });
        // Clean up when sound ends (if not looping)
        if (!soundData.loop) {
            newAudio.onended = () => {
                const currentInstances = this.activeSounds.get(key) || [];
                const index = currentInstances.indexOf(newAudio);
                if (index !== -1) {
                    currentInstances.splice(index, 1);
                    this.activeSounds.set(key, currentInstances);
                }
            };
        }
    }
    stopSound(key) {
        const activeInstances = this.activeSounds.get(key);
        if (activeInstances) {
            activeInstances.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            this.activeSounds.set(key, []);
        }
    }
    stopAllSounds() {
        for (const key of this.activeSounds.keys()) {
            this.stopSound(key);
        }
    }
    setMute(muted) {
        this.muted = muted;
        if (muted) {
            this.stopAllSounds();
        }
    }
    adjustVolume(key, volume) {
        const soundData = this.sounds[key];
        if (soundData && soundData.audio) {
            soundData.audio.volume = Math.max(0, Math.min(1, volume));
            // Also adjust any active instances
            const activeInstances = this.activeSounds.get(key);
            if (activeInstances) {
                activeInstances.forEach(audio => {
                    audio.volume = soundData.audio.volume;
                });
            }
        }
    }
}
let theSoundManager;
export const initSounds = () => __awaiter(void 0, void 0, void 0, function* () {
    theSoundManager = new SoundManager();
    yield theSoundManager.loadSounds();
});
export function playSound(key) {
    return theSoundManager.playSound(key);
}
export function stopSound(key) {
    return theSoundManager.stopSound(key);
}
export function stopAllSounds() {
    return theSoundManager.stopAllSounds();
}
export function setMute(muted) {
    return theSoundManager.setMute(muted);
}
export function adjustVolume(key, volume) {
    return theSoundManager.adjustVolume(key, volume);
}
