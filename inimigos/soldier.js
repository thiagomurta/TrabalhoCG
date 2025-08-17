import * as THREE from 'three';
import { getCollisionObjects } from './inimigos.js';
import { checkProjectileCollisionWithPlayer } from './damageHandler.js';

// =============================================================================
// CONSTANTS
// =============================================================================

export const SOLDIER_STATE = {
    WANDERING: 'WANDERING',
    LOOKING_AT_PLAYER: 'LOOKING_AT_PLAYER',
};

// --- AI Behavior Constants ---
const PLAYER_DETECT_DISTANCE = 30; // Distance at which a soldier can detect the player.
const MAX_WANDER_DISTANCE = 20; // Maximum distance a soldier will wander from its current position.
const WANDER_SPEED = 0.04; // Movement speed while wandering.
const PROXIMITY_THRESHOLD = 1.0; // How close a soldier needs to be to its target point to consider it "reached".
const COLLISION_CHECK_DISTANCE = 1.0; // How far ahead to check for collisions when moving.

// --- Timing Constants (in frames) ---
const LOOK_AT_PLAYER_DURATION_FRAMES = 120; // How long the soldier stares at the player before shooting.
const LOOK_AT_PLAYER_COOLDOWN_FRAMES = -90; // Cooldown period after looking at the player.

// --- Physics & Positioning Constants ---
const SOLDIER_VERTICAL_OFFSET = 2; // How high the soldier hovers above the ground.
const VERTICAL_SMOOTHING_FACTOR = 0.02; // Smoothing factor for vertical movement (lerp).
const GROUND_CHECK_OFFSET = 0.1; // Small offset for the ground-checking raycaster.
const GRAVITY_FALL_SPEED = 0.05; // Speed at which the soldier falls if no ground is detected.

// --- Projectile Constants ---
const PROJECTILE_SPEED = 0.6;
const PROJECTILE_RADIUS = 0.2;
const PROJECTILE_COLOR = 0xff8800;
const PROJECTILE_PLAYER_HITBOX_RADIUS = 2; // Hitbox radius around the player for projectile collision.
const PROJECTILE_TARGET_Y_OFFSET = 1.5; // Vertical offset for aiming at the player.

// =============================================================================
// MAIN SOLDIER LOGIC
// =============================================================================

export function moveSoldier(soldierData, scenario, player, scene, camera) {
    // Initialize collision objects once.
    if (!soldierData.collisionObjects) {
        soldierData.collisionObjects = getCollisionObjects(scenario);
    }

    // Update animations.
    soldierData.spriteMixer.update(soldierData.clock.getDelta());

    // NOTE: Billboarding (forcing sprite to face camera) has been removed
    // to implement the fixed-angle sprite system. The sprite's visual
    // orientation is now handled entirely by the animation logic.

    // State machine for soldier AI.
    switch (soldierData.state) {
        case SOLDIER_STATE.WANDERING:
            handleWanderingState(soldierData, player);
            break;
        case SOLDIER_STATE.LOOKING_AT_PLAYER:
            handleLookingState(soldierData, player, scene);
            break;
    }

    // Update any active projectiles.
    moveProjectiles(soldierData, scene, player);

    // Handle vertical positioning and ground collision.
    applyVerticalCollision(soldierData);

    // Update the soldier's animation based on its current state and direction.
    updateSoldierAnimation(soldierData, player, camera);
}

// =============================================================================
// AI STATE HANDLERS
// =============================================================================

function handleWanderingState(soldierData, player) {
    // If the player is detected and the cooldown is over, switch to LOOKING state.
    if (tryDetectPlayer(soldierData, player) && soldierData.lookAtFrames >= 0) {
        soldierData.hasShot = false;
        soldierData.state = SOLDIER_STATE.LOOKING_AT_PLAYER;
        soldierData.lookAtFrames = LOOK_AT_PLAYER_DURATION_FRAMES;
        return;
    }

    // If the soldier doesn't have a target or has reached it, find a new one.
    if (!soldierData.targetPoint || soldierData.obj.position.distanceTo(soldierData.targetPoint) < PROXIMITY_THRESHOLD) {
        soldierData.targetPoint = getNewWanderTarget(soldierData.obj.position);
    }

    // Move towards the target, handling potential collisions.
    moveTowardsTarget(soldierData, WANDER_SPEED, () => {
        // If blocked, clear the target to find a new path on the next frame.
        soldierData.targetPoint = null;
    });

    // Increment the cooldown timer if it's active.
    if (soldierData.lookAtFrames < 0) {
        soldierData.lookAtFrames++;
    }
}

