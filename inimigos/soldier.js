import * as THREE from 'three';
import { getCollisionObjects } from './inimigos.js';
import { checkProjectileCollisionWithPlayer } from './damageHandler.js';

export const SOLDIER_STATE = {
    WANDERING: 'WANDERING',
    LOOKING_AT_PLAYER: 'LOOKING_AT_PLAYER',
};

const PLAYER_DETECT_DISTANCE = 30;
const LOOK_AT_PLAYER_DURATION_FRAMES = 120;
const LOOK_AT_PLAYER_COOLDOWN_FRAMES = -90;
const MAX_WANDER_DISTANCE = 20;
const WANDER_SPEED = 0.04;
const PROXIMITY_THRESHOLD = 1.0;
const COLLISION_CHECK_DISTANCE = 1.0;
const SOLDIER_VERTICAL_OFFSET = 0.9;
const VERTICAL_SMOOTHING_FACTOR = 0.02;

export function moveSoldier(soldierData, scenario, player, scene, camera) {
    if (!soldierData.collisionObjects) {
        soldierData.collisionObjects = getCollisionObjects(scenario);
    }
    soldierData.spriteMixer.update(soldierData.clock.getDelta());

    const euler = new THREE.Euler();
    euler.setFromQuaternion(camera.quaternion, 'YXZ');
    soldierData.actionSprite.rotation.y = euler.y;

    switch (soldierData.state) {
        case SOLDIER_STATE.WANDERING:
            handleWanderingState(soldierData, player);
            break;
        case SOLDIER_STATE.LOOKING_AT_PLAYER:
            handleLookingState(soldierData, player, scene);
            break;
    }

    moveProjectile(soldierData, scene, player);
    applyVerticalCollision(soldierData);
    updateSoldierAnimation(soldierData, player); // Esta função será substituída
}

function handleWanderingState(soldierData, player) {
    if (tryDetectPlayer(soldierData, player) && soldierData.lookAtFrames >= 0) {
        soldierData.hasShot = false;
        soldierData.state = SOLDIER_STATE.LOOKING_AT_PLAYER;
        soldierData.lookAtFrames = LOOK_AT_PLAYER_DURATION_FRAMES;
        return;
    }

    const soldier = soldierData.obj;
    const currentPosition = soldier.position;
    if (!soldierData.targetPoint || currentPosition.distanceTo(soldierData.targetPoint) < PROXIMITY_THRESHOLD) {
        soldierData.targetPoint = getNewWanderTarget(currentPosition);
    }

    moveTowardsTarget(soldierData, WANDER_SPEED, () => {
        soldierData.targetPoint = null;
    });

    if (soldierData.lookAtFrames < 0) soldierData.lookAtFrames++;
}

function handleLookingState(soldierData, player, scene) {
    soldierData.targetPoint = null;

    if (soldierData.lookAtFrames === Math.floor(LOOK_AT_PLAYER_DURATION_FRAMES / 2) && !soldierData.hasShot) {
        initProjectile(soldierData);
        shootProjectile(soldierData, scene, player);
    }
    soldierData.lookAtFrames--;
    if (soldierData.lookAtFrames <= 0) {
        soldierData.state = SOLDIER_STATE.WANDERING;
        soldierData.lookAtFrames = LOOK_AT_PLAYER_COOLDOWN_FRAMES;
    }
}

function moveTowardsTarget(soldierData, speed, onBlockCallback) {
    const soldier = soldierData.obj;
    if (!soldierData.targetPoint) return;

    const direction = soldierData.targetPoint.clone().sub(soldier.position).normalize();
    const raycaster = new THREE.Raycaster(soldier.position, direction, 0, COLLISION_CHECK_DISTANCE);
    const intersects = raycaster.intersectObjects(soldierData.collisionObjects);

    if (intersects.length > 0) {
        onBlockCallback();
    } else {
        soldier.position.add(direction.multiplyScalar(speed));
    }
}

function tryDetectPlayer(soldierData, player) {
    return soldierData.obj.position.distanceTo(player.position) < PLAYER_DETECT_DISTANCE;
}

function applyVerticalCollision(soldierData) {
    const soldier = soldierData.obj;
    const groundCheckOffset = 0.1;

    const downRaycaster = new THREE.Raycaster(
        new THREE.Vector3(soldier.position.x, soldier.position.y + groundCheckOffset, soldier.position.z),
        new THREE.Vector3(0, -1, 0)
    );

    const intersects = downRaycaster.intersectObjects(soldierData.collisionObjects);

    if (intersects.length > 0) {
        const groundY = intersects[0].point.y;
        const targetY = groundY + SOLDIER_VERTICAL_OFFSET;
        soldier.position.y = THREE.MathUtils.lerp(soldier.position.y, targetY, VERTICAL_SMOOTHING_FACTOR);
    } else {
        soldier.position.y -= 0.05;
    }
}

function getNewWanderTarget(currentPosition) {
    const targetX = currentPosition.x + (Math.random() * MAX_WANDER_DISTANCE - (MAX_WANDER_DISTANCE / 2));
    const targetZ = currentPosition.z + (Math.random() * MAX_WANDER_DISTANCE - (MAX_WANDER_DISTANCE / 2));
    return new THREE.Vector3(targetX, currentPosition.y, targetZ);
}

// ============================================================================================
// LÓGICA DE ANIMAÇÃO CORRIGIDA
// ============================================================================================

/**
 * Para todas as animações que estão em loop.
 * Inspirado na função `resetIsInLoopFlags` de SpritesExample2.js.
 * @param {object} actions - O objeto contendo todas as ações de animação do soldado.
 */
