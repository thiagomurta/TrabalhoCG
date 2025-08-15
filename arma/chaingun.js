import * as THREE from 'three';
import { handleChaingunHit } from '../inimigos/damageHandler.js'; // Ajuste o caminho se necessário


const chaingunLocation = "./2025.1_T2_Assets/chaingun.png";

// Animation control variables
let isShooting = false;
let animationFrame = 0;
let animationTimer = null;
let chaingunTexture = null;

export function loadChaingun(camera) {
    chaingunTexture = new THREE.TextureLoader().load(chaingunLocation, (texture) => {
        texture.needsUpdate = true; // waits for loading
    });

    chaingunTexture.repeat.set(1 / 3, 1); // its a sprite sheet with 3 frames

    const chaingunMaterial = new THREE.SpriteMaterial({
        map: chaingunTexture,
        //color: 0xffffff,
        transparent: true // Ensures transparency is handled correctly
    });
    const chaingunSprite = new THREE.Sprite(chaingunMaterial);

    const aspectRatio = 130 / 124;
    chaingunSprite.scale.set(aspectRatio * 0.8, 0.8, 1);
    chaingunSprite.position.set(0, -0.4, -1.5);

    chaingunSprite.name = 'chaingun';
    camera.add(chaingunSprite);
    chaingunSprite.raycast = () => {};
}

export function startShootingChaingun(enemies, camera) {
    if (isShooting) return;
    isShooting = true;
    animateShot(enemies, camera); 
}

export function stopShootingChaingun() {
    isShooting = false;
    clearTimeout(animationTimer);
    animationFrame = 0;
    chaingunTexture.offset.x = 0;
}

function animateShot(enemies, camera) {
    if (!isShooting) return;

    animationFrame = (animationFrame % 2) + 1; // loop through frames 1 and 2
    chaingunTexture.offset.x = animationFrame / 3;

    handleChaingunHit(camera, enemies);

    animationTimer = setTimeout(() => animateShot(enemies, camera), 100); // 100ms = 10 shots per second
}

export function removeChaingun(camera) {
    const chaingunSprite = camera.getObjectByName('chaingun');
    if (chaingunSprite) {
        camera.remove(chaingunSprite);
    }
    stopShootingChaingun(); // Stop any ongoing animation
}
