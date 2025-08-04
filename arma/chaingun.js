import * as THREE from 'three';
import { damageCacodemon, damageSkull } from '../inimigos/inimigos.js';

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

    damageEnemies(enemies, camera); // Call damage function on each frame

    animationTimer = setTimeout(() => animateShot(enemies, camera), 100); // 100ms = 10 shots per second
}

export function removeChaingun(camera) {
    const chaingunSprite = camera.getObjectByName('chaingun');
    if (chaingunSprite) {
        camera.remove(chaingunSprite);
    }
    stopShootingChaingun(); // Stop any ongoing animation
}

const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);

function damageEnemies(enemies, camera) {
    if (!camera || !camera.isPerspectiveCamera) {
        console.warn('Invalid camera passed to damageEnemies');
        return;
    }

    raycaster.setFromCamera(screenCenter, camera);
    console.log(enemies);
    let allEnemyMeshes = [
        ...enemies.cacodemons.map(e => e.obj),
        ...enemies.skulls.map(e => e.obj)
    ];
    allEnemyMeshes.push(enemies.painElementals[0].obj);

    const intersects = raycaster.intersectObjects(allEnemyMeshes);
    if (intersects.length > 0) {
        // if (intersects[0].distance > 10) return;

        const closestHitObject = intersects[0].object; 
        const cacodemonData = enemies.cacodemons.find(enemy => {
            let parent = closestHitObject;
            while (parent) { // Loop while trying to find enemy.obj from the children mesh
                if (parent === enemy.obj) {
                    return true; // Found match
                }
                parent = parent.parent; 
            }
            return false; 
        });

        if (cacodemonData) {
            damageCacodemon(enemies.cacodemons, cacodemonData, 2);
            return; 
        }
        
        
        const singlePainElemental = enemies.painElementals[0];
        let painElementalData = undefined; 

        if (singlePainElemental) {
            let parent = closestHitObject;
    
            while (parent) {
                if (parent === singlePainElemental.obj) {
                    painElementalData = singlePainElemental;
                    break; 
                }
                parent = parent.parent;
            }
        }

        if (painElementalData) {
            damageCacodemon(enemies.painElementals, painElementalData, 2);
            return; 
        }

        const skullData = enemies.skulls.find(enemy => {
            let parent = closestHitObject;
            while (parent) { // same logic as above
                if (parent === enemy.obj) return true;
                parent = parent.parent;
            }
            return false;
        });

        if (skullData) {
            damageSkull(enemies.skulls, skullData, 2);
        }
    }
}