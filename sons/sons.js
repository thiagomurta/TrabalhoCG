import * as THREE from 'three';

// Constantes para os caminhos dos arquivos de áudio
export const SOUND_PATHS = {
    BACKGROUND_MUSIC: '../../0_AssetsT3/sounds/doom.mp3',

    PLAYER_HURT: '../../0_AssetsT3/sounds/playerInjured.wav',
    CHAINGUN_FIRE: '../../0_AssetsT3/sounds/chaingunFiring.wav',
    ROCKET_LAUNCHER_FIRE: '../../0_AssetsT3/sounds/rocketFiring.wav',
    KEY_PICKUP: '../../0_AssetsT3/sounds/chave.wav',

    CACODEMON_ATTACK: '../../0_AssetsT3/sounds/cacoDemon/cacodemonAttack.wav',
    CACODEMON_DEATH: '../../0_AssetsT3/sounds/cacoDemon/cacodemonDeath.wav',
    CACODEMON_HURT: '../../0_AssetsT3/sounds/cacoDemon/cacodemonInjured.wav',
    CACODEMON_NEAR: '../../0_AssetsT3/sounds/cacoDemon/cacodemonNearby.wav',
    CACODEMON_AGGRO: '../../0_AssetsT3/sounds/cacoDemon/cacodemonSight.wav',

    LOST_SOUL_ATTACK: '../../0_AssetsT3/sounds/lostSoul/lost_soul_attack.wav',
    LOST_SOUL_HURT: '../../0_AssetsT3/sounds/lostSoul/injured.wav',

    PAIN_ELEMENTAL_ATTACK: '../../0_AssetsT3/sounds/painElemental/painAttack.wav',
    PAIN_ELEMENTAL_HURT: '../../0_AssetsT3/sounds/painElemental/injured.wav',
    PAIN_ELEMENTAL_AGGRO: '../../0_AssetsT3/sounds/painElemental/painSight.wav',

    SOLDIER_ATTACK: '../../0_AssetsT3/sounds/soldier/soldierAttack.wav',
    SOLDIER_AGGRO: '../../0_AssetsT3/sounds/soldier/soldierSight.wav',
    SOLDIER_HURT: '../../0_AssetsT3/sounds/soldier/injured.wav',

    PLATFORM_MOVE: '../../0_AssetsT3/sounds/plataformaMovendo.wav',
    DOOR_OPEN: '../../0_AssetsT3/sounds/doorOpening.wav',
};

let listener;
let audioLoader;
let backgroundMusic;
const sounds = {};

export function initSoundSystem(camera) {
    listener = new THREE.AudioListener();
    camera.add(listener);
    audioLoader = new THREE.AudioLoader();

    for (const key in SOUND_PATHS) {
        loadSound(key, SOUND_PATHS[key]);
    }

    setupBackgroundMusic();
}

function loadSound(name, path, loop = false, volume = 0.5) {
    const sound = new THREE.Audio(listener);
    audioLoader.load(path, function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(loop);
        sound.setVolume(volume);
        sounds[name] = sound;
        
        if (name === 'BACKGROUND_MUSIC') {
            backgroundMusic = sound;
        }
    });
}

function setupBackgroundMusic() {
    loadSound('BACKGROUND_MUSIC', SOUND_PATHS.BACKGROUND_MUSIC, true, 0.2);
}

export function playSound(name) {
    const sound = sounds[name];
    if (sound) {
        if (sound.isPlaying && name !== 'CHAINGUN_FIRE') {
            return;
        }
        sound.play();
    } else {
        console.warn(`Som "${name}" não encontrado.`);
    }
}

// Toca um som associado a um objeto 3D (som posicional)
export function playPositionalSound(name, object3D) {
    if (!object3D || !object3D.isObject3D) {
        console.error("Objeto 3D inválido para som posicional.");
        return;
    }

    const sound = sounds[name];
     if (sound) {
        if (object3D.userData.audio === undefined) {
             const positionalAudio = new THREE.PositionalAudio(listener);
             audioLoader.load(SOUND_PATHS[name], function(buffer) {
                positionalAudio.setBuffer(buffer);
                positionalAudio.setRefDistance(20);
                object3D.add(positionalAudio);
                object3D.userData.audio = positionalAudio;
                positionalAudio.play();
            });
        } else {
            if (object3D.userData.audio.isPlaying) {
                object3D.userData.audio.stop();
            }
            object3D.userData.audio.play();
        }
    } else {
        console.warn(`Som "${name}" não encontrado para áudio posicional.`);
    }
}


export function toggleBackgroundMusic() {
    if (backgroundMusic) {
        if (backgroundMusic.isPlaying) {
            backgroundMusic.pause();
        } else {
            backgroundMusic.play();
        }
    }
}