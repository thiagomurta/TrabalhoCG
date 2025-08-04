import * as THREE from 'three';
import { getCollisionObjects, smoothEnemyRotation } from './inimigos.js';

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

 
export function movePainElemental(painElementalData, scenario, player, scene) {

    if (!painElementalData.collisionObjects) {
        painElementalData.collisionObjects = getCollisionObjects(scenario);
    }

    switch (painElementalData.state) {
        case PAINELEMENTAL_STATE.WANDERING:
            handleWanderingState(painElementalData, player);
            break;
        case PAINELEMENTAL_STATE.LOOKING_AT_PLAYER:
            handleLookingState(painElementalData, player, scene);
            break;
    }

    moveFireball(painElementalData, scene);

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

 
function handleLookingState(painElementalData, player, scene) {
    const painElemental = painElementalData.obj;

    moveTowardsTarget(painElementalData, WANDER_SPEED, () => {
        painElementalData.targetPoint = null; 
        painElementalData.state = PAINELEMENTAL_STATE.WANDERING; 
    });

    const playerPosition = player.position.clone();
    playerPosition.y = painElemental.position.y; 
    painElemental.lookAt(playerPosition);

    if (painElementalData.lookAtFrames === Math.floor(LOOK_AT_PLAYER_DURATION_FRAMES / 2) && !painElementalData.hasShot) {
        initFireball(painElementalData);
        shootFireball(painElementalData, scene, player);
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

// FIREBALL FUNCTIONS

const FIREBALL = {
    speed: 0.5, // Speed of the fireball
    radius: 0.4,
    widthSegments: 16,
    heightSegments: 16,
    color: 0xffff00, //YELLOW
    xOrigin: 0,
    yOrigin: 3,
    zOrigin: -2
};

function initFireball(painElementalData) {
    if (!painElementalData.fireballArray) {
        painElementalData.fireballArray = [];
    }
    const fireballArray = painElementalData.fireballArray;

    const sphereGeometry = new THREE.SphereGeometry(
      FIREBALL.radius,
      FIREBALL.widthSegments,
      FIREBALL.heightSegments
    )   
    const fireballMaterial = new THREE.MeshLambertMaterial({color:FIREBALL.color});
    const fireball = new THREE.Mesh(sphereGeometry, fireballMaterial);
    fireball.position.set(FIREBALL.xOrigin, FIREBALL.yOrigin, FIREBALL.zOrigin);    
    fireballArray.push({
      fireball: fireball, 
      isShooting: false,
      velocity: new THREE.Vector3(),
      targetPoint: new THREE.Vector3() 
    }); //set when shot 
    painElementalData.obj.add(fireball);
}

function moveFireball(painElementalData, scene) {
    const fireballArray = painElementalData.fireballArray;
    if (!fireballArray || fireballArray.length === 0) return; // No fireballs to move

    for (let i = fireballArray.length - 1; i >= 0; i--) {
        const fireballData = fireballArray[i];

        if (fireballData.isShooting) {
            const fireballMesh = fireballData.fireball;
            fireballMesh.position.add(fireballData.velocity);

            const distanceToTarget = fireballMesh.position.distanceTo(fireballData.targetPoint);
            if (distanceToTarget <= FIREBALL.speed) {
                // The fireball has arrived. Remove it.
                scene.remove(fireballMesh); 
                fireballMesh.geometry.dispose(); 
                fireballMesh.material.dispose();
                fireballArray.splice(i, 1); 
            }
        }
    }

}

function shootFireball(painElementalData, scene, player) {
    const fireballArray = painElementalData.fireballArray;
    if (!fireballArray || fireballArray.length === 0) return;

    // Find the last fireball that was initialized (it should be the one we want to shoot)
    const fireballData = fireballArray[fireballArray.length - 1];
    const fireballMesh = fireballData.fireball;

    // we manually get the fireball's world position, then move it from the painElemental to the scene
    // trying to do it automatically with scene.attach is messy idk why

    const startPosition = new THREE.Vector3();
    console.log(fireballData);
    fireballMesh.getWorldPosition(startPosition);
    painElementalData.obj.remove(fireballMesh);
    scene.add(fireballMesh);

    fireballMesh.position.copy(startPosition);

    // Set its state to 'shooting' so the moveFireball function will update it.
    fireballData.isShooting = true;
    const targetPosition = player.position.clone();
    const direction = new THREE.Vector3().subVectors(targetPosition, startPosition).normalize();
    fireballData.velocity.copy(direction).multiplyScalar(FIREBALL.speed);
    fireballData.targetPoint.copy(targetPosition);

    painElementalData.hasShot = true; //painElemental wont immediately shoot again
}