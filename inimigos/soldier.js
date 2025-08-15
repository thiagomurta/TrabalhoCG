import * as THREE from 'three';
import { getCollisionObjects } from './inimigos.js';
import { checkProjectileCollisionWithPlayer } from './damageHandler.js';

// --- CONSTANTS ---
// Describes the soldier's current behavior
export const SOLDIER_STATE = {
    WANDERING: 'WANDERING',
    LOOKING_AT_PLAYER: 'LOOKING_AT_PLAYER',
};

// Gameplay parameters
const PLAYER_DETECT_DISTANCE = 30;
const LOOK_AT_PLAYER_DURATION_FRAMES = 120;
const LOOK_AT_PLAYER_COOLDOWN_FRAMES = -90;
const MAX_WANDER_DISTANCE = 20;
const WANDER_SPEED = 0.08;
const PROXIMITY_THRESHOLD = 1.0;
const COLLISION_CHECK_DISTANCE = 1.0;
const SOLDIER_VERTICAL_OFFSET = 0.9;
const VERTICAL_SMOOTHING_FACTOR = 0.02;

// Projectile parameters
const PROJECTILE = { speed: 0.6, radius: 0.2, color: 0xff8800 };


// ============================================================================================
//                                  MAIN SOLDIER LOGIC
// ============================================================================================

/**
 * Main function to update the soldier's state, position, and animation each frame.
 * @param {object} soldierData - The soldier's state object.
 * @param {object} scenario - The game's scenario data.
 * @param {object} player - The player object.
 * @param {THREE.Scene} scene - The main scene.
 * @param {THREE.Camera} camera - The main camera.
 */
export function moveSoldier(soldierData, scenario, player, scene, camera) {
    // Initialize collision objects on the first run
    if (!soldierData.collisionObjects) {
        soldierData.collisionObjects = getCollisionObjects(scenario);
    }
    // Update the sprite animation timer
    soldierData.spriteMixer.update(soldierData.clock.getDelta());

    // --- State Machine ---
    // Updates the soldier's behavior based on its current state
    switch (soldierData.state) {
        case SOLDIER_STATE.WANDERING:
            handleWanderingState(soldierData, player);
            break;
        case SOLDIER_STATE.LOOKING_AT_PLAYER:
            handleLookingState(soldierData, player, scene);
            break;
    }

    // Update any active projectiles
    moveProjectile(soldierData, scene, player);
    
    // Adjust the soldier's vertical position based on ground collision
    applyVerticalCollision(soldierData);

    // Update the soldier's sprite animation based on its movement and the camera's perspective
    updateAnimation(soldierData, player, camera);
}


// ============================================================================================
//                                BEHAVIOR STATE HANDLERS
// ============================================================================================

/**
 * Handles the 'WANDERING' state. The soldier moves to random points
 * and checks if the player is nearby.
 */
function handleWanderingState(soldierData, player) {
    // If the player is detected and the soldier is not on cooldown, switch to LOOKING state
    if (tryDetectPlayer(soldierData, player) && soldierData.lookAtFrames >= 0) {
        soldierData.hasShot = false;
        soldierData.state = SOLDIER_STATE.LOOKING_AT_PLAYER;
        soldierData.lookAtFrames = LOOK_AT_PLAYER_DURATION_FRAMES;
        return;
    }

    // If the soldier has no target or has reached it, find a new wander point
    const soldier = soldierData.obj;
    if (!soldierData.targetPoint || soldier.position.distanceTo(soldierData.targetPoint) < PROXIMITY_THRESHOLD) {
        soldierData.targetPoint = getNewWanderTarget(soldier.position);
    }

    // Move towards the target point, handling potential collisions
    moveTowardsTarget(soldierData, WANDER_SPEED, () => {
        soldierData.targetPoint = null; // Invalidate target if blocked
    });

    // Increment the cooldown timer if it's negative
    if (soldierData.lookAtFrames < 0) soldierData.lookAtFrames++;
}

/**
 * Handles the 'LOOKING_AT_PLAYER' state. The soldier stops, faces the player,
 * and shoots a projectile.
 */
