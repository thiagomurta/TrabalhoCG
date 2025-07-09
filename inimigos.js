import * as THREE from  'three';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import { getMaxSize } from "../libs/util/util.js";

const AREA_DIMENSION = 100;
const AREAS_Z = -150;
const AREAS_Y = 6;
const UPPER_LEFT_AREA_X = -125;
const SEARCH_RADIUS = 10;

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
    if (distanceToPlayer > SEARCH_RADIUS) return false; // Player is too far away to be detected

    const directionToPlayer = playerPosition.clone().sub(currentPosition).normalize();
    const lookDirection = skull.getWorldDirection(new THREE.Vector3());
    const angleToPlayer = lookDirection.angleTo(directionToPlayer);
    const detectionAngleThreshold = Math.PI / 4; // 45 degrees
    if (angleToPlayer < detectionAngleThreshold) {
        console.log("Player detected by skull at position: ", playerPosition);
        return true; 
    }

    return false; 
}

function getNewSkullTargetPoint(currentPosition) {
    const xDelta = Math.random() * SEARCH_RADIUS*2 - SEARCH_RADIUS;
    const zDelta = Math.random() * SEARCH_RADIUS*2 - SEARCH_RADIUS;
    const newPosition = new THREE.Vector3(
        currentPosition.x + xDelta,
        currentPosition.y,
        currentPosition.z + zDelta
    );

    return newPosition;
}

function moveSkull(skullData, scenario, player) {
    const skull = skullData.obj;
    const currentPosition = skull.position;
    let targetPoint = skullData.targetPoint;
    let nullTargetPoint = new THREE.Vector3();

    if (targetPoint.equals(nullTargetPoint) || 
        currentPosition.distanceTo(targetPoint) < 0.1) { // Se não há um destino alvo, iniciar busca por um ponto aleatório em sua volta de raio 10
        console.log("No target point set for skull, setting a new one.");
        let newPosition = getNewSkullTargetPoint(currentPosition);

        targetPoint.copy(newPosition);

        let isTargetPointWithinArea =   newPosition.x >= -AREA_DIMENSION / 2 &&
                                        newPosition.x <= AREA_DIMENSION / 2 &&
                                        newPosition.z >= AREAS_Z - AREA_DIMENSION / 2 &&
                                        newPosition.z >= AREAS_Z + AREA_DIMENSION / 2;
        
        if (!isTargetPointWithinArea) {
            //adjust so it is within the area
            targetPoint.x = Math.max(-AREA_DIMENSION / 2, Math.min(AREA_DIMENSION / 2, newPosition.x));
            targetPoint.z = Math.max(AREAS_Z - AREA_DIMENSION / 2, Math.min(AREAS_Z + AREA_DIMENSION / 2, newPosition.z));
        }
    }

    const isPlayerDetected = tryDetectPlayer(skullData, player);

    if (isPlayerDetected) {
        targetPoint.copy(player.position); // If player is detected, set target point to player's position
    
    }

    //move towards the target point using raycaster

    let movementSpeed = isPlayerDetected ? 0.5 : 0.1; 

    const direction = targetPoint.clone().sub(currentPosition).normalize();
    const raycaster = new THREE.Raycaster(currentPosition, direction);
    skull.lookAt(targetPoint);

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

    let intersects = raycaster.intersectObjects(collisionObjects);

    while (intersects?.length > 0) {
        targetPoint = getNewSkullTargetPoint(currentPosition);
        direction.copy(targetPoint).sub(currentPosition).normalize();
        raycaster.set(currentPosition, direction);
        intersects = raycaster.intersectObjects(collisionObjects);
    }

        
    currentPosition.add(direction.multiplyScalar(movementSpeed));
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
                        targetPoint: new THREE.Vector3() });
    }

    for (let j = 0; j < 3; j++) {
        const cocodemon = await loadCocoDemon(scene); 
        cocodemons.push({   obj: cocodemon,
                            id: i++, boundingBox: new THREE.Box3().setFromObject(cocodemon),
                            targetPoint: new THREE.Vector3() });
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