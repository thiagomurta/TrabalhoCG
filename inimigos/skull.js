import * as THREE from 'three';
// Assuming these constants are defined correctly in the specified file.
import { AREA_DIMENSION, AREAS_Z, AREAS_Y } from '../inimigos.js';


export const SKULL_STATE = {
    WANDERING: 'WANDERING',
    CHARGING: 'CHARGING',
};

const PLAYER_DETECT_DISTANCE = 
    {
        MIN: 6,
        MAX: 25,
    };
const DETECTION_ANGLE_THRESHOLD = Math.PI / 4; 
const CHARGE_TARGET_DISTANCE = 1000; 
const CHARGE_SPEED = 0.5;
const WANDER_SPEED = 0.1;
const PROXIMITY_THRESHOLD = 0.5;
const COLLISION_CHECK_DISTANCE = 0.5;


export function moveSkull(skullData, scenario, player) {

    if (!skullData.collisionObjects) {
        skullData.collisionObjects = getCollisionObjects(scenario);
    }

    switch (skullData.state) {
        case SKULL_STATE.WANDERING:
            handleWanderingState(skullData, player);
            break;
        case SKULL_STATE.CHARGING:
            handleChargingState(skullData);
            break;
    }
}

function handleWanderingState(skullData, player) {

    if (tryDetectPlayer(skullData, player)) {
        skullData.state = SKULL_STATE.CHARGING;
        return; // Switch state and exit this logic for the current frame.
    }

    const skull = skullData.obj;
    const currentPosition = skull.position;

    if (!skullData.targetPoint || currentPosition.distanceTo(skullData.targetPoint) < PROXIMITY_THRESHOLD) {
        skullData.targetPoint = getNewWanderTarget();
    }

    moveTowardsTarget(skullData, WANDER_SPEED, () => {
        skullData.targetPoint = null;
    });
}

function handleChargingState(skullData) {
    const skull = skullData.obj;
    const currentPosition = skull.position;

    if (!skullData.targetPoint || currentPosition.distanceTo(skullData.targetPoint) < PROXIMITY_THRESHOLD) {
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
}

function moveTowardsTarget(skullData, speed, onBlockCallback) {
    const skull = skullData.obj;
    const currentPosition = skull.position;

    if (!skullData.targetPoint) return;

    const direction = skullData.targetPoint.clone().sub(currentPosition).normalize();

    const raycaster = new THREE.Raycaster(currentPosition, direction, 0, COLLISION_CHECK_DISTANCE);
    const intersects = raycaster.intersectObjects(skullData.collisionObjects);

    if (intersects.length > 0) {
        onBlockCallback();
    } else {
        skull.lookAt(skullData.targetPoint);
        currentPosition.add(direction.multiplyScalar(speed));
        //check if new currentPosition is outside boundaries, if so, reset targetPoint
        if (Math.abs(currentPosition.x) > AREA_DIMENSION / 2 || Math.abs(currentPosition.z - AREAS_Z) > AREA_DIMENSION / 2) {
            console.warn("Skull is out of bounds, resetting target point.");
            skullData.targetPoint = null;
            skullData.state = SKULL_STATE.WANDERING; // Reset state to wandering
        }
    }
}

function tryDetectPlayer(skullData, player) {
    const skull = skullData.obj;
    const currentPosition = skull.position;
    const playerPosition = player.position;

    const distanceToPlayer = currentPosition.distanceTo(playerPosition);

    if (isPlayerTooFar(distanceToPlayer)) return false;

    const directionToPlayer = playerPosition.clone().sub(currentPosition).normalize();
    const lookDirection = skull.getWorldDirection(new THREE.Vector3());
    const angleToPlayer = lookDirection.angleTo(directionToPlayer);

    if (angleToPlayer < DETECTION_ANGLE_THRESHOLD || distanceToPlayer < PLAYER_DETECT_DISTANCE.MIN) {
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

function getNewWanderTarget() {
    const halfDim = AREA_DIMENSION / 2;
    const targetX = Math.random() * AREA_DIMENSION - halfDim;
    const targetZ = AREAS_Z + (Math.random() * AREA_DIMENSION - halfDim);

    return new THREE.Vector3(targetX, AREAS_Y, targetZ);
}

function getCollisionObjects(scenario) {
    const LEFTMOST_BOX = scenario.objects[0];
    const UPPER_MIDDLE_BOX = scenario.objects[1];
    const RIGHTMOST_BOX = scenario.objects[2];
    const LOWER_MIDDLE_BOX = scenario.objects[3];
    const NORTH_WALL = scenario.objects[4];
    const SOUTH_WALL = scenario.objects[5];
    const LEFT_WALL = scenario.objects[6];
    const RIGHT_WALL = scenario.objects[7];
    const PLANE = scenario.parent.children[0];
    const collisionObjects = [PLANE, LEFTMOST_BOX, UPPER_MIDDLE_BOX, RIGHTMOST_BOX, LOWER_MIDDLE_BOX, NORTH_WALL, SOUTH_WALL, LEFT_WALL, RIGHT_WALL];
    return collisionObjects;
}

function isPlayerTooFar(distanceToPlayer) {
    if (distanceToPlayer > PLAYER_DETECT_DISTANCE.MAX) {
        return true;
    }

    return false;
}