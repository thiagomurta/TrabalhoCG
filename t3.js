import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {initRenderer,
        initDefaultBasicLight,
        setDefaultMaterial, 
        onWindowResize,
        createGroundPlaneXZ } from "../libs/util/util.js";
import * as S0 from "./scene0.js";
import {PointerLockControls} from '../build/jsm/controls/PointerLockControls.js';
import { initSoundSystem, toggleBackgroundMusic, playSound } from './sons/sons.js'; // Adicione esta importação
import { moveBullet } from "./arma/armaLancador.js"; 
import * as CHAVE from './chave.js';
import * as LOOK from './lookers.js'
import * as INTER from './intersecter.js'
import * as SCLIMB from './stairClimb.js'
import { loadEnemies, moveEnemies, updateAnimations } from './inimigos/inimigos.js';
import * as EL from './elevador.js'
import { toggleGun, initWeaponSystem, updateWeapons, currentGun, GUNTYPE } from './arma/armaController.js';

import * as GATE from './gateAnim.js'

import * as TF from './texturingfuncs.js'

import * as HANGAR from './hangar.js'
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import { Plane } from './plane.js';
import { CubeTextureLoaderSingleFile } from '../libs/util/cubeTextureLoaderSingleFile.js';
import * as VA from './animMove.js'

import { instancePlayer, createPlayerHpBar, updatePlayerHpBar } from './player.js';



// ---------------------Configuração inicial---------------------
let scene, renderer;
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // View function in util/utils
//initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
var stats = new Stats();
//setDefaultMaterial(); // create a basic material

// ---------------------Câmera---------------------
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0.0, 0.0, 0.0);
camera.lookAt(new THREE.Vector3(-1.5, 2.0, -100.0));
const textureLoader = new THREE.TextureLoader();
let textureEquirec = textureLoader.load( './T3_assets/skybox.jpg' );
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping; // Reflection as default
    textureEquirec.colorSpace = THREE.SRGBColorSpace;


// Set scene's background as a equirectangular map
scene.background = textureEquirec;


//initDefaultBasicLight(scene); // Create a basic light to illuminate the scene

const crosshair = document.querySelector('.crosshair');
const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0.01, 2);
const horizontalCaster = new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,0,-1).normalize(),0.01,2);
const verticalCaster= new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0.01, 2);
let atElevador=false;
let elevadorCanMove=true;
let isAttached=false;
let isMouseDown = false;
export let playerHasEnteredFirstArea = {value: false, name:"playerHasEnteredFirstArea", soundPlayed: false};

export let playerHasEnteredSecondArea = {value: false, name:"playerHasEnteredSecondArea", soundPlayed: false}

// --------------------- GOD MODE ---------------------
export const godModeState = { enabled: false };
const gotAllKeys = { value: false };
let godModeText;
let gotAllKeysText;

function createGodModeUI() {
    godModeText = document.createElement('div');
    godModeText.id = 'god-mode-text';
    godModeText.style.position = 'absolute';
    godModeText.style.top = '20px';
    godModeText.style.left = '50%';
    godModeText.style.transform = 'translateX(-50%)';
    godModeText.style.color = '#FF0000';
    godModeText.style.fontSize = '2em';
    godModeText.style.fontFamily = '"Press Start 2P", cursive, sans-serif';
    godModeText.style.fontWeight = 'bold';
    godModeText.style.textShadow = '2px 2px 4px #000000';
    godModeText.style.display = 'none'; // Initially hidden
    godModeText.innerText = 'GOD MODE ENABLED';
    document.body.appendChild(godModeText);
}