function stopAllActions(actions) {
    for (const key in actions) {
        if (actions[key].isInLoop) {
            actions[key].isInLoop = false;
        }
    }
}

/**
 * Atualiza a animação do sprite do soldado com base em seu estado e direção.
 * A lógica foi reestruturada com base em SpritesExample2.js para um controle de estado mais robusto.
 * @param {object} soldierData - Dados do soldado.
 * @param {object} player - Objeto do jogador.
 */
function updateSoldierAnimation(soldierData, player) {
    const soldier = soldierData.obj;
    const actions = soldierData.actions;

    let directionVector;
    const isMoving = soldierData.state === SOLDIER_STATE.WANDERING && soldierData.targetPoint;

    
    if (isMoving) {
        directionVector = soldierData.targetPoint.clone().sub(soldier.position);
    } else {
        directionVector = player.position.clone().sub(soldier.position);
    }

    const angle = Math.atan2(directionVector.x, directionVector.z);
    const angleDeg = THREE.MathUtils.radToDeg(angle);

    let directionName; 
    if (angleDeg > -22.5 && angleDeg <= 22.5) directionName = 'Down';
    else if (angleDeg > 22.5 && angleDeg <= 67.5) directionName = 'RD';
    else if (angleDeg > 67.5 && angleDeg <= 112.5) directionName = 'Right';
    else if (angleDeg > 112.5 && angleDeg <= 157.5) directionName = 'RU';
    else if (angleDeg > 157.5 || angleDeg <= -157.5) directionName = 'Up';
    else if (angleDeg > -157.5 && angleDeg <= -112.5) directionName = 'LU';
    else if (angleDeg > -112.5 && angleDeg <= -67.5) directionName = 'Left';
    else if (angleDeg > -67.5 && angleDeg <= -22.5) directionName = 'LD';

    // 3. Salva a última direção de movimento.
    if (isMoving) {
        soldierData.lastDirection = directionName;
    }
    const finalDirection = soldierData.lastDirection || 'Down';

    // 4. Determina qual tipo de ação deve ser executada (correr, atirar ou ficar parado).
    let actionToPlayName;
    if (soldierData.state === SOLDIER_STATE.LOOKING_AT_PLAYER) {
         actionToPlayName = 'ShootingDown';
    } else if (isMoving) {
        actionToPlayName = 'run' + directionName;
    } else {
        actionToPlayName = 'idle';
    }

    // 5. Executa a animação apenas se a ação mudou desde o último frame.
    if (soldierData.currentAction !== actionToPlayName) {
        stopAllActions(actions); // Garante que animações antigas parem.

        if (actionToPlayName === 'idle') {
            // No estado ocioso, define um único frame baseado na última direção.
            const frameMap = {
                'Down': [4, 0], 'RD': [4, 7], 'Right': [4, 6], 'RU': [4, 5],
                'Up': [4, 4], 'LU': [4, 3], 'Left': [4, 2], 'LD': [4, 1]
            };
            const frame = frameMap[finalDirection];
            if (frame) {
                soldierData.actionSprite.setFrame(frame[0], frame[1]);
            }
        } else {
            // Toca a animação de correr ou atirar em loop.
            if (actions[actionToPlayName]) {
                actions[actionToPlayName].playLoop();
            }
        }
        soldierData.currentAction = actionToPlayName; // Atualiza a ação atual.
    }
}


const PROJECTILE = { speed: 0.6, radius: 0.2, color: 0xff8800 };

function initProjectile(soldierData) {
    if (!soldierData.projectileArray) soldierData.projectileArray = [];
    const sphere = new THREE.SphereGeometry(PROJECTILE.radius, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: PROJECTILE.color });
    const projectile = new THREE.Mesh(sphere, material);
    soldierData.projectileArray.push({ mesh: projectile, isShooting: false, velocity: new THREE.Vector3(), targetPoint: new THREE.Vector3() });
    soldierData.obj.add(projectile);
}

function shootProjectile(soldierData, scene, player) {
    if (!soldierData.projectileArray || soldierData.projectileArray.length === 0) return;
    const projectileData = soldierData.projectileArray[soldierData.projectileArray.length - 1];
    const startPosition = new THREE.Vector3();
    soldierData.actionSprite.getWorldPosition(startPosition);
    soldierData.obj.remove(projectileData.mesh);
    scene.add(projectileData.mesh);
    projectileData.mesh.position.copy(startPosition);

    projectileData.isShooting = true;
    const targetPosition = player.position.clone();
    targetPosition.y += 1.5;
    const direction = new THREE.Vector3().subVectors(targetPosition, startPosition).normalize();
    projectileData.velocity.copy(direction).multiplyScalar(PROJECTILE.speed);
    projectileData.targetPoint.copy(targetPosition);

    soldierData.hasShot = true;
}

function moveProjectile(soldierData, scene, player) {
    if (!soldierData.projectileArray) return;
    for (let i = soldierData.projectileArray.length - 1; i >= 0; i--) {
        const pData = soldierData.projectileArray[i];
        if (pData.isShooting) {
            pData.mesh.position.add(pData.velocity);


            if (checkProjectileCollisionWithPlayer(pData.mesh, player)) {
                scene.remove(pData.mesh);
                pData.mesh.geometry.dispose();
                pData.mesh.material.dispose();
                soldierData.projectileArray.splice(i, 1);
                continue;
            }

            if (pData.mesh.position.distanceTo(pData.targetPoint) < PROJECTILE.speed) {
                scene.remove(pData.mesh);
                pData.mesh.geometry.dispose();
                pData.mesh.material.dispose();
                soldierData.projectileArray.splice(i, 1);
            }
        }
    }
}