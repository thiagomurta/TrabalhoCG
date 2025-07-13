import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {initRenderer,
        initDefaultBasicLight,
        setDefaultMaterial, 
        onWindowResize,
        createGroundPlaneXZ } from "../libs/util/util.js";
import * as S0 from "./scene0.js";
import {PointerLockControls} from '../build/jsm/controls/PointerLockControls.js';
import {initGun, moveBullet, initShootBall, removeGun} from "./arma/armaLancador.js";
import {loadChaingun, removeChaingun, startShootingChaingun, stopShootingChaingun} from "./arma/chaingun.js";
import * as CHAVE from './chave.js';
import * as LOOK from './lookers.js'
import * as INTER from './intersecter.js'
import * as SCLIMB from './stairClimb.js'
import { loadEnemies, moveEnemies, updateAnimations } from './inimigos/inimigos.js';
import * as EL from './elevador.js'

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

//initDefaultBasicLight(scene); // Create a basic light to illuminate the scene

const crosshair = document.querySelector('.crosshair');
const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0.01, 2);
const horizontalCaster = new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,0,-1).normalize(),0.01,2);
const verticalCaster= new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0.01, 2);
let atElevador=false;
let elevadorCanMove=true;
let isAttached=false;

// ---------------------Ambiente---------------------

let plane = createGroundPlaneXZ(500, 500, 10, 10, "rgb(153, 148, 148)");
 scene.add(plane);
 plane.receiveShadow=true;
   // center.plane.translateY(+0.15);

let scenario=S0.Scene0();
scene.add(scenario); // Add the scenario to the scene
scenario.translateY(-0.15);

let tetoGeometry = new THREE.PlaneGeometry(500, 500);
let tetoMaterial = new THREE.MeshLambertMaterial();
export let teto = new THREE.Mesh(tetoGeometry, tetoMaterial);
teto.rotation.x = Math.PI / 2;
teto.position.set(0,40,0);
teto.visible = false;
scene.add(teto);

//initGun(camera);
loadChaingun(camera);
let player = new THREE.Mesh(new THREE.BoxGeometry(1,2,1), new THREE.MeshLambertMaterial({color: "rgb(231, 11, 11)"}));
scene.add(player);
player.translateY(1);
player.add(camera)
camera.translateY(1);

const controls = new PointerLockControls(player, renderer.domElement);

const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');

// ---------------------Controles do mouse---------------------
instructions.addEventListener('click', function () {
    controls.lock();
}, false);

let isMouseDown = false; // Track whether the mouse button is held down

window.addEventListener('mousedown', function (event) {
    if (!controls.isLocked) return; 

    //check for either left or right mouse button, either work
    if (event.button === 0 || event.button === 2) {
        isMouseDown = true; 
    }
}, false);

window.addEventListener('mouseup', function (event) {
    if (event.button === 0 || event.button === 2) { 
        isMouseDown = false; 
    }
}, false);

//scrolling up and down calls toggleGun()
let isCoolingDown = false;

renderer.domElement.addEventListener('wheel', function (event) {
    if (event.deltaY !== 0 && !isCoolingDown) {
        toggleGun(); 
        isCoolingDown = true;
        setTimeout(() => {
            isCoolingDown = false;
        }, 500); //delayzinho dos cria
    }
}, false);

controls.addEventListener('lock', function () {
    crosshair.style.display = 'block'
    instructions.style.display = 'none';
    blocker.style.display = 'none';
});

controls.addEventListener('unlock', function () {
    crosshair.style.display = 'none';
    blocker.style.display = 'block';
    instructions.style.display = '';
});

// ---------------------Iluminação---------------------
let positionLight = new THREE.Vector3(-200, 400, -200);
let positionLight2 = new THREE.Vector3(200, 400, 200);

let lightColor = "rgb(255,255,255)";

let dirLight = new THREE.DirectionalLight(lightColor, 2);
let dirLight2 = new THREE.DirectionalLight(lightColor, 1);

dirLight.position.copy(positionLight);
dirLight2.position.copy(positionLight2);
dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.left = -300;
dirLight.shadow.camera.right = 300;
dirLight.shadow.camera.top = 300;
dirLight.shadow.camera.bottom = -300;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 1000;


dirLight.target.position.set(0, 0, 5);
dirLight2.target.position.set(0, 0, -5);
scene.add(dirLight.target);
scene.add(dirLight2.target);

const ambiente = new THREE.AmbientLight(lightColor, 0.5);
scene.add(ambiente);

scene.add(dirLight);
scene.add(dirLight2);

// ---------------------Controles de teclado---------------------

window.addEventListener('keydown', (event) => movementControls(event.keyCode, true));
window.addEventListener('keyup', (event) => movementControls(event.keyCode, false));



scene.add(controls.getObject());
// ---------------------Criando a Mesh que vai ser usada---------------------

let chave1 = CHAVE.CHAVE('rgb(255, 0, 0)');
// let chave2 = CHAVE.CHAVE('rgb(255, 255, 0)');
// chave2.translateX(2);
scene.add(chave1);
// scene.add(chave2);

