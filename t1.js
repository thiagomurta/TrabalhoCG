import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {initRenderer,
        initDefaultBasicLight, 
        onWindowResize} from "../libs/util/util.js";

// ---------------------Configuração inicial---------------------
let scene, renderer, material;
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // View function in util/utils
initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
var stats = new Stats();
material = setDefaultMaterial(); // create a basic material

// ---------------------Câmera---------------------
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
scene.add(camera);
camera.position.set(0.0, 0.5, 0.0);
camera.lookAt(new THREE.Vector3(0.0, 0.5, -1.0));


const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0, 2);
initDefaultBasicLight(scene); // Create a basic light to illuminate the scene

const controls = new PointerLockControls(camera, renderer.domElement);
controls.isLocked = true;

const crosshair = document.getElementsByClassName("crosshair")[0];


// ---------------------Controles do mouse---------------------
instructions.addEventListener('click', function () {

    controls.lock();

}, false);

controls.addEventListener('lock', function () {
    crosshair.style.display = 'auto'
    instructions.style.display = 'none';
    blocker.style.display = 'none';
});

controls.addEventListener('unlock', function () {
    crosshair.style.display = 'auto';
    blocker.style.display = 'block';
    instructions.style.display = '';
});


scene.add(controls.getObject());

// ---------------------Controles da movimentação---------------------
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

function movementControls(key, value) {
    if (key === KEY_W || key === KEY_ARROW_UP){
        moveForward = value;
    }
    else if (key === KEY_S || key === KEY_ARROW_DOWN){
        moveBackward = value;
    }
    else if (key === KEY_A || key === KEY_ARROW_LEFT){
        moveLeft = value;
    }
    else if (key === KEY_D || key === KEY_ARROW_RIGHT){
        moveRight = value;
    }
}

function moveAnimate(delta) {
    raycaster.ray.origin.copy(controls.getObject().position);

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
}

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

const clock = new THREE.Clock();


initGun();
render();

function updateCamera(){
   // DICA: Atualize a câmera aqui!

   message.changeMessage("Pos: {" + camPos.x + ", " + camPos.y + ", " + camPos.z + "} " + 
                         "/ LookAt: {" + camLook.x + ", " + camLook.y + ", " + camLook.z + "}");
}

function keyboardUpdate() {

   keyboard.update();
   
   // DICA: Insira aqui seu código para mover a câmera
   // let angle = THREE.MathUtils.degToRad(1);
   // if ( keyboard.pressed("W") )     cameraHolder.translateZ( -0.1 );
   // if ( keyboard.pressed("S") )     cameraHolder.translateZ( 0.1 );
   // if ( keyboard.pressed("A") )     cameraHolder.translateX( -0.1 );
   // if ( keyboard.pressed("D") )     cameraHolder.translateX(  0.1 );
   // if ( keyboard.pressed("left") )  cameraHolder.rotateY( angle );
   // if ( keyboard.pressed("right") ) cameraHolder.rotateY( -angle );
   // if ( keyboard.pressed("up") )    cameraHolder.rotateX( angle );
   // if ( keyboard.pressed("down") )  cameraHolder.rotateX( -angle );
   // if ( keyboard.pressed("Q") )     cameraHolder.rotateZ( angle );
   // if ( keyboard.pressed("E") )     cameraHolder.rotateZ( -angle );
   
   updateCamera();
}

function render() {
   stats.update();

   if(controls.isLocked){
      moveAnimate(clock.getDelta());
   }

   keyboardUpdate();
   renderer.render(scene, camera) // Render scene
   requestAnimationFrame(render);
}