import * as THREE from  'three';
import {GLTFLoader} from '../../build/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from '../../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../../build/jsm/loaders/MTLLoader.js';
import { getMaxSize } from "../../libs/util/util.js";
import {moveSkull} from './skull.js';
import {moveCacodemon} from './cacodemon.js';
import { SKULL_STATE } from './skull.js';
import { CACODEMON_STATE } from './cacodemon.js';
import { fadingObjects } from '../t1.js';

export const AREA_DIMENSION = 100;
export const AREAS_Z = -150;
export const AREAS_Y = 6;
export const UPPER_LEFT_AREA_X = -125;
export const ENEMIES_SCALE = 5;
const MIDDLE_AREA_X = 0;




// ----------------------- INIMIGOS -------------------------

// ## FUNÇÕES DE MOVIMENTAÇÃO DOS INIMIGOS ##

export function moveEnemies(scene, scenario, enemies, player) {
    if (!enemies || !Array.isArray(enemies.cacodemons) || !Array.isArray(enemies.skulls)) {
        console.log("No enemies to move or enemies data is not in the expected format.");
        console.log(enemies);
        return;
    }

    const cacodemons = enemies.cacodemons;
    const skulls = enemies.skulls;

    for (let cacodemonData of cacodemons) moveCacodemon(cacodemonData, scenario, player, scene);

    for (let skullData of skulls) moveSkull(skullData, scenario, player);
}


// ## CARREGAMENTO DOS MODELOS DOS INIMIGOS ##

export async function loadEnemies(scene) {
    let skulls = [];
    let cacodemons = [];
    let i = 0;

    for (let j = 0; j < 5; j++) {
        const skull = await loadSkull();
        const { hpBarSprite, context, texture } = createHpBar();
        const enemyGroup = new THREE.Group();
        enemyGroup.add(skull);
        hpBarSprite.position.y = 5; 
        enemyGroup.add(hpBarSprite); 
        const skullData = {
            name: 'skull',
            obj: enemyGroup, 
            id: i++, 
            boundingBox: new THREE.Box3().setFromObject(skull),
            targetPoint: null,
            state: SKULL_STATE.WANDERING,

            // HP Bar 
            hp: 20,
            maxHp: 20,
            context: context,
            texture: texture,
            hpBar: hpBarSprite 
        };
        skulls.push(skullData);
        updateHpBar(skullData); // Initialize the HP bar
        scene.add(enemyGroup); 
    }

    for (let j = 0; j < 3; j++) {
        const cacodemon = await loadCacodemon(); 
        const { hpBarSprite, context, texture } = createHpBar();
        const enemyGroup = new THREE.Group();
        enemyGroup.add(cacodemon);
        hpBarSprite.position.y = 5; 
        enemyGroup.add(hpBarSprite);
        const cacodemonData = {
            name: 'cacodemon',
            obj: enemyGroup,
            id: i++,
            lookAtFrames: 0,
            targetPoint: null,
            state: CACODEMON_STATE.WANDERING,
            hasShot: false,
            
            // HP Bar
            hp: 50,
            maxHp: 50,
            context: context,
            texture: texture,
            hpBar: hpBarSprite 
        };

        cacodemons.push(cacodemonData);
        updateHpBar(cacodemonData); // Initialize the HP bar
        scene.add(enemyGroup);
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

async function loadCacodemon() {
    try {
        let cacodemon = await initCacodemon();

        cacodemon = normalizeAndRescale(cacodemon, ENEMIES_SCALE);
        cacodemon = fixPosition(cacodemon);
        return cacodemon;
    } catch (error) {
        console.error('Error loading cacodemon: ', error);
    }
}

async function loadSkull() {
    try {
        let skull = await initSkull();
        skull = normalizeAndRescale(skull, ENEMIES_SCALE);
        skull = fixPosition(skull);
        return skull;
    } catch(error) {
        console.error('Error loading skull: ', error);
    }
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
                    if (child.isMesh) {
                        child.castShadow = true;
                        if (Array.isArray(child.material)) {  // If the mesh has multiple materials
                            child.material.forEach(material => {
                                material.transparent = true;
                            });
                        } 
                        else if (child.material) { // If the mesh has a single material
                            child.material.transparent = true;
                        }

                    }
                });

                resolve(obj);
            }, undefined, function (error) {
                reject(error); 
            });
        });
    });
}

