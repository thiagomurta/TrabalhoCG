import * as THREE from 'three';
import { applyDamageToEnemy } from './inimigos.js';

const CHAINGUN_DAMAGE = 2;
const ROCKET_DAMAGE = 10;

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
        applyDamageToEnemy(enemyData, damage, enemies);
    }
}

export function markEnemyGroup(enemyData) {
    if (enemyData && enemyData.obj) {
        enemyData.obj.userData.isEnemyGroup = true;
    }
}