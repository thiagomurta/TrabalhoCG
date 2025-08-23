import * as THREE from 'three';
import { getCollisionObjects, smoothEnemyRotation } from './inimigos.js';
import { checkSkullCollision } from './damageHandler.js'; // Importa a nova função
import { playPositionalSound } from './../sons/sons.js';

export const SKULL_STATE = {
    WANDERING: 'WANDERING',
    CHARGING: 'CHARGING',
    CLIMBING: 'CLIMBING'
};

const PLAYER_DETECT_DISTANCE = {
        INSTA: 25,
        MIN: 20,
        MAX: 60
    };
const MAX_WANDER_DISTANCE = 20;
const DETECTION_ANGLE_THRESHOLD = Math.PI / 3; 
export const CHARGE_TARGET_DISTANCE = 1000; 
const CHARGE_SPEED = 0.8;
const WANDER_SPEED = 0.1;
const PROXIMITY_THRESHOLD = 0.5;
const COLLISION_CHECK_DISTANCE_DELTA = 0.5;
const SKULL_VERTICAL_OFFSET = 2;



export function moveSkull(skullData, scenario, player) {

    if (!skullData.collisionObjects) {
        skullData.collisionObjects = getCollisionObjects(scenario);
    }

    switch (skullData.state) {
        case SKULL_STATE.WANDERING:
            skullData.hasPlayed = false;
            handleWanderingState(skullData, player);
            break;
        case SKULL_STATE.CHARGING:
            if (!skullData.hasPlayed) {
                playPositionalSound('LOST_SOUL_ATTACK', skullData.obj);
                skullData.hasPlayed = true;
            }
            handleChargingState(skullData, player);
            break;
        case SKULL_STATE.CLIMBING:
            handleClimbingState(skullData);
            break;
    }

    if (skullData.state !== SKULL_STATE.CLIMBING)  applyVerticalCollision(skullData);
}

const VERTICAL_SMOOTHING_FACTOR = 0.1;
const GROUND_CHECK_OFFSETS = [ // Define the offsets for the ground check rays from the skull's center
    new THREE.Vector3(0, 0, 0),    // Center
    new THREE.Vector3(0.5, 0, 0),   // Right
    new THREE.Vector3(-0.5, 0, 0),  // Left
    new THREE.Vector3(0, 0, 0.5),   // Forward
    new THREE.Vector3(0, 0, -0.5)   // Back
];

function applyVerticalCollision(skullData) {
    const skull = skullData.obj;
    const currentPosition = skull.position;
    const collisionObjects = skullData.collisionObjects;
    const gravity = 0.1; 
    const groundCheckOffset = 1; 
    
    let groundFound = false;
    let highestGroundY = -Infinity;

    // Cast multiple rays downwards to check for ground
    for (const offset of GROUND_CHECK_OFFSETS) {
        const rayOrigin = currentPosition.clone().add(offset);
        rayOrigin.y += groundCheckOffset;

        const downRaycaster = new THREE.Raycaster(
            rayOrigin,
            new THREE.Vector3(0, -1, 0)
        );

        const intersects = downRaycaster.intersectObjects(collisionObjects);

        if (intersects.length > 0) {
            groundFound = true;
            if (intersects[0].point.y > highestGroundY) {
                highestGroundY = intersects[0].point.y;
            }
        }
    }

    if (groundFound) {
        const targetY = highestGroundY + SKULL_VERTICAL_OFFSET;
        skull.position.y += (targetY - skull.position.y) * VERTICAL_SMOOTHING_FACTOR;
    } else {
        // Only apply gravity if ALL rays miss the ground
        skull.position.y -= gravity;
    }
}

function handleWanderingState(skullData, player) {

    if (tryDetectPlayer(skullData, player)) {
        skullData.state = SKULL_STATE.CHARGING;
        return; // Switch state and exit this logic for the current frame.
    }

    const skull = skullData.obj;
    const currentPosition = skull.position;

    const horizontalPosition = currentPosition.clone();
    horizontalPosition.y = 0;
    const horizontalTarget = skullData.targetPoint ? skullData.targetPoint.clone() : null;
    if (horizontalTarget) {
        horizontalTarget.y = 0;
    }

    if (!skullData.targetPoint || horizontalPosition.distanceTo(horizontalTarget) < PROXIMITY_THRESHOLD) {
        skullData.targetPoint = getNewWanderTarget(currentPosition);
    }

    moveTowardsTarget(skullData, WANDER_SPEED, (direction) => {
            skullData.state = SKULL_STATE.CLIMBING;
            const hitObject = skullData.hitObject;
            const wallBBox = new THREE.Box3().setFromObject(hitObject);
            const wallTopY = wallBBox.max.y;
            
            if ((wallTopY - currentPosition.y) < MAX_CLIMB_HEIGHT) {
                const newTarget = skull.position.clone().add(direction.multiplyScalar(2));
                newTarget.y = wallTopY + SKULL_VERTICAL_OFFSET; 

                skullData.targetPoint = newTarget;
            } else {
                skullData.state = SKULL_STATE.WANDERING;
                skullData.targetPoint = null;
            }
        });
}

