import * as THREE from  'three';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import { getMaxSize } from "../libs/util/util.js";

const AREA_DIMENSION = 100;
const AREAS_Z = -150;
const AREAS_Y = 6;
//const AREAS_Z = 0;
//const AREAS_Y = 0;
const UPPER_LEFT_AREA_X = -125;
const SEARCH_RADIUS = 25;
const DEFAULT_DISTANCE = 25;
const DETECTION_ANGLE_THRESHOLD = Math.PI / 4; // 45 degrees
const CHARGE_DISTANCE = 1000;
const CHARGE_SPEED = 0.5;
const WANDER_SPEED = 0.1;
const PROXIMITY_THRESHOLD = 0.1; 
const MAX_PATHFINDING_ATTEMPTS = 10; 
const ENEMIES_SCALE = 5;



// ----------------------- INIMIGOS -------------------------

// FUNÇÕES DE MOVIMENTAÇÃO DOS INIMIGOS

export function moveEnemies(scenario, enemies, player) {
    if (!enemies || !Array.isArray(enemies.cocodemons) || !Array.isArray(enemies.skulls)) {
        console.log("No enemies to move or enemies data is not in the expected format.");
        console.log(enemies);
        return;
    }

    const cocodemons = enemies.cocodemons;
    const skulls = enemies.skulls;

    for (let cocodemonData of cocodemons) moveCocodemon(cocodemonData, scenario, player);

    for (let skullData of skulls) moveSkull(skullData, scenario, player);
}

// MOVIMENTAÇÃO COCODEMON

function moveCocodemon(cocodemonData, scenario, player) {
    return false; // TODO: Implementar lógica de movimentação do cocodemon

}

// MOVIMENTAÇÃO LOST SOUL

function tryDetectPlayer(skullData, player) {
    //see if the skull.lookAt() is facing the player in a radius of SEARCH_RADIUS
    
    const skull = skullData.obj;
    const currentPosition = skull.position;
    const playerPosition = player.position;

    const distanceToPlayer = currentPosition.distanceTo(playerPosition);
    console.log("Distance to player: ", distanceToPlayer);
    if (distanceToPlayer > (SEARCH_RADIUS * 2.5) + DEFAULT_DISTANCE) return false; // Player is too far away to be detected

    console.log("Player is not too far");
    const directionToPlayer = playerPosition.clone().sub(currentPosition).normalize();
    const lookDirection = skull.getWorldDirection(new THREE.Vector3());
    const angleToPlayer = lookDirection.angleTo(directionToPlayer);

    if (angleToPlayer < DETECTION_ANGLE_THRESHOLD || distanceToPlayer < SEARCH_RADIUS / 2) {
        skullData.isCharging = true;
        
        // Set target point slightly ahead of player to continue charging past them, in 2D plane
        skullData.targetPoint = playerPosition.clone().add(directionToPlayer.multiplyScalar(CHARGE_DISTANCE));
        skullData.targetPoint.y = currentPosition.y; 
        skullData.targetPoint = adjustPointToArea(skullData.targetPoint); 
        skull.lookAt(playerPosition);
        console.log("Player detected by skull at position: ", playerPosition);
        return true; 
    }

    return false; 
}

function getNewSkullTargetPoint(currentPosition) {
    // Generate random point within search radius (2D plane)
    const xDelta = Math.random() * SEARCH_RADIUS * 2 - SEARCH_RADIUS;
    const zDelta = Math.random() * SEARCH_RADIUS * 2 - SEARCH_RADIUS;
    
    return new THREE.Vector3(
        currentPosition.x + xDelta,
        currentPosition.y,
        currentPosition.z + zDelta
    );
}

