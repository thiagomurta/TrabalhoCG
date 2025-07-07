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

export function moveEnemies(enemies) {
    const cocodemons = enemies.cocodemons;
    const skulls = enemies.skulls;

    for (let cocodemonData of cocodemons) moveCocodemon(cocodemonData);

    for (let skullData of skulls) moveSkull(skullData);
}

// MOVIMENTAÇÃO COCODEMON

function moveCocodemon(cocodemonData) {
 return false; // TODO: Implementar lógica de movimentação do cocodemon

}

// MOVIMENTAÇÃO LOST SOUL

function tryDetectPlayer(skullData) {
    return false; // TODO: Implementar lógica de detecção do jogador
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

function moveSkull(skullData) {
    const skull = skullData.obj;
    const currentPosition = skull.position;
    const targetPoint = skullData.targetPoint;

    if (!targetPoint) { // Se não há um destino alvo, iniciar busca por um ponto aleatório em sua volta de raio 10

        newPosition = getSkullTargetPoint(currentPosition);

        targetPoint.copy(newPosition);
    }

    const isPlayerDetected = tryDetectPlayer(skullData);

    if (isPlayerDetected) {
        // Se o jogador for detectado, move em direção ao jogador
    
    }

    //move towards the target point using raycaster

    const direction = targetPoint.clone().sub(currentPosition).normalize();
    const raycaster = new THREE.Raycaster(currentPosition, direction);
    const intersects = raycaster.intersectObjects([skullData.boundingBox]);
    if (intersects.length > 0) {
        // Se houver colisão, mudar o destino alvo
        targetPoint = getNewSkullTargetPoint(currentPosition);
    } else {
        // Move towards the target point
        currentPosition.add(direction.multiplyScalar(0.1)); // Move at a constant speed
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
        skull.obj.translateZ(AREAS_Z);
        skull.obj.translateY(AREAS_Y);

        const DELTA_X = Math.random() * AREA_DIMENSION - (AREA_DIMENSION / 2);
        const DELTA_Z = Math.random() * AREA_DIMENSION - (AREA_DIMENSION / 2);
        skull.obj.translateZ(DELTA_Z);
        skull.obj.translateX(DELTA_X);

        skull.boundingBox.setFromCenterAndSize(
            skull.obj.position,
            new THREE.Vector3(ENEMIES_SCALE, ENEMIES_SCALE, ENEMIES_SCALE)
        );
    }

    for (let cocodemon of cocodemons){
        cocodemon.obj.translateZ(AREAS_Z);
        cocodemon.obj.translateY(AREAS_Y);
        cocodemon.obj.translateX(UPPER_LEFT_AREA_X);

        const DELTA_X = Math.random() * AREA_DIMENSION - (AREA_DIMENSION / 2);
        const DELTA_Z = Math.random() * AREA_DIMENSION - (AREA_DIMENSION / 2);
        cocodemon.obj.translateZ(DELTA_Z);
        cocodemon.obj.translateX(DELTA_X);

        cocodemon.boundingBox.setFromCenterAndSize(
            cocodemon.obj.position,
            new THREE.Vector3(ENEMIES_SCALE, ENEMIES_SCALE, ENEMIES_SCALE)
        );
    }

    return { skulls, cocodemons }; // Return the loaded enemies
}


export function initCocoDemon() {
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

export function initSkull(){

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