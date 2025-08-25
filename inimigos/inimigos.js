import * as THREE from  'three';
import {GLTFLoader} from '../../build/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from '../../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../../build/jsm/loaders/MTLLoader.js';
import { getMaxSize } from "../../libs/util/util.js";
import {moveSkull} from './skull.js';
import {moveCacodemon} from './cacodemon.js';
import { SKULL_STATE } from './skull.js';
import { CACODEMON_STATE } from './cacodemon.js';
import { fadingObjects } from '../t3.js';
import { movePainElemental, PAINELEMENTAL_STATE } from './painelemental.js';
import { markEnemyGroup } from './damageHandler.js';
import { SpriteMixer } from '../../libs/sprites/SpriteMixer.js'; // Importar o SpriteMixer
import { moveSoldier, SOLDIER_STATE } from './soldier.js'; // Importar o soldado
import { playSound, playPositionalSound } from './../sons/sons.js';

export const AREA_DIMENSION = 100;
export const AREAS_Z = -150;
export const AREAS_Y = 6;
export const UPPER_LEFT_AREA_X = -125;

export const LOWER_AREA_X_DIMENSION = 300;
export const LOWER_AREA_Y_DIMENSION = 100;
export const LOWER_AREA_Z = 100;
export const LOWER_AREA_X = 0;

export const ENEMIES_SCALE = 5;

const CACODEMON_SPAWN_POINTS = [
    new THREE.Vector3(-16, 15, -150),
    new THREE.Vector3(16, 15, -150),
    new THREE.Vector3(16, 15, -175),

    new THREE.Vector3(-140, 7, 105),
    new THREE.Vector3(-70, 7, 125),
    new THREE.Vector3(70, 7, 145),
    new THREE.Vector3(140, 7, 165)
];

const PAINELEMENTAL_SPAWN_POINTS = [
    new THREE.Vector3(0, 7, 150),
];

const SOLDIER_SPAWN_POINTS = [
    new THREE.Vector3(130, 1, -150),
    new THREE.Vector3(135, 1, -145),
    new THREE.Vector3(140, 1, -150),
    new THREE.Vector3(145, 1, -145),
    new THREE.Vector3(150, 1, -150),
    new THREE.Vector3(155, 1, -140),
    new THREE.Vector3(160, 1, -140),
    new THREE.Vector3(165, 1, -135),
];



// ----------------------- INIMIGOS -------------------------

// ## FUNÇÕES DE MOVIMENTAÇÃO DOS INIMIGOS ##

export function moveEnemies(scene, scenario, player, enemies, playerHasEnteredFirstArea = true, playerHasEnteredSecondArea = false, camera) {
    if (!enemies || !Array.isArray(enemies.cacodemons) || !Array.isArray(enemies.skulls)) {
        console.log("No enemies to move or enemies data is not in the expected format.");
        console.log(enemies);
        return;
    }

    const cacodemons = enemies.cacodemons;
    const skulls = enemies.skulls;
    const painElementals = enemies.painElementals;
    const soldiers = enemies.soldiers;

    const activeCacodemons = cacodemons.filter(cacodemon => {
        // Return true for cacodemons that should be moved
        return playerHasEnteredSecondArea || !cacodemon.region.startsWith('upper');
    });
    
    for (let cacodemonData of activeCacodemons) moveCacodemon(cacodemonData, scenario, player, scene);

    const activeSkulls = skulls.filter(skull => {
        // Return true for skulls that should be moved
        return playerHasEnteredFirstArea || !skull.region.startsWith('upper');
    });

    for (let skullData of activeSkulls) moveSkull(skullData, scenario, player);

    for (let painElementalData of painElementals) movePainElemental(painElementalData, scenario, player, scene, enemies);

    for (let soldierData of soldiers) moveSoldier(soldierData, scenario, player, scene, camera);
}


// ## CARREGAMENTO DOS MODELOS DOS INIMIGOS ##

