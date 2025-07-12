import * as THREE  from 'three';
import { damageCacodemon, damageSkull } from '../inimigos/inimigos.js';

const chaingunSprite = "'./2025.1_T2_Assets/chaingun.png'";

export function loadChaingun(scene) {
    //load the sprite onto the scene
    const chaingunTexture = new THREE.TextureLoader().load(chaingunSprite);
    const chaingunMaterial = new THREE.SpriteMaterial({ map: chaingunTexture, color: 0xffffff });
    const chaingunSprite = new THREE.Sprite(chaingunMaterial);
    chaingunSprite.scale.set(1, 1, 1); // Adjust the scale as needed
    chaingunSprite.position.set(0, 1, 0); // Adjust the position as needed
    chaingunSprite.name = 'chaingun';
}