function createGotAllKeysUI() {
    gotAllKeysText = document.createElement('div');
    gotAllKeysText.id = 'got-all-keys-text';
    gotAllKeysText.style.position = 'absolute';
    gotAllKeysText.style.top = '200px';
    gotAllKeysText.style.left = '15%';
    gotAllKeysText.style.transform = 'translateX(-50%)';
    gotAllKeysText.style.color = '#1100ffff';
    gotAllKeysText.style.fontSize = '2em';
    gotAllKeysText.style.fontFamily = '"Press Start 2P", cursive, sans-serif';
    gotAllKeysText.style.fontWeight = 'bold';
    gotAllKeysText.style.textShadow = '2px 2px 4px #000000';
    gotAllKeysText.style.display = 'none'; // Initially hidden
    gotAllKeysText.innerText = 'GOT ALL KEYS';
    document.body.appendChild(gotAllKeysText);
}
// ----------------------------------------------------

// ---------------------Ambiente---------------------

initSoundSystem(camera);

let plane = TF.createGroundPlaneXZCust(500, 500, 10, 10, TF.planeTex(["../assets/textures/intertravado.jpg"]));
 scene.add(plane);
 plane.receiveShadow=true;
   // center.plane.translateY(+0.15);

let scenario= S0.Scene0();
scene.add(scenario); // Add the scenario to the scene
scenario.translateY(-0.15);

let tetoGeometry = new THREE.PlaneGeometry(500, 500);
let tetoMaterial = new THREE.MeshLambertMaterial();
export let teto = new THREE.Mesh(tetoGeometry, tetoMaterial);
teto.rotation.x = Math.PI / 2;
teto.position.set(0,40,0);
teto.visible = false;
scene.add(teto);
let gateMove={value:false};

let player = instancePlayer();
scene.add(player);
player.translateY(1);
player.add(camera)
camera.translateY(1);

const controls = new PointerLockControls(player, renderer.domElement);

const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
createPlayerHpBar();
updatePlayerHpBar(player);
createGodModeUI(); // Create the God Mode text element
createGotAllKeysUI();

// ---------------------Controles do mouse---------------------

instructions.addEventListener('click', function () {
    controls.lock();
}, false);

window.addEventListener('mousedown', function (event) {
    if (!controls.isLocked) return; 

    if (event.button === 0 || event.button === 2) {
        isMouseDown = true; 
    }
}, false);

window.addEventListener('mouseup', function (event) {
    if (!controls.isLocked) return;
    if (event.button === 0 || event.button === 2) {
        isMouseDown = false; 
    }
}, false);

controls.addEventListener('lock', function () {
    toggleBackgroundMusic();
    crosshair.style.display = 'block'
    instructions.style.display = 'none';
    blocker.style.display = 'none';
    document.getElementById('player-hp-container').style.display = 'flex';
});

controls.addEventListener('unlock', function () {
    toggleBackgroundMusic();
    crosshair.style.display = 'none';
    blocker.style.display = 'block';
    instructions.style.display = '';
    document.getElementById('player-hp-container').style.display = 'none';
});

// ---------------------Iluminação---------------------
let positionLight = new THREE.Vector3(-400, 400, -400);
let positionLight2 = new THREE.Vector3(200, 400, 200);

let lightColor = "rgb(112, 112, 111)";

let dirLight = new THREE.DirectionalLight(lightColor, 20);
//let dirLight2 = new THREE.DirectionalLight(lightColor, 0.);

dirLight.position.copy(positionLight);
//dirLight2.position.copy(positionLight2);
dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -300;
dirLight.shadow.camera.right = 300;
dirLight.shadow.camera.top = 300;
dirLight.shadow.camera.bottom = -300;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 1000;


dirLight.target.position.set(0, 0, 5);
//dirLight2.target.position.set(0, 0, -5);
scene.add(dirLight.target);
//scene.add(dirLight2.target);

const ambiente = new THREE.AmbientLight(lightColor, 0.5);
// ---------------------Iluminação Hangar---------------------
let lightPositionHangar = new THREE.Vector3(0, 3, 0);
let lightColorHangar = 'rgb(255, 255, 255)'
let dirLightHangar = new THREE.DirectionalLight(lightColorHangar, 2);
dirLightHangar.position.copy(lightPositionHangar);
dirLightHangar.castShadow = true;

