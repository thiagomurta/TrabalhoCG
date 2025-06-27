import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {initRenderer,
        initDefaultBasicLight,
        setDefaultMaterial, 
        onWindowResize,
        createGroundPlaneXZ                } from "../libs/util/util.js";
import * as S0 from "./scene0.js";
import * as PL from "./player.js";
import {PointerLockControls} from '../build/jsm/controls/PointerLockControls.js';
import {initGun, moveBullet, initShootBall} from "./arma.js";

// ---------------------Configuração inicial---------------------
let scene, renderer;
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // View function in util/utils
initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
var stats = new Stats();
setDefaultMaterial(); // create a basic material

// ---------------------Câmera---------------------
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0.0, 1.5, 0.0);
camera.lookAt(new THREE.Vector3(0.0, 1.5, -1.0));

initDefaultBasicLight(scene); // Create a basic light to illuminate the scene

const crosshair = document.querySelector('.crosshair');
const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0, 2);

// ---------------------Ambiente---------------------

let plane = createGroundPlaneXZ(500, 500);
 scene.add(plane);
//let planePhantomBox = new THREE.Mesh(new THREE.BoxGeometry(width, height, length), material);
 
   // center.plane.translateY(+0.15);

let scenario=S0.Scene0();
scene.add(scenario); // Add the scenario to the scene
scenario.translateY(-0.15);

initGun(scene, camera);
let player = PL.instancePlayer(camera,scenario,renderer);
scene.add(player);
player.translateY(1);

const controls = new PointerLockControls(camera, renderer.domElement);

const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');

// ---------------------Controles do mouse---------------------
instructions.addEventListener('click', function () {

    controls.lock();

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

// ---------------------Controles de teclado---------------------

window.addEventListener('keydown', (event) => movementControls(event.keyCode, true));
window.addEventListener('keyup', (event) => movementControls(event.keyCode, false));


scene.add(controls.getObject());

const speed = 20;
const KEY_S = 83;
const KEY_W = 87;
const KEY_A = 65;
const KEY_D = 68;
const KEY_ARROW_LEFT = 37;
const KEY_ARROW_UP = 38;
const KEY_ARROW_RIGHT = 39;
const KEY_ARROW_DOWN = 40;
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
        // case SHOOT:
        //     shoot = value;
        //     break;
    }
}

function moveAnimate(delta) {
    raycaster.ray.origin.copy(controls.getObject().position);
    const isIntersectingGround = raycaster.intersectObjects([plane, scenario.objects[0], scenario.objects[1], scenario.objects[2], scenario.objects[3], scenario.objects[4], scenario.objects[5], scenario.objects[6], scenario.objects[7]]).length > 0;
    const isIntersectingRamp = raycaster.intersectObject([scenario.objects[0], scenario.objects[1], scenario.objects[2], scenario.objects[3]]).length > 0;

    if (moveForward) {
        controls.moveForward(speed * delta);
    }
    else if (moveBackward) {
        controls.moveForward(speed * -1 * delta);
    }

    if (moveRight) {
        controls.moveRight(speed * delta);
    }
    else if (moveLeft) {
        controls.moveRight(speed * -1 * delta);
    }

    if (isIntersectingRamp) {
        camera.position.y += speed * delta;
    }
    if (!isIntersectingGround && camera.position.y > 1.5 && camera.position.y > 0) {
        camera.position.y -= speed * delta;
    }
}

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );


const clock = new THREE.Clock();
render();

function render() {
   stats.update();

    if (controls.isLocked) {
        moveAnimate(clock.getDelta());
    }

   moveBullet(); // will move bullet if its isShooting attribute is truthy


   renderer.render(scene, camera) // Render scene
   requestAnimationFrame(render);
}