let enemies = await loadEnemies(scene);



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
const elSpeedo=10;
// const SHOOT = ;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
// let shoot = false;

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
        case KEY_ARROW_RIGHT:
        case KEY_A:
            moveLeft = value;
            break;
        case KEY_ARROW_LEFT:
        case KEY_D:
            moveRight = value;
            break;
        case KEY_SPACE:
            console.log("Player position: ", player.position);
            break;
        case KEY_1:
            if (currentGun === GUNTYPE.lancador) {
                toggleGun(); // Switch to chaingun
            }
            break;
        case KEY_2:
            if (currentGun === GUNTYPE.chaingun) {
                toggleGun(); // Switch to ball launcher
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
    const RIGHTMOST_BOX = scenario.objects[2];
    const LOWER_MIDDLE_BOX = scenario.objects[3];
    const NORTH_WALL = scenario.objects[4];
    const SOUTH_WALL = scenario.objects[5];
    const LEFT_WALL = scenario.objects[6];
    const RIGHT_WALL = scenario.objects[7];

    const isIntersectingWall = raycaster.intersectObjects([NORTH_WALL, SOUTH_WALL, LEFT_WALL, RIGHT_WALL]).length > 0;

    
    //ELEVADOR
    verticalCaster.ray.direction.copy(LOOK.Down(controls)).normalize();
    atElevador=EL.elevadorLogic(verticalCaster,scenario.objects[1],controls,elevadorCanMove,isAttached);

    //FALL logic
    if(!atElevador){
        
        verticalCaster.ray.direction.copy(LOOK.Down(controls)).normalize();
        INTER.fall(verticalCaster,[LEFTMOST_BOX,UPPER_MIDDLE_BOX,RIGHTMOST_BOX,LOWER_MIDDLE_BOX,plane,UPPER_MIDDLE_BOX.elevador],controls,fall*delta);
     }
    //STAIR LOGIC
    SCLIMB.stairclimb(verticalCaster,[LEFTMOST_BOX,RIGHTMOST_BOX,LOWER_MIDDLE_BOX],controls);

    INTER.activateAi(verticalCaster,[scenario.objects[0].enemyActivateBox,scenario.objects[1].enemyActivateBox],playerHasEnteredFirstArea,playerHasEnteredSceondArea,controls)
    
    if (moveForward) {
        horizontalCaster.ray.direction.copy(LOOK.Foward(controls)).normalize();
        const colision = INTER.intersection(horizontalCaster,scenario.objects, enemies, controls,speed*delta);
        if(!colision)
            controls.moveForward(speed * delta);

    }
    else if (moveBackward) {
        horizontalCaster.ray.direction.copy(LOOK.Backward(controls)).normalize();
        const colision = INTER.intersection(horizontalCaster,scenario.objects, enemies, controls,speed*delta);
        if(!colision)
            controls.moveForward(speed * -1 * delta);
    }

    if (moveRight) {
        
        horizontalCaster.ray.direction.copy(LOOK.Right(controls)).normalize();
        const colision = INTER.intersection(horizontalCaster,scenario.objects, enemies, controls,speed*delta);
        if(!colision)
            controls.moveRight(speed * delta);
    }
    else if (moveLeft) {
        horizontalCaster.ray.direction.copy(LOOK.Left(controls)).normalize();
        const colision = INTER.intersection(horizontalCaster,scenario.objects, enemies, controls,speed*delta);
            if(!colision)
        controls.moveRight(speed * -1 * delta);
    }

    // if (isIntersectingRamp) {
    //    // player.position.y += speed * delta;
    // }

    // if ((!isIntersectingRamp && !isIntersectingPlane && !isIntersectingGround)) {
    //     player.position.y -= speed * delta;
    //     console.log("aqui");
    // }

    if (isIntersectingWall) {
        console.log("bateu na parede");
    }
}

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );


const clock = new THREE.Clock();
render();

let playerHasEnteredFirstArea = true;
let playerHasEnteredSceondArea = true;
export let fadingObjects = [];
const GUNTYPE = {
    chaingun: 'chaingun',
    lancador: 'lancador'
};
let currentGun = GUNTYPE.chaingun;

function toggleGun() {
    if (currentGun === GUNTYPE.chaingun) {
        currentGun = GUNTYPE.lancador;
        removeChaingun(camera); // Remove the chaingun from the camera
        initGun(camera); // Initialize the ball launcher
    } else {
        currentGun = GUNTYPE.chaingun;
        removeGun(camera); 
        loadChaingun(camera); 
    }
}

function shootWhileHolding(scene, camera) {
    
    if (isMouseDown) {
        switch (currentGun) {
            case GUNTYPE.chaingun:
                startShootingChaingun(enemies, camera); // Call the chaingun shooting function
                break;
            case GUNTYPE.lancador:
                initShootBall(scenario, scene, camera); // Call the shooting function
                break;
            default:
                console.warn("Error with gun type:", currentGun);
                break;
        }
    }

    else {
        stopShootingChaingun();
    }

}

function render() {
    stats.update();
    shootWhileHolding(scene, camera); // will shoot if mouse is down
    if (controls.isLocked) {
        updateAnimations();
        moveAnimate(clock.getDelta());
        if (enemies && playerHasEnteredFirstArea) moveEnemies(scene, scenario, enemies, player); // will move enemies
        moveBullet(scene, camera, enemies); // will move bullet if its isShooting attribute is truthy
    }
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.VSMShadowMap;
    renderer.render(scene, camera) // Render scene
    requestAnimationFrame(render);
}