dirLightHangar.shadow.mapSize.width = 512;
dirLightHangar.shadow.mapSize.height = 512;
dirLightHangar.shadow.camera.left = -50;
dirLightHangar.shadow.camera.right = 50;
dirLightHangar.shadow.camera.top = 50;
dirLightHangar.shadow.camera.bottom = -50;
dirLightHangar.shadow.camera.near = 1;
dirLightHangar.shadow.camera.far = 10;
scene.add(dirLightHangar);
// ---------------------Iluminação Hangar---------------------
scene.add(ambiente);

scene.add(dirLight);
//scene.add(dirLight2);

// ---------------------Controles de teclado---------------------

window.addEventListener('keydown', (event) => movementControls(event.keyCode, true));
window.addEventListener('keyup', (event) => movementControls(event.keyCode, false));



scene.add(controls.getObject());
// ---------------------Criando a Mesh que vai ser usada---------------------

let materialBox = new THREE.MeshLambertMaterial({color: "rgb(86, 202, 19)"});
let boxTakeKeyA1 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5),  TF.setMaterial("./T3_assets/stone_floor.jpg"));
boxTakeKeyA1.translateX(-130);//-130
boxTakeKeyA1.translateY(5);//5
boxTakeKeyA1.translateZ(-160);//-160

let material4 = new THREE.MeshLambertMaterial({color: "rgb(165, 49, 49)"});
let boxDropKeyA1 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), material4);
boxDropKeyA1.translateX(20);
boxDropKeyA1.translateY(1.5);
boxDropKeyA1.translateZ(-98);

let materialBox3 = new THREE.MeshLambertMaterial({color: "rgb(165, 49, 49)"});
let boxTakeKeyA2 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), materialBox3);
boxTakeKeyA2.translateX(0);
boxTakeKeyA2.translateY(5);//5
boxTakeKeyA2.translateZ(-160);//-160

let materialBox4 = new THREE.MeshLambertMaterial({color: "rgb(214, 83, 8)"});
let boxDropKeyA2 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), materialBox4);
boxDropKeyA2.translateX(125);
boxDropKeyA2.translateY(1.5);
boxDropKeyA2.translateZ(-98);

let materialBox5 = new THREE.MeshLambertMaterial({color: "rgb(165, 49, 49)"});
let boxTakeKeyA3 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), materialBox5);
boxTakeKeyA3.translateX(150);
boxTakeKeyA3.translateY(-1);//5
boxTakeKeyA3.translateZ(-98);//-160

let materialBox6 = new THREE.MeshLambertMaterial({color: "rgb(214, 83, 8)"});
let boxDropKeyA3 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), materialBox6);
boxDropKeyA3.translateX(0);
boxDropKeyA3.translateY(1.5);
boxDropKeyA3.translateZ(10);

scene.add(boxTakeKeyA1);
scene.add(boxDropKeyA1);

scene.add(boxTakeKeyA2);
scene.add(boxDropKeyA2);

scene.add(boxTakeKeyA3);
scene.add(boxDropKeyA3);

const BOX = [boxTakeKeyA1, boxTakeKeyA2, boxTakeKeyA3, boxDropKeyA1, boxDropKeyA2, boxDropKeyA3];
const BOX_KEYS = BOX.slice(0, 3);//[boxTakeKeyA1, boxTakeKeyA2/*, boxTakeKeyA3*/];
const BOX_DROP_KEYS = BOX.slice(3,6);//[boxDropKeyA1, boxDropKeyA2/*, boxDropKeyA3*/];
const BOXDROP1 = [boxDropKeyA1]
const BOXDROP2 = [boxDropKeyA2]
const BOXDROP3 = [boxDropKeyA3]


let chave1 = CHAVE.CHAVE('rgb(255, 0, 0)');
let chave2 = CHAVE.CHAVE('rgb(255, 255, 0)');
let chave3 = CHAVE.CHAVE('rgb(0, 0, 255)');

let take_key1 = {value: false};

let take_key2 = {value: false};

let take_key3 = {value: false};

