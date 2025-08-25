import * as THREE from 'three';
import { getCollisionObjects } from './inimigos.js';
import { checkProjectileCollisionWithPlayer } from './damageHandler.js';

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export const SOLDIER_STATE = {
    WANDERING: 'WANDERING',
    LOOKING_AT_PLAYER: 'LOOKING_AT_PLAYER',
    DYING: 'DYING'
};

// --- AI Behavior Constants ---
const PLAYER_DETECT_DISTANCE = 30; // Distance at which a soldier can detect the player.
const MAX_WANDER_DISTANCE = 15; // Maximum distance a soldier will wander from its current position.
const WANDER_SPEED = 0.04; // Movement speed while wandering.
const PROXIMITY_THRESHOLD = 1.0; // How close a soldier needs to be to its target point to consider it "reached".
const COLLISION_CHECK_DISTANCE = 1.0; // How far ahead to check for collisions when moving.

// --- Timing Constants (in frames) ---
const LOOK_AT_PLAYER_DURATION_FRAMES = 120; // How long the soldier stares at the player before shooting.
const LOOK_AT_PLAYER_COOLDOWN_FRAMES = -90; // Cooldown period after looking at the player.
const DEATH_ANIMATION_DURATION = 60;

// --- Physics & Positioning Constants ---
const SOLDIER_VERTICAL_OFFSET = 2; // How high the soldier hovers above the ground.
const VERTICAL_SMOOTHING_FACTOR = 0.02; // Smoothing factor for vertical movement (lerp).
const GROUND_CHECK_OFFSET = 0.1; // Small offset for the ground-checking raycaster.
const GRAVITY_FALL_SPEED = 0.05; // Speed at which the soldier falls if no ground is detected.


const DOWN = 0, LEFT = 1, UP = 2, RIGHT = 3;

// =============================================================================
// MAIN SOLDIER LOGIC
// =============================================================================

function getCollisionObjectsForHangar(soldierData, scenario){
    if(!scenario || !scenario.parent) return [];

    const collisionObjects = [];

    if(scenario.objects && scenario.objects.length > 0){
        const hangar = scenario.objects[scenario.objects.length -1];
        if(hangar && hangar.objects){
            collisionObjects.push(...hangar.objects);
        }
    }

    const plane = scenario.parent.children.find(child =>
        child.isMesh && child.geometry && child.geometry.type === 'PlaneGeometry'
    );

    if(plane)
        collisionObjects.push(plane);

    return collisionObjects;
}

export function moveSoldier(soldierData, scenario, player, scene, camera) {
    // Initialize collision objects once.

    if (!soldierData.collisionObjects) {
        soldierData.collisionObjects = getCollisionObjects(scenario);
        soldierData.hangarCollisionObjects = getCollisionObjectsForHangar(soldierData, scenario);
        soldierData.allCollisionObjects = [
            ...soldierData.collisionObjects, 
            ...soldierData.hangarCollisionObjects
        ];
    }

    keyboardUpdateSimulador(soldierData);

    spriteUpdate(soldierData, camera);
    
    applyVerticalCollision(soldierData);
    
}

// =============================================================================
// AI STATE HANDLERS
// =============================================================================