function handleLookingState(soldierData, player, scene) {
    soldierData.targetPoint = null; // Stop wandering
    soldierData.velocity = new THREE.Vector3(0,0,0); // Explicitly stop movement

    // Shoot at the midpoint of the "looking" duration
    if (soldierData.lookAtFrames === Math.floor(LOOK_AT_PLAYER_DURATION_FRAMES / 2) && !soldierData.hasShot) {
        initProjectile(soldierData);
        shootProjectile(soldierData, scene, player);
    }

    // Countdown frames until returning to WANDERING state
    soldierData.lookAtFrames--;
    if (soldierData.lookAtFrames <= 0) {
        soldierData.state = SOLDIER_STATE.WANDERING;
        soldierData.lookAtFrames = LOOK_AT_PLAYER_COOLDOWN_FRAMES; // Start cooldown
    }
}


// ============================================================================================
//                             REFACTORED ANIMATION LOGIC
// ============================================================================================

/**
 * Determines the direction name (e.g., 'Up', 'Left', 'RD') from an angle.
 * The angle is relative to the camera's perspective.
 * @param {number} angleDeg - The relative angle in degrees.
 * @returns {string} The name of the direction.
 */
function getDirectionNameFromAngle(angleDeg) {
    if (angleDeg > -22.5 && angleDeg <= 22.5) return 'Down';
    if (angleDeg > 22.5 && angleDeg <= 67.5) return 'RD';
    if (angleDeg > 67.5 && angleDeg <= 112.5) return 'Right';
    if (angleDeg > 112.5 && angleDeg <= 157.5) return 'RU';
    if (angleDeg > 157.5 || angleDeg <= -157.5) return 'Up'; // Handles the angle wrap-around
    if (angleDeg > -157.5 && angleDeg <= -112.5) return 'LU';
    if (angleDeg > -112.5 && angleDeg <= -67.5) return 'Left';
    if (angleDeg > -67.5 && angleDeg <= -22.5) return 'LD';
    return 'Down'; // Fallback direction
}

/**
 * Determines which animation action to play based on the soldier's state.
 * @param {object} soldierData - The soldier's state object.
 * @param {string} directionName - The calculated direction name.
 * @param {boolean} isMoving - Whether the soldier is currently moving.
 * @returns {string} The name of the action to play (e.g., 'runUp', 'ShootingLeft', 'idle').
 */
function determineActionName(soldierData, directionName, isMoving) {
    if (soldierData.state === SOLDIER_STATE.LOOKING_AT_PLAYER) {
        return 'Shooting' + directionName;
    } 
    
    if (isMoving) {
        return 'run' + directionName;
    } 
    
    // If not moving and not shooting, the soldier is idle.
    return 'idle';
}

/**
 * Plays the specified animation, handling transitions from the previous state.
 * @param {object} soldierData - The soldier's state object.
 * @param {string} actionName - The name of the action to play.
 */
function playAction(soldierData, actionName) {
    const { actions, actionSprite, lastDirection } = soldierData;

    // Don't restart the same animation
    if (soldierData.currentAction === actionName) {
        return;
    }

    // Stop all other running animations to ensure a clean transition
    Object.values(actions).forEach(action => action.stop());

    if (actionName === 'idle') {
        // For idle, we manually set a static frame based on the last movement direction.
        const idleFrameMap = {
            'Down':  [4, 0], 'RD': [4, 7], 'Right': [4, 6], 'RU': [4, 5],
            'Up':    [4, 4], 'LU': [4, 3], 'Left':  [4, 2], 'LD': [4, 1]
        };
        const idleDirection = lastDirection || 'Down';
        const frame = idleFrameMap[idleDirection];
        if (frame) {
            actionSprite.setFrame(frame[0], frame[1]);
        }
    } else {
        // For all other actions, find it in the actions map and play it in a loop.
        const actionToPlay = actions[actionName];
        if (actionToPlay) {
            actionToPlay.playLoop();
        } else {
            // If an animation is missing, log a warning and default to idle.
            console.warn(`Animation action "${actionName}" not found!`);
            playAction(soldierData, 'idle'); 
        }
    }
    
    // Store the new action name as the current action
    soldierData.currentAction = actionName;
}

/**
 * Main animation update function. This is now based on VELOCITY for perfect sync.
 * This function calculates the correct sprite based on movement relative to the camera.
 * @param {object} soldierData - The soldier's state object.
 * @param {object} player - The player object.
 * @param {THREE.Camera} camera - The main camera.
 */