let drop_key1 = {value: false};

let drop_key2 = {value: false};

let drop_key3 = {value: false};



export const apelacao = { value: false };

let enemies = await loadEnemies(scene);

const posFinalBox1 = boxTakeKeyA1.position.y + 2;//1.5
const posFinalBox2 = boxTakeKeyA2.position.y + 1.75;
const posFinalBox3 = boxTakeKeyA3.position.y + 2.25;
function operationKeys(){
    // ------------- TAKE KEYS -------------
    if (take_key1.value/* || apelacao.value*/){
        if(boxTakeKeyA1.children.includes(chave1)){
            boxTakeKeyA1.remove(chave1);
        }
    }
    if (take_key2.value /* || apelacao.value*/){
        if(boxTakeKeyA2.children.includes(chave2)){
            boxTakeKeyA2.remove(chave2);
        }
    }
    if ((take_key3.value)/* || apelacao.value*/){
        if(boxTakeKeyA3.children.includes(chave3)){    
            boxTakeKeyA3.remove(chave3);
        }
    }

    // ------------- DROP KEYS -------------
    if (drop_key1.value){
        console.log("entrou no dropar chave 1");
        if(!boxDropKeyA1.children.includes(chave1)){
            boxDropKeyA1.add(chave1);
            chave1.position.set(0,1,0);
        }
        gateMove.value = true;
    }
    if (drop_key2.value){
        console.log("entrou no dropar chave 2");
        if(!boxDropKeyA2.children.includes(chave2)){
            boxDropKeyA2.add(chave2);
            chave2.position.set(0,1,0);
        }
        VA.animVert(scenario.porta,40,drop_key2,-40);
    }
    if (drop_key3.value){
        console.log("entrou no dropar chave 3");
        if(!boxDropKeyA3.children.includes(chave3)){
            boxDropKeyA3.add(chave3);
            chave3.position.set(0,1,0);
        }
        VA.animVert(scenario.walls4,30,drop_key3,-30)
    }

    if(!apelacao.value){
        // Adicionar a chave após a eliminação das skulls
        if ((enemies.skulls.length === 0) && !take_key1.value && !drop_key1.value){
            if(!boxTakeKeyA1.children.includes(chave1)){
                boxTakeKeyA1.add(chave1);
                chave1.position.set(0,1,0);
            }
            if(boxTakeKeyA1.position.y < posFinalBox1){
                boxTakeKeyA1.position.y += 0.1;
            }
        }
        // Adicionar a chave após a eliminação dos cacodemons
        if ((enemies.cacodemons.length <= 4) && !take_key2.value && !drop_key2.value){
            if(!boxTakeKeyA2.children.includes(chave2)){
                boxTakeKeyA2.add(chave2);
                chave2.position.set(0,1,0);
            }
            if(boxTakeKeyA2.position.y < posFinalBox2){
                boxTakeKeyA2.position.y += 0.1;
            }
        }
        // Adicionar a chave após a eliminação dos soldados
        if (/*enemies.soldiers.length === 0 ||  &&*/ !take_key3.value && !drop_key3.value){
            if(!boxTakeKeyA3.children.includes(chave3)){
                boxTakeKeyA3.add(chave3);
                chave3.position.set(0,1,0);
            }
            if(boxTakeKeyA3.position.y < posFinalBox3){
                boxTakeKeyA3.position.y += 0.1;
            }
        }
    }
}

// ------------ ASSET DO AVIÃO --------------
async function init(){
    const planeAsset = await Plane();
    planeAsset.translateX(-180);
    planeAsset.translateZ(-150);
    scene.add(planeAsset);
}
init();


// ------------ CONTROLES DO TECLADO --------------



