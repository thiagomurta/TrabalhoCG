import * as THREE from 'three';
import { getCollisionObjects, smoothEnemyRotation } from './inimigos.js';

export const SKULL_STATE = {
    WANDERING: 'WANDERING',
    CHARGING: 'CHARGING',
};

const PLAYER_DETECT_DISTANCE = {
        INSTA: 20,
        MIN: 25,
        MAX: 35
    };
const MAX_WANDER_DISTANCE = 20;
const DETECTION_ANGLE_THRESHOLD = Math.PI / 3; 
const CHARGE_TARGET_DISTANCE = 1000; 
const CHARGE_SPEED = 0.5;
const WANDER_SPEED = 0.1;
const PROXIMITY_THRESHOLD = 0.5;
const COLLISION_CHECK_DISTANCE = 0.5;
const SKULL_VERTICAL_OFFSET = 2;



export function moveSkull(skullData, scenario, player) {

    if (!skullData.collisionObjects) {
        skullData.collisionObjects = getCollisionObjects(scenario);
    }

    switch (skullData.state) {
        case SKULL_STATE.WANDERING:
            handleWanderingState(skullData, player);
            break;
        case SKULL_STATE.CHARGING:
            handleChargingState(skullData, player);
            break;
    }

    // Apply vertical collision logic to handle gravity and ground detection.
    applyVerticalCollision(skullData);
}

function applyVerticalCollision(skullData) {
    const skull = skullData.obj;
    const currentPosition = skull.position;
    const collisionObjects = skullData.collisionObjects;
    const gravity = 0.1; 
    const groundCheckOffset = 1; 

    const downRaycaster = new THREE.Raycaster(
        new THREE.Vector3(currentPosition.x, currentPosition.y + groundCheckOffset, currentPosition.z),
        new THREE.Vector3(0, -1, 0)
    );

    const intersects = downRaycaster.intersectObjects(collisionObjects);

    if (intersects.length > 0) {
        const groundY = intersects[0].point.y;
        skull.position.y = groundY + SKULL_VERTICAL_OFFSET;

    } else {
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

    moveTowardsTarget(skullData, WANDER_SPEED, () => {
        skullData.targetPoint = null;
    });
}

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

    moveTowardsTarget(skullData, CHARGE_SPEED,  
        () => {
            skullData.state = SKULL_STATE.WANDERING;
            skullData.targetPoint = null;
        }
    );

    
    if (skullData.targetPoint) smoothEnemyRotation(skull, skullData.targetPoint);
}

function moveTowardsTarget(skullData, speed, onBlockCallback) {
    const skull = skullData.obj;
    const currentPosition = skull.position;

    if (!skullData.targetPoint) return;

    const horizontalTarget = skullData.targetPoint.clone();
    horizontalTarget.y = currentPosition.y; 

    const direction = horizontalTarget.sub(currentPosition).normalize();

    const raycaster = new THREE.Raycaster(currentPosition, direction, 0, COLLISION_CHECK_DISTANCE);
    const intersects = raycaster.intersectObjects(skullData.collisionObjects);

    if (intersects.length > 0) {
        onBlockCallback();
    } else {
        smoothEnemyRotation(skull, skullData.targetPoint);
        currentPosition.add(direction.multiplyScalar(speed));
        //check if new currentPosition is outside boundaries, if so, reset targetPoint
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

    if (angleToPlayer < DETECTION_ANGLE_THRESHOLD || distanceToPlayer < PLAYER_DETECT_DISTANCE.INSTA) {
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
    if (distanceToPlayer > PLAYER_DETECT_DISTANCE.MIN) {
        if (state == SKULL_STATE.WANDERING) return true;
        
        if (distanceToPlayer > PLAYER_DETECT_DISTANCE.MAX) return true;
    }

    return false;
}