export async function loadEnemies(scene) {
    let skulls = [];
    let cacodemons = [];
    let painElementals = [];
    let soldiers = [];
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
            region: 'upper',
            obj: enemyGroup, 
            id: i++, 
            boundingBox: new THREE.Box3().setFromObject(skull),
            targetPoint: null,
            state: SKULL_STATE.WANDERING,
            hasPlayed: false,
            hitObject: null,    
            // HP Bar 
            hp: 20,
            maxHp: 20,
            context: context,
            texture: texture,
            hpBar: hpBarSprite 
        };
        skulls.push(skullData);
        updateHpBar(skullData); // Initialize the HP bar
        markEnemyGroup(skullData);
        scene.add(enemyGroup); 
    }

    for (const spawnPoint of CACODEMON_SPAWN_POINTS) {
        const cacodemon = await loadCacodemon();
        const { hpBarSprite, context, texture } = createHpBar();
        const enemyGroup = new THREE.Group();
        enemyGroup.add(cacodemon);
        hpBarSprite.position.y = 5;
        enemyGroup.add(hpBarSprite);

        enemyGroup.position.copy(spawnPoint);

        let region = 'upper';
        if (spawnPoint.z > 0) region = 'lower';

        const cacodemonData = {
            name: 'cacodemon',
            region: region,
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

        if (spawnPoint.z > 0) cacodemonData.name = 'cacodemonLower';

        cacodemons.push(cacodemonData);
        updateHpBar(cacodemonData); // Initialize the HP bar
        markEnemyGroup(cacodemonData);
        scene.add(enemyGroup);
        // console.log("Added cacodemon at ", enemyGroup.position);
    }

    for (const spawnPoint of PAINELEMENTAL_SPAWN_POINTS) {
        const painElemental = await loadPainElemental();
        const { hpBarSprite, context, texture } = createHpBar();
        const enemyGroup = new THREE.Group();
        enemyGroup.add(painElemental);
        hpBarSprite.position.y = 5;
        enemyGroup.add(hpBarSprite);

        enemyGroup.position.copy(spawnPoint);

        const painElementalData = {
            name: 'painElemental',
            obj: enemyGroup,
            id: i++,
            lookAtFrames: 0,
            targetPoint: null,
            state: PAINELEMENTAL_STATE.WANDERING,
            hasShot: false,

            // HP Bar
            hp: 100,
            maxHp: 100,
            context: context,
            texture: texture,
            hpBar: hpBarSprite
        };

        painElementals.push(painElementalData);
        updateHpBar(painElementalData); // Initialize the HP bar
        markEnemyGroup(painElementalData);
        scene.add(enemyGroup);
        // console.log("Added painElemental at ", enemyGroup.position);
    }

    for (const spawnPoint of SOLDIER_SPAWN_POINTS) {
        const soldierResources = await loadSoldierSprite();
        const { hpBarSprite, context, texture } = createHpBar();
        const enemyGroup = new THREE.Group();
        enemyGroup.add(soldierResources.actionSprite); 
        hpBarSprite.position.y = 5; 
        enemyGroup.add(hpBarSprite);

        enemyGroup.position.copy(spawnPoint);
        

        const soldierData = {
            name: 'soldier',
            obj: enemyGroup,
            id: i++,
            lookAtFrames: 0,
            targetPoint: null,
            state: SOLDIER_STATE.WANDERING,
            hasShot: false,

            // Recursos do sprite
            spriteMixer: soldierResources.spriteMixer,
            actionSprite: soldierResources.actionSprite,
            actions: soldierResources.actions,
            clock: new THREE.Clock(),
            running: null,
            lastRunning: null,
            key: [0, 0, 0, 0],
            dead: false,
            shooting: false,

            // HP Bar
            hp: 30,
            maxHp: 30,
            context: context,
            texture: texture,
            hpBar: hpBarSprite
        };
        soldiers.push(soldierData);
        updateHpBar(soldierData);
        markEnemyGroup(soldierData);
        scene.add(enemyGroup);
    }


    for (let skull of skulls){
        placeEnemyRandomStartPos(skull.obj, AREA_DIMENSION, AREAS_Z, AREAS_Y, 
                            UPPER_LEFT_AREA_X);
    }

    return { skulls, cacodemons, painElementals, soldiers}; // Return the loaded enemies
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

export async function loadSkull() {
    try {
        let skull = await initSkull();
        skull = normalizeAndRescale(skull, ENEMIES_SCALE);
        skull = fixPosition(skull);
        return skull;
    } catch(error) {
        console.error('Error loading skull: ', error);
    }
}

async function loadPainElemental() {
    try {
        let painElemental = await initPainElemental();
        painElemental = normalizeAndRescale(painElemental, ENEMIES_SCALE * 1.5);
        painElemental = fixPosition(painElemental);
        painElemental.rotateY(THREE.MathUtils.degToRad(-90));
        return painElemental;
    } catch(error) {
        console.error('Error loading painElemental: ', error);
    }
}

async function loadSoldierSprite() {
    return new Promise((resolve) => {
        const spriteMixer = SpriteMixer();
        const loader = new THREE.TextureLoader();
        loader.load("../assets/textures/sprites/zombieman.png", (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const actionSprite = spriteMixer.ActionSprite(texture, 8, 8);
            actionSprite.position.y = 0;
             actionSprite.scale.set(4.5, 4.5, 4.5);

            const actions = {
                runDown:        spriteMixer.Action(actionSprite, 100, 0, 0, 3, 0),
                runLD:          spriteMixer.Action(actionSprite, 100, 0, 1, 3, 1),
                runLeft:        spriteMixer.Action(actionSprite, 100, 0, 2, 3, 2),
                runLU:          spriteMixer.Action(actionSprite, 100, 0, 3, 3, 3),
                runUp:          spriteMixer.Action(actionSprite, 100, 0, 4, 3, 4),
                runRU:          spriteMixer.Action(actionSprite, 100, 0, 5, 3, 5),
                runRight:       spriteMixer.Action(actionSprite, 100, 0, 6, 3, 6),
                runRD:          spriteMixer.Action(actionSprite, 100, 0, 7, 3, 7),
                ShootingDown:   spriteMixer.Action(actionSprite, 100, 4, 0, 5, 0),
                ShootingLD:     spriteMixer.Action(actionSprite, 100, 4, 1, 5, 1),
                ShootingLeft:   spriteMixer.Action(actionSprite, 100, 4, 2, 5, 2),
                ShootingLU:     spriteMixer.Action(actionSprite, 100, 4, 3, 5, 3),
                ShootingUp:     spriteMixer.Action(actionSprite, 100, 4, 4, 5, 4),
                ShootingRU:     spriteMixer.Action(actionSprite, 100, 4, 5, 5, 5),
                ShootingRight:  spriteMixer.Action(actionSprite, 100, 4, 6, 5, 6),
                ShootingRD:     spriteMixer.Action(actionSprite, 100, 4, 7, 5, 7),
                Die:            spriteMixer.Action(actionSprite, 150, 7, 0, 7, 3) // Die action
            };
            
            // Pausa todas as animações para evitar que comecem automaticamente
            Object.values(actions).forEach(action => action.stop());

            resolve({ spriteMixer, actionSprite, actions });
        });
    });
}


async function initPainElemental() {
    let glbLoader = new GLTFLoader();

    return new Promise((resolve, reject) => {
        glbLoader.load( '../../0_AssetsT3/objects/pain/painElemental.glb', function (gltf) {
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
    
    const NORTH_WALL = scenario.objects[2];
    const SOUTH_WALL = scenario.objects[4];
    const LEFT_WALL = scenario.objects[3];
    const RIGHT_WALL = scenario.objects[5];
    const PLANE = scenario.parent.children[0];
    const collisionObjects = [PLANE, LEFTMOST_BOX, UPPER_MIDDLE_BOX, NORTH_WALL, SOUTH_WALL, LEFT_WALL, RIGHT_WALL];
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

export function createHpBar() {
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

export function updateHpBar(cacodemonData) {
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

export function applyDamageToEnemy(enemyData, damage, enemies, firstArea, secondArea) {
    console.log(firstArea);
    console.log(secondArea);
    if (enemyData.name.startsWith('cacodemon') && !secondArea && enemyData.region.startsWith('upper')) return;
    if (enemyData.name.startsWith('skull') && !firstArea && enemyData.region.startsWith('upper')) return;
    
    if(enemyData.name.startsWith('soldier')){}
    enemyData.hp -= damage;
            if (enemyData.name.startsWith('cacodemon')) {
                if (secondArea) playPositionalSound('CACODEMON_HURT', enemyData.obj);
            } else if (enemyData.name.startsWith('skull')) {
                if (firstArea) playPositionalSound('LOST_SOUL_HURT', enemyData.obj);
            } else if (enemyData.name.startsWith('painElemental')) {
                playPositionalSound('PAIN_ELEMENTAL_HURT', enemyData.obj);
            } else if (enemyData.name.startsWith('soldier')) {
                playPositionalSound('SOLDIER_HURT', enemyData.obj);
            }
    if (enemyData.hp <= 0) {
        enemyData.hp = 0;

        if (enemyData.name.startsWith('cacodemon')) {
            playSound('CACODEMON_DEATH');
        }
        if (enemyData.name.startsWith('skull')) {
            playSound('LOST_SOUL_DEATH');
        }
        if (enemyData.name.startsWith('painElemental')) {
            playSound('PAIN_ELEMENTAL_DEATH');
        }
        if (enemyData.name.startsWith('soldier')) {
            playSound('SOLDIER_DEATH');
            enemyData.state = SOLDIER_STATE.DYING;
            enemyData.deathFrames = 0;
        }
        if(!enemyData.name.startsWith('soldier'))
            startFadingAnimation(enemyData); // Inicia a animação de desaparecimento

        let enemyArray;
        // Determina de qual array o inimigo deve ser removido
        if (enemyData.name.startsWith('cacodemon')) {
            enemyArray = enemies.cacodemons;
        } else if (enemyData.name === 'skull') {
            enemyArray = enemies.skulls;
        } else if (enemyData.name === 'painElemental') {
            enemyArray = enemies.painElementals;
        } else if (enemyData.name === 'soldier') {
            enemyArray = enemies.soldiers;
        }

        if (enemyArray) {
            const index = enemyArray.indexOf(enemyData);
            if (index > -1) {
                if(!enemyData.name.startsWith('soldier'))
                    enemyArray.splice(index, 1);
            }
        }
    }
    updateHpBar(enemyData); // Atualiza a barra de vida (seja qual for o dano)
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

export function smoothEnemyRotation(enemy, targetPoint) {
    let lookAtTarget = targetPoint.clone();
    lookAtTarget.y = enemy.position.y; // only rotate on 2d


    // tempMatrix of the new angle and set the quaternion 
    const targetQuaternion = new THREE.Quaternion();
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.lookAt(lookAtTarget, enemy.position, enemy.up);
    targetQuaternion.setFromRotationMatrix(tempMatrix);

    // interpolate the rotation using quaternion's slerp
    const rotationSpeed = 0.1;
    enemy.quaternion.slerp(targetQuaternion, rotationSpeed);
}