function keyboardUpdateSimulador(soldierData) {
    const dead = soldierData.dead;
    const actionSprite = soldierData.actionSprite;
    const actions = soldierData.actions;
    let running = soldierData.running;
    let lastRunning = soldierData.lastRunning;
    let key = soldierData.key;
    

    let keyboard = simulateKeysHeld(soldierData);

   if (dead) return;

   if(keyboard.down("delete") && !dead) 
   {
      dead = true; // Set die flag to true
      actions.Die.playOnce(true);
      console.log("Die action triggered");
      return;
   }

   if ( keyboard.down("down"))  key[DOWN] = 1;      
   if ( keyboard.down("left"))  key[LEFT] = 1;         
   if ( keyboard.down("up"))    key[UP] = 1;      
   if ( keyboard.down("right")) key[RIGHT] = 1;         

   if(key[LEFT]) { // If LEFT is pressed
      if(!key[DOWN] && !key[UP]) { // Only left pressed
         lastRunning = running = 'left'; // Set running direction to left
         if (!actions.runLeft.isInLoop) actions.runLeft.playLoop(); 
      } else if(key[DOWN] && !key[UP]) { 
         lastRunning = running = 'ld';         
         if (!actions.runLD.isInLoop) actions.runLD.playLoop();          
      }  else if(!key[DOWN] && key[UP]) {
         lastRunning = running = 'lu';         
         if (!actions.runLU.isInLoop) actions.runLU.playLoop();          
      } 
   }

   if(key[RIGHT] && !key[LEFT]) { 
      if(!key[DOWN] && !key[UP]) { 
         lastRunning = running = 'right'; 
         if (!actions.runRight.isInLoop) actions.runRight.playLoop(); 
      } else if(key[DOWN] && !key[UP]) { 
         lastRunning = running = 'rd';         
         if (!actions.runRD.isInLoop) actions.runRD.playLoop();          

      }  else if(!key[DOWN] && key[UP]) {
         lastRunning = running = 'ru';         
         if (!actions.runRU.isInLoop) actions.runRU.playLoop();          
      } 
   }  
   
   if(!key[RIGHT] && !key[LEFT]) { // Finally, check if only UP or DOWN is pressed
      if(key[UP]) { // Only left pressed
         lastRunning = running = 'up'; // Set running direction to up
         if (!actions.runUp.isInLoop) actions.runUp.playLoop(); 
      } else if(key[DOWN]) { 
         lastRunning = running = 'down'; // Set running direction to down
         if (!actions.runDown.isInLoop) actions.runDown.playLoop(); 
      } 
   }  
   
   if ( keyboard.up("down"))  key[0] = 0;      
   if ( keyboard.up("left"))  key[1] = 0;         
   if ( keyboard.up("up"))    key[2] = 0;      
   if ( keyboard.up("right")) key[3] = 0;   
   resetIsInLoopFlags(soldierData); // Reset the isInLoop flags for all actions       

   // play shooting action of if the sprite is not running
   if( running == undefined) {      
      if(shooting){
         if(shootingFlag == false) { 
            if (lastRunning == 'down')  actions.ShootingDown.playLoop();
            if (lastRunning == 'ld')    actions.ShootingLD.playLoop();
            if (lastRunning == 'left')  actions.ShootingLeft.playLoop();         
            if (lastRunning == 'lu')    actions.ShootingLU.playLoop();
            if (lastRunning == 'up')    actions.ShootingUp.playLoop();      
            if (lastRunning == 'ru')    actions.ShootingRU.playLoop();            
            if (lastRunning == 'right') actions.ShootingRight.playLoop();      
            if (lastRunning == 'rd')    actions.ShootingRD.playLoop();            
         }
         shootingFlag = true;
      }
      else{
         // If no movement or shooting is detected , set the sprite to a default frame
         if (lastRunning == 'down')  actionSprite.setFrame(4, 0);
         if (lastRunning == 'ld')    actionSprite.setFrame(4, 1);      
         if (lastRunning == 'left')  actionSprite.setFrame(4, 2);
         if (lastRunning == 'lu')    actionSprite.setFrame(4, 3);      
         if (lastRunning == 'up')    actionSprite.setFrame(4, 4);      
         if (lastRunning == 'ru')    actionSprite.setFrame(4, 5);            
         if (lastRunning == 'right') actionSprite.setFrame(4, 6);      
         if (lastRunning == 'rd')    actionSprite.setFrame(4, 7);            
      }
   }
   if(!key[0] && !key[1] && !key[2] && !key[3]) running = undefined

   soldierData.running = running;
   soldierData.lastRunning = lastRunning;
   soldierData.key = key;
   soldierData.dead = dead;
}

