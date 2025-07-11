import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {initRenderer,
        initDefaultBasicLight,
        setDefaultMaterial, 
        onWindowResize,
        createGroundPlaneXZ } from "../libs/util/util.js";
import * as S0 from "./scene0.js";
import {PointerLockControls} from '../build/jsm/controls/PointerLockControls.js';
import {initGun, moveBullet, initShootBall} from "./arma.js";
import * as CHAVE from './chave.js';
import * as LOOK from './lookers.js'
import * as INTER from './intersecter.js'
import * as SCLIMB from './stairClimb.js'
import { loadEnemies, moveEnemies } from './inimigos.js';

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


// ---------------------Ambiente---------------------

let plane = createGroundPlaneXZ(500, 500, 10, 10, "rgb(53, 48, 48)");
 scene.add(plane);
   // center.plane.translateY(+0.15);

let scenario=S0.Scene0();
scene.add(scenario); // Add the scenario to the scene
scenario.translateY(-0.15);

initGun(camera);
let player = new THREE.Mesh(new THREE.BoxGeometry(1,2,1), new THREE.MeshLambertMaterial({color: "rgb(231, 11, 11)"}));
scene.add(player);
player.translateY(1);
player.add(camera);
camera.translateY(1);

const controls = new PointerLockControls(player, renderer.domElement);

const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');

// ---------------------Controles do mouse---------------------
instructions.addEventListener('click', function () {
    controls.lock();
}, false);

let isMouseDown = false; // Track whether the mouse button is held down

renderer.domElement.addEventListener('mousedown', function (event) {
    if (event.button === 2 || (event.button === 0 && crosshair.style.display === 'block')) { // Right mouse button or left mouse button when crosshair is visible
        isMouseDown = true; 
    }
}, false);

renderer.domElement.addEventListener('mouseup', function (event) {
    if (event.button === 2 || event.button === 0) { // Right or left mouse button
        isMouseDown = false; // Set the flag to false
    }
}, false);

function shootWhileHolding(scene, camera) {
    if (isMouseDown) {
        initShootBall(scenario, scene, camera); // Call the shooting function
    }
}

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
let positionLight = new THREE.Vector3(0, 20, 100);
let positionLight2 = new THREE.Vector3(0, 20, -100);
let lightColor = "rgb(255,255,255)";
let dirLight = new THREE.DirectionalLight(lightColor, 1);
let dirLight2 = new THREE.DirectionalLight(lightColor, 1);
dirLight.position.copy(positionLight);
dirLight2.position.copy(positionLight2);
dirLight.castShadow = true;
dirLight2.castShadow = true;
scene.add(dirLight);
scene.add(dirLight2);

// ---------------------Controles de teclado---------------------

window.addEventListener('keydown', (event) => movementControls(event.keyCode, true));
window.addEventListener('keyup', (event) => movementControls(event.keyCode, false));


scene.add(controls.getObject());
// ---------------------Criando a Mesh que vai ser usada---------------------

let csgFinal = CHAVE.CHAVE();

scene.add(csgFinal);

let enemies = await loadEnemies(scene);



// ------------ CONTROLES DO TECLADO --------------

const speed = 20;
const fall = 10;
const KEY_S = 83;
const KEY_W = 87;
const KEY_A = 65;
const KEY_D = 68;
const KEY_ARROW_LEFT = 37;
const KEY_ARROW_UP = 38;
const KEY_ARROW_RIGHT = 39;
const KEY_ARROW_DOWN = 40;
const KEY_SPACE = 32;
// const SHOOT = ;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
// let shoot = false;

function movementControls(key, value) { // if xabu , go back here
    switch (key) {
        case KEY_W || KEY_ARROW_UP: // W
            moveForward = value;
            break;
        case KEY_S || KEY_ARROW_DOWN: // S
            moveBackward = value;
            break;
        case KEY_A || KEY_ARROW_LEFT: // A
            moveLeft = value;
            break;
        case KEY_D || KEY_ARROW_RIGHT: // D
            moveRight = value;
            break;
        case KEY_SPACE: // Space
            console.log("Player position: ", player.position);
            break;
        // case SHOOT:
        //     shoot = value;
        //     break;
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


    const isIntersectingEnemies = raycaster.intersectObjects(enemies.skulls.map(e => e.obj)).length > 0 ||
        raycaster.intersectObjects(enemies.cocodemons.map(e => e.obj)).length
        > 0;

    const isIntersectingGround = raycaster.intersectObjects([NORTH_WALL, SOUTH_WALL, LEFT_WALL, RIGHT_WALL]).length > 0;
    const isIntersectingWall = raycaster.intersectObjects([NORTH_WALL, SOUTH_WALL, LEFT_WALL, RIGHT_WALL]).length > 0;
    const isIntersectingRamp = raycaster.intersectObjects([LEFTMOST_BOX.stair, UPPER_MIDDLE_BOX.stair, RIGHTMOST_BOX.stair, LOWER_MIDDLE_BOX.stair]).length > 0;
    const isIntersectingPlane = raycaster.intersectObject(plane).length > 0;
    

    //FALL logic
    verticalCaster.ray.direction.copy(LOOK.Down(controls)).normalize();
    INTER.fall(verticalCaster,[LEFTMOST_BOX,UPPER_MIDDLE_BOX,RIGHTMOST_BOX,LOWER_MIDDLE_BOX,plane],controls,fall*delta);

    //STAIR LOGIC
    SCLIMB.stairclimb(verticalCaster,[LEFTMOST_BOX,UPPER_MIDDLE_BOX,RIGHTMOST_BOX,LOWER_MIDDLE_BOX],controls);
    
    if (moveForward) {
        horizontalCaster.ray.direction.copy(LOOK.Foward(controls)).normalize();
        const colision = INTER.intersection(horizontalCaster,scenario.objects,controls,speed*delta);
        if(!colision)
            controls.moveForward(speed * delta);

    }
    else if (moveBackward) {
        horizontalCaster.ray.direction.copy(LOOK.Backward(controls)).normalize();
        const colision = INTER.intersection(horizontalCaster,scenario.objects,controls,speed*delta);
        if(!colision)
            controls.moveForward(speed * -1 * delta);
    }

    if (moveRight) {
        
        horizontalCaster.ray.direction.copy(LOOK.Right(controls)).normalize();
        const colision = INTER.intersection(horizontalCaster,scenario.objects,controls,speed*delta);
        if(!colision)
            controls.moveRight(speed * delta);
    }
    else if (moveLeft) {
        horizontalCaster.ray.direction.copy(LOOK.Left(controls)).normalize();
        const colision = INTER.intersection(horizontalCaster,scenario.objects,controls,speed*delta);
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

function render() {
    stats.update();
    shootWhileHolding(scene, camera); // will shoot if mouse is down
    if (controls.isLocked) {
        moveAnimate(clock.getDelta());
        if (enemies) moveEnemies(scenario, enemies, player); // will move enemies
        moveBullet(scene, camera); // will move bullet if its isShooting attribute is truthy
    }
    renderer.render(scene, camera) // Render scene
    requestAnimationFrame(render);
}