const MAX_CLIMB_HEIGHT = 6.5;
function handleChargingState(skullData, player) {
    const skull = skullData.obj;
    const currentPosition = skull.position;
    const playerPosition = player.position;

    const noTarget = !skullData.targetPoint;
    const isTooCloseToTarget = currentPosition.distanceTo(skullData.targetPoint) < PROXIMITY_THRESHOLD;
    const playerTooFar = isPlayerTooFar(currentPosition.distanceTo(playerPosition));

    if (noTarget || isTooCloseToTarget || playerTooFar) {
        skullData.state = SKULL_STATE.WANDERING;
        skullData.targetPoint = null;
        return;
    }

    checkSkullCollision(skullData, player);

    moveTowardsTarget(skullData, CHARGE_SPEED,  
        (direction) => {
            skullData.state = SKULL_STATE.CLIMBING;
            const hitObject = skullData.hitObject;
            const wallBBox = new THREE.Box3().setFromObject(hitObject);
            const wallTopY = wallBBox.max.y;

            
            if ((wallTopY - (currentPosition.y - SKULL_VERTICAL_OFFSET)) < MAX_CLIMB_HEIGHT) {
                const newTarget = skull.position.clone().add(direction.multiplyScalar(2));
                newTarget.y = wallTopY + SKULL_VERTICAL_OFFSET + 1; 

                skullData.targetPoint = newTarget;
            } else {
                skullData.state = SKULL_STATE.WANDERING;
                skullData.targetPoint = null;
            }
        }
    );

    
    if (skullData.targetPoint) smoothEnemyRotation(skull, skullData.targetPoint);
}

const MAX_CHAIN_CLIMB_DISTANCE = 3; // How close the next object must be to chain a climb

function handleClimbingState(skullData) {
    const skull = skullData.obj;
    const current_x = skull.position.x;
    const current_z = skull.position.z;
    const target = skullData.targetPoint.clone();
    target.x = current_x;
    target.z = current_z;

    if (!target) {
        skullData.state = SKULL_STATE.WANDERING;
        return;
    }
    
    const climbSpeed = WANDER_SPEED;
    skull.position.lerp(target, climbSpeed);

    if (skull.position.distanceTo(target) < 0.1) {
        skull.position.copy(target); 

        // UPWARD CHECK FOR CHAINED CLIMB ---
        const upRaycaster = new THREE.Raycaster(
            skull.position, 
            new THREE.Vector3(skullData.targetPoint.x - skull.position.x, 5, skullData.targetPoint.z - skull.position.z), 
            0, 
            MAX_CHAIN_CLIMB_DISTANCE
        );
        const intersects = upRaycaster.intersectObjects(skullData.collisionObjects);

        if (intersects.length > 0) {
            const hitObject = intersects[0].object;
            const wallBBox = new THREE.Box3().setFromObject(hitObject);
            const wallTopY = wallBBox.max.y;

            const newTarget = skull.position.clone();
            newTarget.y = wallTopY + SKULL_VERTICAL_OFFSET; 
            skullData.targetPoint = newTarget;
            
        } else {
            
            skullData.state = SKULL_STATE.WANDERING;
            skullData.targetPoint = null; 
        }
    }
}
function moveTowardsTarget(skullData, speed, onBlockCallback) {
    const skull = skullData.obj;
    const currentPosition = skull.position;

    if (!skullData.targetPoint) return;

    const horizontalTarget = skullData.targetPoint.clone();
    horizontalTarget.y = currentPosition.y; 

    const direction = horizontalTarget.sub(currentPosition).normalize();
    const COLLISION_CHECK_DISTANCE = speed + COLLISION_CHECK_DISTANCE_DELTA;
    const raycaster = new THREE.Raycaster(currentPosition, direction, 0, COLLISION_CHECK_DISTANCE);
    const intersects = raycaster.intersectObjects(skullData.collisionObjects);

    let wallBBox = 0;
    if (intersects.length > 0) {
            const hitObject = intersects[0].object;
            wallBBox = new THREE.Box3().setFromObject(hitObject); }
    
    const wallTopY = wallBBox ? wallBBox.max.y : 999;


    if (intersects.length > 0 && (wallTopY - currentPosition.y) > 1) {
        skullData.hitObject = intersects[0].object;
        onBlockCallback(direction);
    } else {
        smoothEnemyRotation(skull, skullData.targetPoint);
        currentPosition.add(direction.multiplyScalar(speed));
    }
}

function tryDetectPlayer(skullData, player) {
    const skull = skullData.obj;
    const currentPosition = skull.position;
    const playerPosition = player.position;

    const distanceToPlayer = currentPosition.distanceTo(playerPosition);

    if (isPlayerTooFar(distanceToPlayer, skullData.state)) return false;

    const directionToPlayer = playerPosition.clone().sub(currentPosition).normalize();
    const lookDirection = skull.getWorldDirection(new THREE.Vector3());
    const angleToPlayer = lookDirection.angleTo(directionToPlayer);

    if (angleToPlayer < DETECTION_ANGLE_THRESHOLD || distanceToPlayer <= PLAYER_DETECT_DISTANCE.INSTA) {
        console.log("PLAYER DETECTED");
        const chargeDirection = new THREE.Vector3(directionToPlayer.x, 0, directionToPlayer.z).normalize();
        const targetOffset = chargeDirection.multiplyScalar(CHARGE_TARGET_DISTANCE);
        const targetPoint = currentPosition.clone().add(targetOffset);
        targetPoint.y = currentPosition.y; // Keep the original y value
        skullData.targetPoint = targetPoint;
        return true;
    }

    return false;
}

function getNewWanderTarget(currentPosition) {
    const targetX = currentPosition.x + (Math.random() * MAX_WANDER_DISTANCE - MAX_WANDER_DISTANCE / 2);
    const targetZ = currentPosition.z + (Math.random() * MAX_WANDER_DISTANCE - MAX_WANDER_DISTANCE / 2);

    return new THREE.Vector3(targetX, currentPosition.y, targetZ);
}

function isPlayerTooFar(distanceToPlayer, state) {
    if (distanceToPlayer > PLAYER_DETECT_DISTANCE.MAX) return true;
    return false;
}