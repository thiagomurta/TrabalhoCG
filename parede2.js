import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {PointerLockControls} from '../build/jsm/controls/PointerLockControls.js';
import {initRenderer, 
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        SecondaryBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";
import {initGun, moveBullet, initShootBall} from "./arma.js";

let scene, renderer, material; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
material = setDefaultMaterial(); // create a basic material
var stats = new Stats();

// ---------------------Câmera---------------------
let camPos  = new THREE.Vector3(0.0, 0.5, 0.0);
// let camUp   = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0.0, 0.5, -1.0);
var message = new SecondaryBox("");
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.copy(camPos);
camera.lookAt(camLook);

initDefaultBasicLight(scene); // Create a basic light to illuminate the scene


// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create a wall
let wallGeometry1 = new THREE.BoxGeometry(20, 10, 0.1);
let wall1 = new THREE.Mesh(wallGeometry1, material);
// position the cube
wall1.position.set(0.0, 5.0, -10.0);

// create a wall
let wallGeometry2 = new THREE.BoxGeometry(20, 10, 0.1);
let wall2 = new THREE.Mesh(wallGeometry2, material);
// position the cube
wall2.position.set(0.0, 5.0, 10.0);

// create a wall
let wallGeometry3 = new THREE.BoxGeometry(0.1, 10, 20);
let wall3 = new THREE.Mesh(wallGeometry3, material);
// position the cube
wall3.position.set(-10.0, 5.0, 0.0);

// create a wall
let wallGeometry4 = new THREE.BoxGeometry(0.1, 10, 20);
let wall4 = new THREE.Mesh(wallGeometry4, material);
// position the cube
wall4.position.set(10.0, 5.0, 0.0);

// add the wall to the scene
scene.add(wall1);
scene.add(wall2);
scene.add(wall3);
scene.add(wall4);

const controls = new PointerLockControls(camera, renderer.domElement);


const crosshair = document.querySelector('.crosshair'); // Select the crosshair element

instructions.addEventListener('click', function () {
    controls.lock();
}, false);

controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
    crosshair.style.display = 'block'; // Show the crosshair when locked
});

controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
    crosshair.style.display = 'none'; // Hide the crosshair when unlocked
});

scene.add(controls.getObject());

const velocidade = 5;
let moveForward = false;
let moveBackward = false;
let moveRight = false;
let moveLeft = false;

window.addEventListener('keydown', (event) => movementControls(event.keyCode, true))
window.addEventListener('keyup', (event) => movementControls(event.keyCode, false))

const KEY_S = 83;
const KEY_W = 87;
const KEY_A = 65;
const KEY_D = 68;
const KEY_ARROW_LEFT = 37;
const KEY_ARROW_UP = 38;
const KEY_ARROW_RIGHT = 39;
const KEY_ARROW_DOWN = 40;
const KEY_SPACE = 32;

function movementControls(key, value) {
    if (key === KEY_SPACE && value) { // only on key down
        initShootBall(scene, camera);
    }

    // depende da ordem
    // atirar -> andar, para de atirar
    // andar -> atirar, funfa
    if (key === KEY_W || key === KEY_ARROW_UP){
        moveForward = value;
    }
    if (key === KEY_S || key === KEY_ARROW_DOWN){
        moveBackward = value;
    }
    if (key === KEY_A || key === KEY_ARROW_LEFT){
        moveLeft = value;
    }
    if (key === KEY_D || key === KEY_ARROW_RIGHT){
        moveRight = value;
    }
}

function moveAnimate(delta) {
    // raycaster.ray.origin.copy(controls.getObject().position);

    if (moveForward) {
        controls.moveForward(velocidade * delta);
    }
    else if (moveBackward) {
        controls.moveForward(velocidade * -1 * delta);
    }
    
    if (moveRight) {
        controls.moveRight(velocidade * delta);
    }
    else if (moveLeft) {
        controls.moveRight(velocidade * -1 * delta);
    }
    updateCamera();
}



initGun(scene, camera);


// Use this to show information onscreen
let controle = new InfoBox();
controle.add("Movimentação");
controle.addParagraph();
controle.add("Use mouse to interact:");
controle.add("* W or upda to walk forward");
controle.add("* A or  to walk left");
controle.add("* S or  to walk backward");
controle.add("* D or  to walk right");
controle.show();

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

const clock = new THREE.Clock();

render();
function render(){
    stats.update();

    moveBullet(); // Move bullet if shooting is enabled
    
    if (controls.isLocked) {
        moveAnimate(clock.getDelta());
    }
    renderer.render(scene, camera) // Render scene
    requestAnimationFrame(render);
}

function updateCamera(){
    // DICA: Atualize a câmera aqui!
    message.changeMessage("Pos: " + controls.getObject().position.x.toFixed(1) + ", "
    + controls.getObject().position.y.toFixed(1) + ", "
    + controls.getObject().position.z.toFixed(1));
    // message.changeMessage("LookAt: ");
}