function updateAnimation(soldierData, player, camera) {
    const { obj: soldier, actionSprite } = soldierData;

    // 1. Orient Sprite: Always make the 2D sprite face the 3D camera.
    const euler = new THREE.Euler();
    euler.setFromQuaternion(camera.quaternion, 'YXZ');
    actionSprite.rotation.y = euler.y;

    // 2. Determine World Direction from VELOCITY
    // *** BUG FIX ***
    // The animation direction is now based on the soldier's actual velocity for this frame,
    // not its intended destination. This prevents any 1-frame lag when changing direction.
    const isMoving = soldierData.velocity && soldierData.velocity.lengthSq() > 0.0001;
    let worldDirectionVector;

    if (isMoving) {
        // If moving, the direction is the actual velocity vector.
        worldDirectionVector = soldierData.velocity.clone();
    } else {
        // If idle or shooting, the direction is towards the player.
        worldDirectionVector = player.position.clone().sub(soldier.position);
    }

    // 3. Calculate Relative Angle: Convert the world direction into an angle relative to the camera's view.
    const worldAngle = Math.atan2(worldDirectionVector.x, worldDirectionVector.z);
    const cameraAngle = euler.y;
    // The '+ Math.PI' adjustment aligns the coordinate systems correctly.
    const relativeAngle = worldAngle - cameraAngle + Math.PI;
    const angleDeg = THREE.MathUtils.radToDeg(relativeAngle);

    // 4. Get Direction Name: Convert the numeric angle into a string like 'Up', 'Left', etc.
    const directionName = getDirectionNameFromAngle(angleDeg);

    // 5. Store Last Direction: When moving, save the direction to use for the idle state.
    if (isMoving) {
        soldierData.lastDirection = directionName;
    }

    // 6. Determine Action: Decide which animation to play ('runUp', 'ShootingLeft', 'idle').
    const actionName = determineActionName(soldierData, directionName, isMoving);

    // 7. Play Animation: Execute the chosen animation and handle the transition.
    playAction(soldierData, actionName);
}


// ============================================================================================
//                                  MOVEMENT & COLLISION
// ============================================================================================

/**
 * Moves the soldier and stores its velocity for the frame.
 * @param {object} soldierData - The soldier's state object.
 * @param {number} speed - The movement speed.
 * @param {function} onBlockCallback - Callback to run if movement is blocked.
 */
function moveTowardsTarget(soldierData, speed, onBlockCallback) {
    const soldier = soldierData.obj;
    if (!soldierData.targetPoint) {
        soldierData.velocity = new THREE.Vector3(0, 0, 0); // Set zero velocity
        return;
    }

    const direction = soldierData.targetPoint.clone().sub(soldier.position).normalize();
    const raycaster = new THREE.Raycaster(soldier.position, direction, 0, COLLISION_CHECK_DISTANCE);
    const intersects = raycaster.intersectObjects(soldierData.collisionObjects);

    if (intersects.length > 0) {
        onBlockCallback();
        soldierData.velocity = new THREE.Vector3(0, 0, 0); // Set zero velocity
    } else {
        const frameVelocity = direction.multiplyScalar(speed);
        soldier.position.add(frameVelocity);
        soldierData.velocity = frameVelocity.clone(); // Store the velocity for this frame
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
        // Smoothly interpolate to the target Y position to avoid jitter
        soldier.position.y = THREE.MathUtils.lerp(soldier.position.y, targetY, VERTICAL_SMOOTHING_FACTOR);
    } else {
        // If no ground is detected, slowly fall
        soldier.position.y -= 0.05;
    }
}

function getNewWanderTarget(currentPosition) {
    const targetX = currentPosition.x + (Math.random() * MAX_WANDER_DISTANCE - (MAX_WANDER_DISTANCE / 2));
    const targetZ = currentPosition.z + (Math.random() * MAX_WANDER_DISTANCE - (MAX_WANDER_DISTANCE / 2));
    return new THREE.Vector3(targetX, currentPosition.y, targetZ);
}


// ============================================================================================
//                                     PROJECTILE LOGIC
// ============================================================================================

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
    targetPosition.y += 1.5; // Aim for the player's center mass
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

            // Remove projectile if it's near its target destination
            if (pData.mesh.position.distanceTo(pData.targetPoint) < PROJECTILE.speed) {
                scene.remove(pData.mesh);
                pData.mesh.geometry.dispose();
                pData.mesh.material.dispose();
                soldierData.projectileArray.splice(i, 1);
            }
        }
    }
}
