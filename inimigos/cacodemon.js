import * as THREE from 'three';
import { getCollisionObjects } from './inimigos.js';

export const CACODEMON_STATE = {
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
const CACODEMON_VERTICAL_OFFSET = 3.0;

 
export function moveCacodemon(cacodemonData, scenario, player) {

    if (!cacodemonData.collisionObjects) {
        cacodemonData.collisionObjects = getCollisionObjects(scenario);
    }

    switch (cacodemonData.state) {
        case CACODEMON_STATE.WANDERING:
            handleWanderingState(cacodemonData, player);
            break;
        case CACODEMON_STATE.LOOKING_AT_PLAYER:
            handleLookingState(cacodemonData, player);
            break;
    }
    console.log("cacodemon lookat frames: ", cacodemonData.lookAtFrames);

    applyVerticalCollision(cacodemonData);

}

 
function handleWanderingState(cacodemonData, player) {
    if (tryDetectPlayer(cacodemonData, player) && cacodemonData.lookAtFrames >= 0) {
        console.log("Cacodemon detected player, switching to LOOKING_AT_PLAYER state");
        cacodemonData.state = CACODEMON_STATE.LOOKING_AT_PLAYER;
        cacodemonData.lookAtFrames = LOOK_AT_PLAYER_DURATION_FRAMES;
        return;
    }

    const cacodemon = cacodemonData.obj;
    const currentPosition = cacodemon.position;

    // Create horizontal-only vectors for distance comparison
    const horizontalPosition = currentPosition.clone();
    horizontalPosition.y = 0;
    const horizontalTarget = cacodemonData.targetPoint ? cacodemonData.targetPoint.clone() : null;
    if (horizontalTarget) {
        horizontalTarget.y = 0;
    }
    
    if (!cacodemonData.targetPoint || horizontalPosition.distanceTo(horizontalTarget) < PROXIMITY_THRESHOLD) {
        cacodemonData.targetPoint = getNewWanderTarget(currentPosition);
    }

    moveTowardsTarget(cacodemonData, WANDER_SPEED, () => {
        cacodemonData.targetPoint = null;
    });

    if (cacodemonData.lookAtFrames < 0) cacodemonData.lookAtFrames++;
    if (cacodemonData.targetPoint){
    const lookAtTarget = cacodemonData.targetPoint.clone();
    lookAtTarget.y = currentPosition.y; 
    cacodemon.lookAt(lookAtTarget);}
}

 
function handleLookingState(cacodemonData, player) {
    const cacodemon = cacodemonData.obj;

    moveTowardsTarget(cacodemonData, WANDER_SPEED, () => {
        cacodemonData.targetPoint = null; 
        cacodemonData.state = CACODEMON_STATE.WANDERING; 
    });

    const playerPosition = player.position.clone();
    playerPosition.y = cacodemon.position.y; 
    cacodemon.lookAt(playerPosition);
    
    cacodemonData.lookAtFrames--;
    if (cacodemonData.lookAtFrames <= 0) {
        cacodemonData.state = CACODEMON_STATE.WANDERING;
        cacodemonData.lookAtFrames = LOOK_AT_PLAYER_COOLDOWN_FRAMES;
    }
}

 
function moveTowardsTarget(cacodemonData, speed, onBlockCallback) {
    const cacodemon = cacodemonData.obj;
    const currentPosition = cacodemon.position;

    if (!cacodemonData.targetPoint) return;

    const horizontalTarget = cacodemonData.targetPoint.clone();
    horizontalTarget.y = currentPosition.y;

    const direction = horizontalTarget.sub(currentPosition).normalize();
    const raycaster = new THREE.Raycaster(currentPosition, direction, 0, COLLISION_CHECK_DISTANCE);
    const intersects = raycaster.intersectObjects(cacodemonData.collisionObjects);

    if (intersects.length > 0) onBlockCallback(); 

        currentPosition.add(direction.multiplyScalar(speed));
}

 
function tryDetectPlayer(cacodemonData, player) {
    const distanceToPlayer = cacodemonData.obj.position.distanceTo(player.position);
    return distanceToPlayer < PLAYER_DETECT_DISTANCE;
}

 
function applyVerticalCollision(cacodemonData) {
    const cacodemon = cacodemonData.obj;
    const currentPosition = cacodemon.position;
    const collisionObjects = cacodemonData.collisionObjects;
    const gravity = 0.08;
    const groundCheckOffset = 0.1; 

    const downRaycaster = new THREE.Raycaster(
        new THREE.Vector3(currentPosition.x, currentPosition.y + groundCheckOffset, currentPosition.z),
        new THREE.Vector3(0, -1, 0)
    );

    const intersects = downRaycaster.intersectObjects(collisionObjects);

    if (intersects.length > 0) {
        
        const groundY = intersects[0].point.y;
        
        cacodemon.position.y = groundY + CACODEMON_VERTICAL_OFFSET;
    } else {
        
        cacodemon.position.y -= gravity;
    }
}

 
function getNewWanderTarget(currentPosition) {
    const targetX = currentPosition.x + (Math.random() * MAX_WANDER_DISTANCE - (MAX_WANDER_DISTANCE / 2));
    const targetZ = currentPosition.z + (Math.random() * MAX_WANDER_DISTANCE - (MAX_WANDER_DISTANCE / 2));

    return new THREE.Vector3(targetX, currentPosition.y, targetZ);
}