function handleLookingState(soldierData, player, scene) {
    soldierData.targetPoint = null; // Stop wandering.

    // Shoot at the halfway point of the "looking" duration.
    const halfwayPoint = Math.floor(LOOK_AT_PLAYER_DURATION_FRAMES / 2);
    if (soldierData.lookAtFrames === halfwayPoint && !soldierData.hasShot) {
        shootProjectile(soldierData, scene, player);
    }

    // Countdown frames. When done, switch back to wandering and start the cooldown.
    soldierData.lookAtFrames--;
    if (soldierData.lookAtFrames <= 0) {
        soldierData.state = SOLDIER_STATE.WANDERING;
        soldierData.lookAtFrames = LOOK_AT_PLAYER_COOLDOWN_FRAMES;
    }
}


// =============================================================================
// MOVEMENT & COLLISION
// =============================================================================

function moveTowardsTarget(soldierData, speed, onBlockCallback) {
    if (!soldierData.targetPoint) return;

    const soldier = soldierData.obj;
    const direction = soldierData.targetPoint.clone().sub(soldier.position).normalize();

    // Raycast forward to check for obstacles.
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

    // Raycast downwards to find the ground.
    const downRaycaster = new THREE.Raycaster(
        new THREE.Vector3(soldier.position.x, soldier.position.y + GROUND_CHECK_OFFSET, soldier.position.z),
        new THREE.Vector3(0, -1, 0)
    );

    const intersects = downRaycaster.intersectObjects(soldierData.collisionObjects);

    if (intersects.length > 0) {
        const groundY = intersects[0].point.y;
        const targetY = groundY + SOLDIER_VERTICAL_OFFSET;
        // Smoothly interpolate to the target height to avoid jittering.
        soldier.position.y = THREE.MathUtils.lerp(soldier.position.y, targetY, VERTICAL_SMOOTHING_FACTOR);
    } else {
        // If no ground is found, apply gravity.
        soldier.position.y -= GRAVITY_FALL_SPEED;
    }
}

function getNewWanderTarget(currentPosition) {
    const offsetX = (Math.random() * MAX_WANDER_DISTANCE) - (MAX_WANDER_DISTANCE / 2);
    const offsetZ = (Math.random() * MAX_WANDER_DISTANCE) - (MAX_WANDER_DISTANCE / 2);
    return new THREE.Vector3(currentPosition.x + offsetX, currentPosition.y, currentPosition.z + offsetZ);
}


// =============================================================================
// ANIMATION
// =============================================================================

function updateSoldierAnimation(soldierData, player, camera) {
    const { obj: soldier, actions, actionSprite } = soldierData;

    // 1. Determine the soldier's world-space action vector.
    let actionVector = new THREE.Vector3();
    if (soldierData.targetPoint) {
        // If wandering, the action is the movement direction.
        actionVector.subVectors(soldierData.targetPoint, soldier.position);
    } else {
        // If idle or shooting, the action is to face the player.
        actionVector.subVectors(player.position, soldier.position);
    }
    actionVector.y = 0; // We only care about the direction on the horizontal plane.
    actionVector.normalize();

    // 2. Get the camera's direction on the horizontal plane.
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    // 3. Calculate the angle of the action relative to the camera's view.
    const actionAngle = Math.atan2(actionVector.x, actionVector.z);
    const cameraAngle = Math.atan2(cameraDirection.x, cameraDirection.z);
    
    // The final angle determines which sprite to show (e.g., "run up" is for moving away from camera).
    const relativeAngle = actionAngle - cameraAngle;

    // 4. Convert the relative angle to an 8-way direction string.
    const direction = getDirectionFromAngle(relativeAngle);
    soldierData.lastDirection = direction;

    // 5. Play the correct animation based on state and the calculated direction.
    if (soldierData.state === SOLDIER_STATE.LOOKING_AT_PLAYER) {
        const shootingDirection = direction.replace('run', 'Shooting');
        if (actions[shootingDirection] && !actions[shootingDirection].isInLoop) {
            actions[shootingDirection].playLoop();
        }
    } else if (soldierData.targetPoint) {
        // If wandering towards a point, play the run animation.
        if (actions[direction] && !actions[direction].isInLoop) {
            actions[direction].playLoop();
        }
    } else {
        // If idle, set a static frame based on the direction to the player.
        const frameMap = {
            'runDown': [4, 0], 'runRD': [4, 7], 'runRight': [4, 6],
            'runRU': [4, 5], 'runUp': [4, 4], 'runLU': [4, 3],
            'runLeft': [4, 2], 'runLD': [4, 1]
        };
        const frame = frameMap[direction];
        if (frame) {
            actionSprite.setFrame(frame[0], frame[1]);
        }
    }
}

