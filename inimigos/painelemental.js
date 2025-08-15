import * as THREE from 'three';
import { getCollisionObjects, smoothEnemyRotation, loadSkull, createHpBar, updateHpBar } from './inimigos.js';
import { SKULL_STATE, CHARGE_TARGET_DISTANCE } from './skull.js';

export const PAINELEMENTAL_STATE = {
    WANDERING: 'WANDERING',
    LOOKING_AT_PLAYER: 'LOOKING_AT_PLAYER',
};

const PLAYER_DETECT_DISTANCE = 20;
const LOOK_AT_PLAYER_DURATION_FRAMES = 90; 
const LOOK_AT_PLAYER_COOLDOWN_FRAMES = -60;
const MAX_WANDER_DISTANCE = 25;
const WANDER_SPEED = 0.05;
const PROXIMITY_THRESHOLD = 1.0;
const COLLISION_CHECK_DISTANCE = 1.0;
const PAINELEMENTAL_VERTICAL_OFFSET = 2.0;
const VERTICAL_SMOOTHING_FACTOR = 0.02;

 
export function movePainElemental(painElementalData, scenario, player, scene, enemies) {

    if (!painElementalData.collisionObjects) {
        painElementalData.collisionObjects = getCollisionObjects(scenario);
    }

    switch (painElementalData.state) {
        case PAINELEMENTAL_STATE.WANDERING:
            handleWanderingState(painElementalData, player);
            break;
        case PAINELEMENTAL_STATE.LOOKING_AT_PLAYER:
            handleLookingState(painElementalData, player, scene, enemies, scenario);
            break;
    }


    applyVerticalCollision(painElementalData);

}

 
function handleWanderingState(painElementalData, player) {
    if (tryDetectPlayer(painElementalData, player) && painElementalData.lookAtFrames >= 0) {
        console.log("PainElemental detected player, switching to LOOKING_AT_PLAYER state");
        painElementalData.hasShot = false;
        painElementalData.state = PAINELEMENTAL_STATE.LOOKING_AT_PLAYER;
        painElementalData.lookAtFrames = LOOK_AT_PLAYER_DURATION_FRAMES;
        return;
    }

    const painElemental = painElementalData.obj;
    const currentPosition = painElemental.position;

    // Create horizontal-only vectors for distance comparison
    const horizontalPosition = currentPosition.clone();
    horizontalPosition.y = 0;
    const horizontalTarget = painElementalData.targetPoint ? painElementalData.targetPoint.clone() : null;
    if (horizontalTarget) {
        horizontalTarget.y = 0;
    }
    
    if (!painElementalData.targetPoint || horizontalPosition.distanceTo(horizontalTarget) < PROXIMITY_THRESHOLD) {
        painElementalData.targetPoint = getNewWanderTarget(currentPosition);
    }

    moveTowardsTarget(painElementalData, WANDER_SPEED, () => {
        painElementalData.targetPoint = null;
    });

    if (painElementalData.lookAtFrames < 0) painElementalData.lookAtFrames++;
    if (painElementalData.targetPoint){
        smoothEnemyRotation(painElemental, painElementalData.targetPoint);
    }
}

 
function handleLookingState(painElementalData, player, scene, enemies, scenario) {
    const painElemental = painElementalData.obj;

    moveTowardsTarget(painElementalData, WANDER_SPEED, () => {
        painElementalData.targetPoint = null; 
        painElementalData.state = PAINELEMENTAL_STATE.WANDERING; 
    });

    const playerPosition = player.position.clone();
    playerPosition.y = painElemental.position.y; 
    painElemental.lookAt(playerPosition);

    if (painElementalData.lookAtFrames === Math.floor(LOOK_AT_PLAYER_DURATION_FRAMES / 2) && !painElementalData.hasShot) {
        shootSkull(painElementalData, scene, player, enemies, scenario);
    }
    
    painElementalData.lookAtFrames--;
    if (painElementalData.lookAtFrames <= 0) {
        painElementalData.state = PAINELEMENTAL_STATE.WANDERING;
        painElementalData.lookAtFrames = LOOK_AT_PLAYER_COOLDOWN_FRAMES;
    }
}

 
function moveTowardsTarget(painElementalData, speed, onBlockCallback) {
    const painElemental = painElementalData.obj;
    const currentPosition = painElemental.position;

    if (!painElementalData.targetPoint) return;

    const horizontalTarget = painElementalData.targetPoint.clone();
    horizontalTarget.y = currentPosition.y;

    const direction = horizontalTarget.sub(currentPosition).normalize();
    const raycaster = new THREE.Raycaster(currentPosition, direction, 0, COLLISION_CHECK_DISTANCE);
    const intersects = raycaster.intersectObjects(painElementalData.collisionObjects);

    if (intersects.length > 0) onBlockCallback(); 

        currentPosition.add(direction.multiplyScalar(speed));
}

 
function tryDetectPlayer(painElementalData, player) {
    const distanceToPlayer = painElementalData.obj.position.distanceTo(player.position);
    return distanceToPlayer < PLAYER_DETECT_DISTANCE;
}

 
function applyVerticalCollision(painElementalData) {
    const painElemental = painElementalData.obj;
    const currentPosition = painElemental.position;
    const collisionObjects = painElementalData.collisionObjects;
    const gravity = 0.005;
    const groundCheckOffset = 0.1;

    const downRaycaster = new THREE.Raycaster(
        new THREE.Vector3(currentPosition.x, currentPosition.y + groundCheckOffset, currentPosition.z),
        new THREE.Vector3(0, -1, 0)
    );

    const intersects = downRaycaster.intersectObjects(collisionObjects);

    if (intersects.length > 0) {
        // If ground is detected, smoothly interpolate to the target height above the ground.
        const groundY = intersects[0].point.y;
        const targetY = groundY + PAINELEMENTAL_VERTICAL_OFFSET;
        painElemental.position.y = THREE.MathUtils.lerp(currentPosition.y, targetY, VERTICAL_SMOOTHING_FACTOR);
    } else {
        // If no ground is detected, apply gravity to make it fall smoothly.
        painElemental.position.y -= gravity;
    }
}

 
function getNewWanderTarget(currentPosition) {
    const targetX = currentPosition.x + (Math.random() * MAX_WANDER_DISTANCE - (MAX_WANDER_DISTANCE / 2));
    const targetZ = currentPosition.z + (Math.random() * MAX_WANDER_DISTANCE - (MAX_WANDER_DISTANCE / 2));

    return new THREE.Vector3(targetX, currentPosition.y, targetZ);
}