const speed = 20;
const fall = 10; // speed of falling
const KEY_S = 83;
const KEY_W = 87;
const KEY_A = 65;
const KEY_D = 68;
const KEY_ARROW_LEFT = 37;
const KEY_ARROW_UP = 38;
const KEY_ARROW_RIGHT = 39;
const KEY_ARROW_DOWN = 40;
const KEY_SPACE = 32;
const KEY_1 = 49; // 1 key
const KEY_2 = 50; // 2 key
const KEY_SHIFT = 16; // Shift key
const KEY_C = 67;
const KEY_G = 71; 
const KEY_Q = 81;
const elSpeedo=10;
// const SHOOT = ;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
// let shoot = false;
let isSprinting = false;



function movementControls(key, value) { // if xabu , go back here
    switch (key) {
        case KEY_ARROW_UP:
        case KEY_W:
            moveForward = value;
            break;
        case KEY_ARROW_DOWN:
        case KEY_S:
            moveBackward = value;
            break;
        case KEY_ARROW_LEFT:
        case KEY_A:
            moveLeft = value;
            break;
        case KEY_ARROW_RIGHT:
        case KEY_D:
            moveRight = value;
            break;
        case KEY_SHIFT:
            isSprinting = value;
            break;
        case KEY_SPACE:
            console.log("Player position: ", player.position);
            break;
        case KEY_1:
            if (currentGun === GUNTYPE.lancador) {
                toggleGun(camera); // Switch to chaingun
            }
            break;
        case KEY_2:
            if (currentGun === GUNTYPE.chaingun) {
                toggleGun(camera); // Switch to ball launcher
            }
            break;

        case KEY_C:
            if(value){
                apelacao.value = !apelacao.value;

                if(apelacao.value){
                    take_key1.value = true;
                    take_key2.value = true;
                    take_key3.value = true;
                }

                gotAllKeys.value = !gotAllKeys.value;
                gotAllKeysText.style.display = gotAllKeys.value ? 'block' : 'none';
            }
          break;
        case KEY_Q:
            if (value) toggleBackgroundMusic(); // Ligar/desligar música
            break;
        case KEY_G:
            if (value) { // Only toggle on keydown, not keyup
                godModeState.enabled = !godModeState.enabled;
                godModeText.style.display = godModeState.enabled ? 'block' : 'none';
            }
            break;
    }
}



