import * as THREE from  'three';
import {GLTFLoader} from '../../build/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from '../../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../../build/jsm/loaders/MTLLoader.js';
import { getMaxSize } from "../../libs/util/util.js";
import {moveSkull} from './skull.js';
import {moveCacodemon} from './cacodemon.js';
import { SKULL_STATE } from './skull.js';
import { CACODEMON_STATE } from './cacodemon.js';

export const AREA_DIMENSION = 100;
export const AREAS_Z = -150;
export const AREAS_Y = 6;
export const UPPER_LEFT_AREA_X = -125;
export const ENEMIES_SCALE = 5;
const MIDDLE_AREA_X = 0;



// ----------------------- INIMIGOS -------------------------

// FUNÇÕES DE MOVIMENTAÇÃO DOS INIMIGOS

export function moveEnemies(scenario, enemies, player) {
    if (!enemies || !Array.isArray(enemies.cacodemons) || !Array.isArray(enemies.skulls)) {
        console.log("No enemies to move or enemies data is not in the expected format.");
        console.log(enemies);
        return;
    }

    const cacodemons = enemies.cacodemons;
    const skulls = enemies.skulls;

    for (let cacodemonData of cacodemons) moveCacodemon(cacodemonData, scenario, player);

    for (let skullData of skulls) moveSkull(skullData, scenario, player);
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

async function loadCacodemon(scene) {
    try {
        let cacodemon = await initCacodemon();

        cacodemon = normalizeAndRescale(cacodemon, 5);
        cacodemon = fixPosition(cacodemon);
        scene.add(cacodemon);
        return cacodemon;
    } catch (error) {
        console.error('Error loading cacodemon: ', error);
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
    let cacodemons = [];
    let i = 0;

    for (let j = 0; j < 5; j++) {
        const skull = await loadSkull(scene); 
        skulls.push({   obj: skull, 
                        id: i++, boundingBox: new THREE.Box3().setFromObject(skull),
                        targetPoint: null,
                        state: SKULL_STATE.WANDERING});
    }

    for (let j = 0; j < 3; j++) {
        const cacodemon = await loadCacodemon(scene); 
        cacodemons.push({   obj: cacodemon,
                            id: i++,
                            lookAtFrames: 0,
                            targetPoint: null,
                            state: CACODEMON_STATE.WANDERING });
    }

    for (let skull of skulls){
        
        placeEnemyRandomStartPos(skull.obj, AREA_DIMENSION, AREAS_Z, AREAS_Y, 
                            UPPER_LEFT_AREA_X);

    }

    for (let cacodemon of cacodemons){
        placeEnemyRandomStartPos(cacodemon.obj, AREA_DIMENSION, AREAS_Z, AREAS_Y,
                            MIDDLE_AREA_X);
    }

    return { skulls, cacodemons }; // Return the loaded enemies
}


function initCacodemon() {
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

export function getCollisionObjects(scenario) {
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