function getDirectionFromAngle(angleRad) {
    // This function now correctly interprets the angle relative to the camera's forward direction.
    // For example, an angle of PI (180 degrees) means the character is moving directly towards the camera.
    const angleDeg = THREE.MathUtils.radToDeg(angleRad);

    if (angleDeg > -22.5 && angleDeg <= 22.5) return 'runUp'; // Moving away from camera
    if (angleDeg > 22.5 && angleDeg <= 67.5) return 'runRU';
    if (angleDeg > 67.5 && angleDeg <= 112.5) return 'runRight'; // Moving right relative to camera
    if (angleDeg > 112.5 && angleDeg <= 157.5) return 'runRD';
    if (angleDeg > 157.5 || angleDeg <= -157.5) return 'runDown'; // Moving towards camera
    if (angleDeg > -157.5 && angleDeg <= -112.5) return 'runLD';
    if (angleDeg > -112.5 && angleDeg <= -67.5) return 'runLeft'; // Moving left relative to camera
    if (angleDeg > -67.5 && angleDeg <= -22.5) return 'runLU';
    return 'runDown'; // Default fallback
}


// =============================================================================
// PROJECTILE HANDLING
// =============================================================================

function shootProjectile(soldierData, scene, player) {
    if (!soldierData.projectileArray) {
        soldierData.projectileArray = [];
    }

    // Create the projectile mesh.
    const geometry = new THREE.SphereGeometry(PROJECTILE_RADIUS, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: PROJECTILE_COLOR });
    const projectileMesh = new THREE.Mesh(geometry, material);

    // Get world position of the sprite to use as the starting point.
    const startPosition = new THREE.Vector3();
    soldierData.actionSprite.getWorldPosition(startPosition);
    
    // Add projectile to the main scene, not the soldier object.
    scene.add(projectileMesh);
    projectileMesh.position.copy(startPosition);

    // Calculate the direction towards the player.
    const targetPosition = player.position.clone();
    targetPosition.y += PROJECTILE_TARGET_Y_OFFSET;
    const direction = new THREE.Vector3().subVectors(targetPosition, startPosition).normalize();

    // Create the projectile data object.
    const projectileData = {
        mesh: projectileMesh,
        velocity: direction.multiplyScalar(PROJECTILE_SPEED),
        targetPoint: targetPosition,
    };

    soldierData.projectileArray.push(projectileData);
    soldierData.hasShot = true;
}

function moveProjectiles(soldierData, scene, player) {
    if (!soldierData.projectileArray) return;

    // Loop backwards to safely remove items from the array while iterating.
    for (let i = soldierData.projectileArray.length - 1; i >= 0; i--) {
        const pData = soldierData.projectileArray[i];

        // Update position.
        pData.mesh.position.add(pData.velocity);

        // Check for collision with the player.
        const hitPlayer = checkProjectileCollisionWithPlayer(pData.mesh, player, PROJECTILE_PLAYER_HITBOX_RADIUS);

        // Check if the projectile has reached its target destination.
        const reachedTarget = pData.mesh.position.distanceTo(pData.targetPoint) < PROJECTILE_SPEED;

        if (hitPlayer || reachedTarget) {
            // Remove projectile from the scene and the array.
            removeProjectile(pData, soldierData.projectileArray, i, scene);
        }
    }
}

function removeProjectile(projectileData, projectileArray, index, scene) {
    scene.remove(projectileData.mesh);
    projectileData.mesh.geometry.dispose();
    projectileData.mesh.material.dispose();
    projectileArray.splice(index, 1);
}