function spriteUpdate(soldierData, camera) {
    const clock = soldierData.clock;
    const spriteMixer = soldierData.spriteMixer;
    const actionSprite = soldierData.actionSprite;
    const running = soldierData.running;
    

    let delta = clock.getDelta();
    spriteMixer.update(delta);
    const speed = 0.05; // Speed of the sprite movement
    const hspeed = 0.04; // Diagonal speed of the sprite movement
 
    if (running == 'right') actionSprite.translateX(speed);
    if (running == 'left')  actionSprite.translateX(-speed);
    if (running == 'down')  actionSprite.translateZ(speed);
    if (running == 'up')    actionSprite.translateZ(-speed);
 
    if (running == 'ld'){
       actionSprite.translateX(-hspeed);
       actionSprite.translateZ(hspeed);
    } 
 
    if (running == 'lu'){
       actionSprite.translateX(-hspeed);
       actionSprite.translateZ(-hspeed);
    } 
 
    if (running == 'ru'){
       actionSprite.translateX(hspeed);
       actionSprite.translateZ(-hspeed);
    } 
 
    if (running == 'rd'){
       actionSprite.translateX(hspeed);
       actionSprite.translateZ(hspeed);
    } 
 
    // Rotate the action sprite local axes to face the camera
    if (actionSprite) {
          const euler = new THREE.Euler(); // Converter o quaternion da câmera para Euler
          euler.setFromQuaternion(camera.quaternion, 'YXZ'); // Acerta ordem da transformação    
          actionSprite.rotation.y = euler.y; // Copia rotação para o sprite para mantê-lo perpendicular à camera
    }
}

function simulateKeysHeld(soldierData) {
    const soldier = soldierData.obj;
    const simulatedKeys = { up: false, down: false, left: false, right: false, delete: false };

    if (!soldierData.wanderTarget || soldier.position.distanceTo(soldierData.wanderTarget) < PROXIMITY_THRESHOLD) {
        soldierData.wanderTarget = getWanderTarget(soldier.position);
    }

    if (soldierData.wanderTarget) {
        // Create a vector pointing from the soldier to the target
        const direction = new THREE.Vector3().subVectors(soldierData.wanderTarget, soldier.position).normalize();

        // 3. Determine which "keys" to "press" based on the direction
        // We use a threshold (e.g., 0.3) to avoid jittery diagonal movement
        const threshold = 0.3;

        if (direction.z < -threshold) {
            simulatedKeys.up = true;
        } else if (direction.z > threshold) {
            simulatedKeys.down = true;
        }

        if (direction.x < -threshold) {
            simulatedKeys.left = true;
        } else if (direction.x > threshold) {
            simulatedKeys.right = true;
        }
    }

    // 4. Return the simulated keyboard object
    return {
        down: (key) => simulatedKeys[key] || false,
        up: (key) => !simulatedKeys[key] // The 'up' state is simply the opposite of 'down'
    };
}

// =============================================================================
// MOVEMENT & COLLISION
// =============================================================================

function tryDetectPlayer(soldierData, player) {
    return soldierData.obj.position.distanceTo(player.position) < PLAYER_DETECT_DISTANCE;
}

function applyVerticalCollision(soldierData) {
    if(soldierData.state === SOLDIER_STATE.DYING) return;
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

// =============================================================================
// ANIMATION
// =============================================================================

function getWanderTarget() {

}


function resetIsInLoopFlags(soldierData) 
{
    const key = soldierData.key;
    const actions = soldierData.actions;
   if(actions.runDown  && !key[0]) actions.runDown.isInLoop = false;   
   if(actions.runLeft  && !key[1]) actions.runLeft.isInLoop = false;
   if(actions.runUp    && !key[2]) actions.runUp.isInLoop = false;      
   if(actions.runRight && !key[3]) actions.runRight.isInLoop = false;   

   if(actions.runLD && !key[1] && !key[0]) actions.runLD.isInLoop = false;    
   if(actions.runLU && !key[1] && !key[2]) actions.runLU.isInLoop = false;   
   if(actions.runRD && !key[3] && !key[0]) actions.runRD.isInLoop = false;    
   if(actions.runRU && !key[3] && !key[2]) actions.runRU.isInLoop = false;   
}


// =============================================================================
// PROJECTILE HANDLING
// =============================================================================

function shootProjectile(soldierData, scene, player) {
    soldierData.hasShot = true;
}