function moveAnimate(delta) {
    raycaster.ray.origin.copy(controls.getObject().position);
    horizontalCaster.ray.origin.copy(controls.getObject().position);
    verticalCaster.ray.origin.copy(controls.getObject().position);
    
    
    const LEFTMOST_BOX = scenario.objects[0];
    const UPPER_MIDDLE_BOX = scenario.objects[1];
    const NORTH_WALL = scenario.objects[2];
    const SOUTH_WALL = scenario.objects[4];
    const LEFT_WALL = scenario.objects[3];
    const RIGHT_WALL = scenario.objects[5];

    const currentSpeed = isSprinting ? speed * 2 : speed;

    // MOVIMENTAÇÃO DO PORTÃO
    GATE.gateAnim(scenario.objects[1],gateMove);
    //ELEVADOR
    verticalCaster.ray.direction.copy(LOOK.Down(controls)).normalize();
    atElevador=EL.elevadorLogic(verticalCaster,scenario.objects[1],controls,elevadorCanMove,isAttached);
    if(atElevador && elevadorCanMove) playSound('PLATFORM_MOVE');

    //FALL logic
    if(!atElevador){
        
        verticalCaster.ray.direction.copy(LOOK.Down(controls)).normalize();
        INTER.fall(verticalCaster,[LEFTMOST_BOX,UPPER_MIDDLE_BOX,plane,UPPER_MIDDLE_BOX.elevador],controls,fall*delta);
     }
    //STAIR LOGIC
    SCLIMB.stairclimb(verticalCaster,[LEFTMOST_BOX],controls);
    //ENEMIES ACTIVATE
    INTER.activateAi(verticalCaster,[scenario.objects[0].enemyActivateBox,scenario.objects[1].enemyActivateBox],playerHasEnteredFirstArea,playerHasEnteredSecondArea,controls);
    
    //MOVIMENTAÇÃO
    function handleMovement(directionFunc, moveFunc){
        horizontalCaster.ray.direction.copy(directionFunc).normalize();
        const colision = INTER.intersection(horizontalCaster,scenario.objects, enemies, controls,speed*delta);
        const colisionKeys = INTER.intersectionBoxs(horizontalCaster, BOX_KEYS, controls, speed*delta);
        const colisionBoxDropKeys = INTER.intersectionBoxs(horizontalCaster, BOX_DROP_KEYS, controls, speed*delta);
        const colisionAllBoxKeys = INTER.intersectionBoxs(horizontalCaster, BOX, controls, speed*delta);
        
        //TAKE KEYS
        if(colisionKeys){
            if(!take_key1.value && boxTakeKeyA1.children.includes(chave1)){
                INTER.takeKey(boxTakeKeyA1, take_key1, chave1);
            }
            if(!take_key2.value && boxTakeKeyA2.children.includes(chave2)){
                INTER.takeKey(boxTakeKeyA2, take_key2, chave2);
            }
            if(!take_key3.value && boxTakeKeyA3.children.includes(chave3)){
                INTER.takeKey(boxTakeKeyA3, take_key3, chave3);
            }
        }
        // DROP KEYS
        const hitTakeBox = INTER.rayHitOne(horizontalCaster, BOX_KEYS);
        const hitDropBox = INTER.rayHitOne(horizontalCaster, BOX_DROP_KEYS);
        // if(colisionBoxDropKeys){
        console.log(hitDropBox);
        // if(hitDropBox){
            console.log(hitDropBox);
            console.log(boxDropKeyA1);
            console.log(hitDropBox === boxDropKeyA1)
            if(/*(hitDropBox === boxDropKeyA1) &&*/ take_key1.value && !drop_key1.value && boxDropKeyA1){
                INTER.dropKey(boxDropKeyA1, drop_key1, true, chave1);
                console.log("AQUIII");
                take_key1.value = false;
            }
            else if(/*(hitDropBox === boxDropKeyA2) &&*/ take_key2.value && !drop_key2.value && boxDropKeyA2){
                INTER.dropKey(boxDropKeyA2, drop_key2, true, chave2);
                take_key2.value = false;
            }
            else if(/*(hitDropBox === boxDropKeyA3) &&*/ take_key3.value && !drop_key3.value && boxDropKeyA3){
                INTER.dropKey(boxDropKeyA3, drop_key3, true, chave3);
                take_key3.value = false;
            }
        // }
        if(!colision && !colisionKeys && !colisionBoxDropKeys && !colisionAllBoxKeys)
            moveFunc(currentSpeed * delta);
    }
    if (moveForward) {
        handleMovement(LOOK.Foward(controls), v=> controls.moveForward(v));
    }
    else if (moveBackward) {
        handleMovement(LOOK.Backward(controls), v=> controls.moveForward(-v));
    }

    if (moveRight) {
        handleMovement(LOOK.Right(controls), v=> controls.moveRight(v));
    }
    else if (moveLeft) {
        handleMovement(LOOK.Left(controls), v=> controls.moveRight(-v));
    }
}

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
initWeaponSystem(camera, renderer);

const clock = new THREE.Clock();

export let fadingObjects = [];
let test={value:true};
render();

function render() {
    stats.update();
    if (controls.isLocked) {
        updateAnimations();
        updateWeapons(scenario, scene, camera, enemies, playSound);
        operationKeys();
        moveAnimate(clock.getDelta());
        //console.log(playerHasEnteredFirstArea);
        if (enemies) moveEnemies(scene, scenario, player, enemies, playerHasEnteredFirstArea.value, playerHasEnteredSecondArea.value); // will move enemies
        moveBullet(scene, camera, enemies); // will move bullet if its isShooting attribute is truthy
    }

    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFShadowMap;
    renderer.render(scene, camera) // Render scene
    // VA.animVert(scenario.porta,40,drop_key2,-40);
    // VA.animVert(scenario.walls4,30,drop_key3,-30);
    requestAnimationFrame(render);
}
