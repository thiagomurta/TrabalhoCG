import * as THREE from 'three';
import { applyDamageToEnemy } from './inimigos.js';
import { updatePlayerHpBar } from '../player.js'; 
import { playSound, playPositionalSound } from './../sons/sons.js';
import { godModeState } from '../t1.js'; // Import God Mode state

const CHAINGUN_DAMAGE = 2;
const ROCKET_DAMAGE = 10;

const SKULL_DAMAGE = 5;
const CACODEMON_DAMAGE = 8;

const PLAYER_HIT_COOLDOWN_MS = 500; // Meio segundo de invencibilidade após ser atingido
let lastPlayerHitTime = 0;

const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);


// Chamada a cada frame em que a chaingun está atirando, usa raycaster
export function handleChaingunHit(camera, enemies) {
    if (!camera || !camera.isPerspectiveCamera) return;

    raycaster.setFromCamera(screenCenter, camera);

    const allEnemyMeshes = [
        ...enemies.cacodemons.map(e => e.obj),
        ...enemies.skulls.map(e => e.obj),
        ...enemies.painElementals.map(e => e.obj)
    ];

    const intersects = raycaster.intersectObjects(allEnemyMeshes, true); 

    if (intersects.length > 0) {
        const closestHitObject = intersects[0].object;
        applyDamage(closestHitObject, CHAINGUN_DAMAGE, enemies);
    }
}


// Chamada a cada frame para cada projétil ativo e aciona colisão/dano
export function handleProjectileCollision(bullet, enemies) {
    const bulletBox = new THREE.Box3().setFromObject(bullet.ball);

    const allEnemies = [...enemies.cacodemons, ...enemies.skulls, ...enemies.painElementals];

    for (const enemy of allEnemies) {
        const enemyBox = new THREE.Box3().setFromObject(enemy.obj.children[0]);
        if (bulletBox.intersectsBox(enemyBox)) {
            console.log("Hit an enemy!");
            applyDamage(enemy.obj, ROCKET_DAMAGE, enemies);
            return true;
        }
    }
    return false; // Nenhuma colisão
}



// Função auxiliar que encontra o inimigo correto e aplica o dano
function applyDamage(hitObject, damage, enemies) {
    // Lógica para encontrar o grupo principal do inimigo 
    let enemyGroup = hitObject;
    while (enemyGroup.parent && !enemyGroup.userData.isEnemyGroup) {
        enemyGroup = enemyGroup.parent;
    }

    // Tenta encontrar o inimigo em qualquer um dos arrays
    const enemyData = enemies.cacodemons.find(e => e.obj === enemyGroup) ||
                      enemies.skulls.find(e => e.obj === enemyGroup) ||
                      enemies.painElementals.find(e => e.obj === enemyGroup);

    if (enemyData) {
        // Toca o som de "hurt" específico do inimigo
        if (enemyData.name.startsWith('cacodemon')) {
            playPositionalSound('CACODEMON_HURT', enemyData.obj);
        } else if (enemyData.name === 'skull') {
            playPositionalSound('LOST_SOUL_HURT', enemyData.obj);
        } else if (enemyData.name === 'painElemental') {
            playPositionalSound('PAIN_ELEMENTAL_HURT', enemyData.obj);
        } else if (enemyData.name === 'soldier') {
            playPositionalSound('SOLDIER_HURT', enemyData.obj);
        }
        applyDamageToEnemy(enemyData, damage, enemies);
    }
}

export function markEnemyGroup(enemyData) {
    if (enemyData && enemyData.obj) {
        enemyData.obj.userData.isEnemyGroup = true;
    }
}

// --------------- PLAYER DAMAGE -----------------

function applyDamageToPlayer(player, damage) {
    if (godModeState.enabled) {
        return;
    }

    const now = performance.now();
    if (now - lastPlayerHitTime < PLAYER_HIT_COOLDOWN_MS) {
        return; 
    }
    lastPlayerHitTime = now;
    playSound('PLAYER_HURT');
    player.userData.hp -= damage;
    if (player.userData.hp < 0) {
        player.userData.hp = 0;
    }
    
    console.log(`Jogador atingido! HP atual: ${player.userData.hp}`);
    updatePlayerHpBar(player); 

    if (player.userData.hp <= 0) {
        // Lógica para quando o jogador morre (ex: reiniciar o nível, mostrar tela de "Game Over")
        alert("Você morreu!");
        document.location.reload();
    }
}

export function checkSkullCollision(skullData, player) {
    const skull = skullData.obj;
    const distance = skull.position.distanceTo(player.position);
    const collisionThreshold = 1.5; // Distância para considerar uma colisão

    if (distance < collisionThreshold) {
        applyDamageToPlayer(player, SKULL_DAMAGE);
    }
}


export function checkProjectileCollisionWithPlayer(projectile, player) {
    const projectileBox = new THREE.Box3().setFromObject(projectile);
    const playerBox = new THREE.Box3().setFromObject(player);

    if (projectileBox.intersectsBox(playerBox)) {
        applyDamageToPlayer(player, CACODEMON_DAMAGE);
        return true;
    }
    return false;
}