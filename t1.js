import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {initRenderer,
        initDefaultBasicLight,
        setDefaultMaterial, 
        onWindowResize,
        createGroundPlaneXZ                } from "../libs/util/util.js";
import * as S0 from "./scene0.js";
import * as PL from "./player.js";
import {initGun, moveBullet, initShootBall} from "./arma.js";

// ---------------------Configuração inicial---------------------
let scene, renderer, material;
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // View function in util/utils
initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
var stats = new Stats();
material = setDefaultMaterial(); // create a basic material

// ---------------------Câmera---------------------
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0.0, 0.5, 0.0);
camera.lookAt(new THREE.Vector3(0.0, 0.5, -1.0));

initDefaultBasicLight(scene); // Create a basic light to illuminate the scene

const crosshair = document.querySelector('.crosshair');

// ---------------------Ambiente---------------------

let plane = createGroundPlaneXZ(500, 500);
 scene.add(plane);
   // center.plane.translateY(+0.15);

let scenario=S0.Scene0();
scene.add(scenario); // Add the scenario to the scene
scenario.translateY(-0.15);

initGun(scene, camera);
let player = PL.instancePlayer(camera,scenario,renderer);
scene.add(player);
player.translateY(1);

// ---------------------Controles do mouse---------------------
instructions.addEventListener('click', function () {

    player.controls.lock();

}, false);
  
player. controls.addEventListener('lock', function () {
    crosshair.style.display = 'block'
    instructions.style.display = 'none';
    blocker.style.display = 'none';
});

player.controls.addEventListener('unlock', function () {
    crosshair.style.display = 'none';
    blocker.style.display = 'block';
    instructions.style.display = '';
});

// ---------------------Controles de teclado---------------------

window.addEventListener('keydown', (event) => movementControls(event.keyCode))
window.addEventListener('keyup', (event) => movementControls(event.keyCode))

const KEY_S = 83;
const KEY_W = 87;
const KEY_A = 65;
const KEY_D = 68;
const KEY_ARROW_LEFT = 37;
const KEY_ARROW_UP = 38;
const KEY_ARROW_RIGHT = 39;
const KEY_ARROW_DOWN = 40;
const KEY_SPACE = 32;

function movementControls(key) { // if xabu , go back here
    if (key === KEY_SPACE) {
        initShootBall(scene, camera);
    }
    if (key === KEY_W || key === KEY_ARROW_UP){
        player.moveFoward();
    }
    else if (key === KEY_S || key === KEY_ARROW_DOWN){
        player.moveBack();
    }
    else if (key === KEY_A || key === KEY_ARROW_LEFT){
        player.moveLeft();
    }
    else if (key === KEY_D || key === KEY_ARROW_RIGHT){
        player.moveRight();
    }
    player.position.lerp(player.lerp.destination, player.lerp.alpha);
}

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );


render();

function render() {
   stats.update();

   moveBullet(); // will move bullet if its isShooting attribute is truthy


   renderer.render(scene, camera) // Render scene
   requestAnimationFrame(render);
}