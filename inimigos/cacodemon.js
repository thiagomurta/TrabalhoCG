// MOVIMENTAÇÃO CACODEMON
import { getCollisionObjects } from './inimigos.js';
import * as THREE from 'three';

const MOVE_SPEED = 0.1;
const COLLISION_CHECK_DISTANCE = 0.5;

export function moveCacodemon(cacodemonData, scenario, player) {
    if (!cacodemonData.collisionObjects) cacodemonData.collisionObjects = getCollisionObjects(scenario);

    handleWanderingState(cacodemonData, player);
    
    applyVerticalCollision(cacodemonData);
}

function getNewWanderTarget(currentPosition) {
    const targetX = currentPosition.x + (Math.random() * MAX_WANDER_DISTANCE - MAX_WANDER_DISTANCE / 2);
    const targetZ = currentPosition.z + (Math.random() * MAX_WANDER_DISTANCE - MAX_WANDER_DISTANCE / 2);

    return new THREE.Vector3(targetX, currentPosition.y, targetZ);
}

function handleWanderingState(cacodemonData, player) {
    const cacodemon = cacodemonData.obj;
    const currentPosition = cacodemon.position;
    const targetPoint = cacodemonData.targetPoint;

    if (!targetPoint) {
        cacodemonData.targetPoint = getNewWanderTarget(currentPosition);
        return;
    };

    const horizontalTarget = targetPoint.clone();
    horizontalTarget.y = currentPosition.y; // Keep the Y position constant
    const direction = horizontalTarget.sub(currentPosition).normalize();

    const raycaster = new THREE.Raycaster(currentPosition, direction, 0, COLLISION_CHECK_DISTANCE);
    const intersects = raycaster.intersectObjects(cacodemonData.collisionObjects);

    if (intersects.length > 0) {
        skullData.targetPoint = null; 
        return;
    }

    cacodemon.position.add(direction.multiplyScalar(MOVE_SPEED)); // Move towards the target
}