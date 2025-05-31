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
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
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


instructions.addEventListener('click', function () {

    controls.lock();

}, false);

controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
});

controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
});

scene.add(controls.getObject());

const velocidade = 5;
let moveForward = false;
let moveBackward = false;
let moveRight = false;
let moveLeft = false;

window.addEventListener('keydown', (event) => movementControls(event.keyCode, true))
window.addEventListener('keyup', (event) => movementControls(event.keyCode, false))

function movementControls(key, value) {
    if (key === 87 || key === 38){
        moveForward = value;
    }
    else if (key === 83 || key === 40){
        moveBackward = value;
    }
    else if (key === 65 || key === 37){
        moveLeft = value;
    }
    else if (key === 68 || key === 39){
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