// ## FUNÇOES AUXILIARES ##

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
  var box = new THREE.Box3().setFromObject( obj );
  if(box.min.y > 0)
    obj.translateY(-box.min.y);
  else
    obj.translateY(-1*box.min.y);
  return obj;
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

// ## FUNÇÕES DE HP BAR ##

function createHpBar() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const context = canvas.getContext('2d');

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace; 

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true, 
    });

    const hpBarSprite = new THREE.Sprite(material);
    hpBarSprite.scale.set(3, 0.75, 1.0); 
    hpBarSprite.raycast = () => {};
    return { hpBarSprite, context, texture };
}

function updateHpBar(cacodemonData) {
    const { context, texture, hp, maxHp } = cacodemonData;
    const canvas = context.canvas;

    //clears the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#FF0000'; // Red
    context.fillRect(0, 10, canvas.width, 44); // x, y, width, height

    // draws hp percentage
    const healthPercentage = hp / maxHp;
    const healthWidth = canvas.width * healthPercentage;
    context.fillStyle = '#00FF00'; // Green
    context.fillRect(0, 10, healthWidth, 44);

    context.strokeStyle = '#000000'; // Black
    context.lineWidth = 8;
    context.strokeRect(0, 10, canvas.width, 44);

    texture.needsUpdate = true;
}

export function damageCacodemon(enemiesCacodemons, cacodemonData, damage) {
    cacodemonData.hp -= damage;
    if (cacodemonData.hp <= 0) {
        cacodemonData.hp = 0;
        startFadingAnimation(cacodemonData);

        const index = enemiesCacodemons.indexOf(cacodemonData);
        if (index > -1) {
            enemiesCacodemons.splice(index, 1);
        }
    }
    updateHpBar(cacodemonData);
}

export function damageSkull(enemiesSkulls, skullData, damage) {
    skullData.hp -= damage;
    if (skullData.hp <= 0) {
        skullData.hp = 0; 
        startFadingAnimation(skullData);

        const index = enemiesSkulls.indexOf(skullData);
        if (index > -1) {
            enemiesSkulls.splice(index, 1);
        }
    }
    updateHpBar(skullData);
}

export function updateAnimations() {
    const now = performance.now();
    
    for (let i = fadingObjects.length - 1; i >= 0; i--) {
        const enemy = fadingObjects[i];
        const enemyObj = enemy.obj;
        const elapsedTime = (now - enemy.fadeStartTime) / 1000;
        const fadeDuration = enemy.fadeDuration;
        let opacity = 1.0 - (elapsedTime / fadeDuration);

        if (opacity <= 0) {
            opacity = 0;
            if (enemyObj.parent) {
                enemyObj.parent.remove(enemyObj);
            }
            enemyObj.traverse(function (child) {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else if (child.material) {
                        child.material.dispose();
                    }
                }
            });
            fadingObjects.splice(i, 1);
        }

        enemyObj.traverse(function (child) {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.opacity = opacity);
                } else {
                    child.material.opacity = opacity;
                }
            }
        });
    }
}


function startFadingAnimation(enemyData) {
    enemyData.isFading = true;
    enemyData.fadeStartTime = performance.now();
    enemyData.fadeDuration = 1.0; 

    enemyData.obj.traverse(function (child) {
        if (child.isMesh) {
            if (Array.isArray(child.material)) {
                child.material.forEach(material => material.transparent = true);
            } else {
                child.material.transparent = true;
            }
        }
    });

    fadingObjects.push(enemyData);
}