async function shootSkull(painElementalData, scene, player, enemies, scenario) {
    if (painElementalData.skullsShot === undefined) painElementalData.skullsShot = 1;
    else painElementalData.skullsShot++;

    if (painElementalData.skullsShot > 5) return;
    painElementalData.hasShot = true;

    const painElemental = painElementalData.obj;
    const spawnPosition = new THREE.Vector3();
    painElemental.getWorldPosition(spawnPosition);
    spawnPosition.y += 1; 

    // skull object creation
    const skullModel = await loadSkull();
    const { hpBarSprite, context, texture } = createHpBar();
    const enemyGroup = new THREE.Group();
    enemyGroup.add(skullModel);
    hpBarSprite.position.y = 5;
    enemyGroup.add(hpBarSprite);

    enemyGroup.position.copy(spawnPosition);

    const skullData = {
        name: 'skull',
        obj: enemyGroup,
        id: Date.now() + Math.random(), // Unique ID
        boundingBox: new THREE.Box3().setFromObject(skullModel),
        targetPoint: null,
        state: SKULL_STATE.CHARGING,
        collisionObjects: getCollisionObjects(scenario),
        hp: 20,
        maxHp: 20,
        context: context,
        texture: texture,
        hpBar: hpBarSprite
    };

    // Set the charge target for the new skull
    const directionToPlayer = player.position.clone().sub(spawnPosition).normalize();
    const chargeDirection = new THREE.Vector3(directionToPlayer.x, 0, directionToPlayer.z).normalize();
    const targetOffset = chargeDirection.multiplyScalar(CHARGE_TARGET_DISTANCE);
    const targetPoint = spawnPosition.clone().add(targetOffset);
    targetPoint.y = spawnPosition.y;
    skullData.targetPoint = targetPoint;

    // Add the new skull to the game
    enemies.skulls.push(skullData);
    scene.add(enemyGroup);
    updateHpBar(skullData);
}