function isPointWithinArea(point) {
    return point.x >= -AREA_DIMENSION / 2 &&
           point.x <= AREA_DIMENSION / 2 &&
           point.z >= AREAS_Z - AREA_DIMENSION / 2 &&
           point.z <= AREAS_Z + AREA_DIMENSION / 2;
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

function adjustPointToArea(point) {
    // adjust point to be within the defined area
    let adjustedX = Math.max(-AREA_DIMENSION / 2, Math.min(AREA_DIMENSION / 2, point.x));

    let adjustedZ = Math.max(AREAS_Z - AREA_DIMENSION / 2, Math.min(AREAS_Z + AREA_DIMENSION / 2, point.z));

    return new THREE.Vector3(adjustedX, point.y, adjustedZ);
}

function moveSkull(skullData, scenario, player) {
    const skull = skullData.obj;
    const currentPosition = skull.position;
    
    // Initialize or update target point if needed
    if (!skullData.targetPoint || currentPosition.distanceTo(skullData.targetPoint) < PROXIMITY_THRESHOLD) {
        skullData.isCharging = false;
        let newTarget = getNewSkullTargetPoint(currentPosition);
        
        if (!isPointWithinArea(newTarget)) {
            newTarget = adjustPointToArea(newTarget);
        }
        
        if (!skullData.targetPoint) {
            skullData.targetPoint = new THREE.Vector3();
        }
        skullData.targetPoint.copy(newTarget);
    }

    //INITIAL CHARGING DIRECTION ATTEMPT
    const direction = skullData.targetPoint.clone().sub(currentPosition).normalize();
    const raycaster = new THREE.Raycaster(currentPosition, direction);

    // DETECT PLAYER
    console.log(skullData.isCharging);
    const isPlayerDetected = skullData.isCharging || tryDetectPlayer(skullData, player);
    const movementSpeed = isPlayerDetected ? CHARGE_SPEED : WANDER_SPEED;

    // TEST COLLISION
    const collisionObjects = skullData.collisionObjects || getCollisionObjects(scenario);
    skullData.collisionObjects = collisionObjects; // Cache for next time
    let intersects = raycaster.intersectObjects(collisionObjects);
    let attempts = 0;
    
    //IF THERE IS COLLISION, TRY TO FIND A NEW PATH. IF EXHAUSTED TRIES, RETURN TO CENTER
    while (intersects.length > 0 && attempts < MAX_PATHFINDING_ATTEMPTS) {
        attempts++;
        skullData.isCharging = false; // Reset charging state
        
        // GET NEW TARGET POINT AND UPDATE DIRECTION
        skullData.targetPoint = getNewSkullTargetPoint(currentPosition);
        direction.copy(skullData.targetPoint).sub(currentPosition).normalize();
        raycaster.set(currentPosition, direction);
        intersects = raycaster.intersectObjects(collisionObjects);
    }

    if (attempts === MAX_PATHFINDING_ATTEMPTS && intersects.length > 0) {
        // If we reach max attempts, return to center of area
        skullData.targetPoint = new THREE.Vector3(0, currentPosition.y, AREAS_Z);
        direction.copy(skullData.targetPoint).sub(currentPosition).normalize();
        raycaster.set(currentPosition, direction);
    }

    if (attempts < MAX_PATHFINDING_ATTEMPTS) {
        skull.lookAt(skullData.targetPoint);
        currentPosition.add(direction.multiplyScalar(movementSpeed));
    } else {
        console.warn("Skull couldn't find valid path after", MAX_PATHFINDING_ATTEMPTS, "attempts");
    }
}


// FUNÇOES AUXILIARES
function normalizeAndRescale(obj, newScale)
{
  var scale = getMaxSize(obj); 
  obj.scale.set(newScale * (1.0/scale),
                newScale * (1.0/scale),
                newScale * (1.0/scale));
  return obj;
}

function fixPosition(obj)
{
  // Fix position of the object over the ground plane
  var box = new THREE.Box3().setFromObject( obj );
  if(box.min.y > 0)
    obj.translateY(-box.min.y);
  else
    obj.translateY(-1*box.min.y);
  return obj;
}

async function loadCocoDemon(scene) {
    try {
        let cocoDemon = await initCocoDemon();

        cocoDemon = normalizeAndRescale(cocoDemon, 5);
        cocoDemon = fixPosition(cocoDemon);
        scene.add(cocoDemon);
        return cocoDemon;
    } catch (error) {
        console.error('Error loading cocodemon: ', error);
    }
}

async function loadSkull(scene) {
    try {
        let skull = await initSkull();

        skull = normalizeAndRescale(skull, ENEMIES_SCALE);
        skull = fixPosition(skull);
        scene.add(skull);
        return skull;
    } catch(error) {
        console.error('Error loading skull: ', error);
    }
}

function placeEnemyRandomStartPos(enemy, areaDimension, areasZ, areasY, upperLeftAreaX) {
    enemy.translateZ(areasZ);
    enemy.translateY(areasY);
    enemy.translateX(upperLeftAreaX);

    const deltaX = Math.random() * areaDimension - (areaDimension / 2);
    const deltaZ = Math.random() * areaDimension - (areaDimension / 2);
    enemy.translateZ(deltaZ);
    enemy.translateX(deltaX);

    return enemy;
}

export async function loadEnemies(scene) {
    let skulls = [];
    let cocodemons = [];
    let i = 0;

    for (let j = 0; j < 5; j++) {
        const skull = await loadSkull(scene); 
        skulls.push({   obj: skull, 
                        id: i++, boundingBox: new THREE.Box3().setFromObject(skull),
                        targetPoint: null });
    }

    for (let j = 0; j < 3; j++) {
        const cocodemon = await loadCocoDemon(scene); 
        cocodemons.push({   obj: cocodemon,
                            id: i++, boundingBox: new THREE.Box3().setFromObject(cocodemon),
                            targetPoint: null,
                            isCharging: false });
    }

    for (let skull of skulls){
        const MIDDLE_AREA_X = 0;
        placeEnemyRandomStartPos(skull.obj, AREA_DIMENSION, AREAS_Z, AREAS_Y, 
                            MIDDLE_AREA_X);
    }

    for (let cocodemon of cocodemons){
        placeEnemyRandomStartPos(cocodemon.obj, AREA_DIMENSION, AREAS_Z, AREAS_Y,
                            UPPER_LEFT_AREA_X);
    }

    return { skulls, cocodemons }; // Return the loaded enemies
}


function initCocoDemon() {
    let glbLoader = new GLTFLoader();

    return new Promise((resolve, reject) => {
        glbLoader.load('./2025.1_T2_Assets/cacodemon.glb', function (gltf) {
            const obj = gltf.scene;
            obj.traverse(function (child) {
                if (child) {
                    child.castShadow = true;
                }
            });
            resolve(obj);
        }, undefined, function (error) {
            reject(error); 
        });
    });
}

function initSkull(){

    let mtlloader = new MTLLoader();
    let objloader = new OBJLoader();
    return new Promise((resolve, reject) => {
        mtlloader.load('./2025.1_T2_Assets/skull/skull.mtl',    function ( materials ) {
            materials.preload();

            objloader.setMaterials(materials);
            //objloader.setPath(modelPath);
            objloader.load('./2025.1_T2_Assets/skull.obj', function     ( obj ) {
                obj.traverse ( function(child){
                    if (child) child.castShadow = true;
                });

                resolve(obj);
            }, undefined, function (error) {
                reject(error); 
            });
        });
    });
}