import * as THREE from  'three';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import { getMaxSize } from "../libs/util/util.js";
import {moveSkull} from './inimigos/skull.js';
import {moveCocodemon} from './inimigos/cocodemon.js';
import { SKULL_STATE } from './inimigos/skull.js';

export const AREA_DIMENSION = 100;
export const AREAS_Z = -150;
export const AREAS_Y = 6;
export const UPPER_LEFT_AREA_X = -125;
export const ENEMIES_SCALE = 5;
const MIDDLE_AREA_X = 0;



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
                        targetPoint: null,
                        state: SKULL_STATE.WANDERING});
    }

    for (let j = 0; j < 3; j++) {
        const cocodemon = await loadCocoDemon(scene); 
        cocodemons.push({   obj: cocodemon,
                            id: i++, boundingBox: new THREE.Box3().setFromObject(cocodemon),
                            targetPoint: null,
                            isCharging: false });
    }

    for (let skull of skulls){
        
        placeEnemyRandomStartPos(skull.obj, AREA_DIMENSION, AREAS_Z, AREAS_Y, 
                            UPPER_LEFT_AREA_X);
    }

    for (let cocodemon of cocodemons){
        placeEnemyRandomStartPos(cocodemon.obj, AREA_DIMENSION, AREAS_Z, AREAS_Y,
                            MIDDLE_AREA_X);
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