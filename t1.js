import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {PointerLockControls} from './point.js';
import {initRenderer,
        initDefaultBasicLight,
        setDefaultMaterial, 
        onWindowResize,
        createGroundPlaneXZ                } from "../libs/util/util.js";
import * as S0 from "./scene0.js";
import * as PL from "./player.js";
// ---------------------Configuração inicial---------------------
let scene, renderer, material;
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // View function in util/utils
initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
var stats = new Stats();
material = setDefaultMaterial(); // create a basic material

// ---------------------Câmera---------------------
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-0.0, 0.5, 0.0);
camera.lookAt(new THREE.Vector3(0.0, 0.5, -1.0));



initDefaultBasicLight(scene); // Create a basic light to illuminate the scene

//const controls = new PointerLockControls(camera, renderer.domElement);
// controls.isLocked = true;



let plane = createGroundPlaneXZ(500, 500);
 scene.add(plane);
   // center.plane.translateY(+0.15);

let scenario=S0.Scene0();
scene.add(scenario); // Add the scenario to the scene
scenario.translateY(-0.15);

let player = PL.instancePlayer(camera,scenario,renderer);
scene.add(player);
player.translateY(1);

instructions.addEventListener('click', function () {

    player.controls.lock();

}, false);

player. controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
});

player.controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
});

window.addEventListener('keydown', (event) => movementControls(event.keyCode))
window.addEventListener('keyup', (event) => movementControls(event.keyCode))

function movementControls(key) { // if xabu , go back here
    if (key === 87 || key === 38){
        player.moveFoward();
    }
    else if (key === 83 || key === 40){
        player.moveBack();
    }
    if (key === 65 || key === 37){
        player.moveLeft();
    }
    else if (key === 68 || key === 39){
        player.moveRight();
    }
    player.position.lerp(player.lerp.destination, player.lerp.alpha);
    //console.log(player.lerp.move);
}

// function moveAnimate(delta) {
//     raycaster.ray.origin.copy(controls.getObject().position);

//     if (moveForward) {
//         controls.moveForward(velocidade * delta);
//     }
//     else if (moveBackward) {
//         controls.moveForward(velocidade * -1 * delta);
//     }
    
//     if (moveRight) {
//         controls.moveRight(velocidade * delta);
//     }
//     else if (moveLeft) {
//         controls.moveRight(velocidade * -1 * delta);
//     }
// }

// Listen window size changes

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

 

const clock = new THREE.Clock();

render();

// function updateCamera(){
//    // DICA: Atualize a câmera aqui!

//    message.changeMessage("Pos: {" + camPos.x + ", " + camPos.y + ", " + camPos.z + "} " + 
//                          "/ LookAt: {" + camLook.x + ", " + camLook.y + ", " + camLook.z + "}");
// }

// function keyboardUpdate() {

// //    keyboard.update();
   
//    // DICA: Insira aqui seu código para mover a câmera
//    // let angle = THREE.MathUtils.degToRad(1);
//    // if ( keyboard.pressed("W") )     cameraHolder.translateZ( -0.1 );
//    // if ( keyboard.pressed("S") )     cameraHolder.translateZ( 0.1 );
//    // if ( keyboard.pressed("A") )     cameraHolder.translateX( -0.1 );
//    // if ( keyboard.pressed("D") )     cameraHolder.translateX(  0.1 );
//    // if ( keyboard.pressed("left") )  cameraHolder.rotateY( angle );
//    // if ( keyboard.pressed("right") ) cameraHolder.rotateY( -angle );
//    // if ( keyboard.pressed("up") )    cameraHolder.rotateX( angle );
//    // if ( keyboard.pressed("down") )  cameraHolder.rotateX( -angle );
//    // if ( keyboard.pressed("Q") )     cameraHolder.rotateZ( angle );
//    // if ( keyboard.pressed("E") )     cameraHolder.rotateZ( -angle );
   
//    updateCamera();
// }

function render() {
   stats.update();

//    if(controls.isLocked){
//       moveAnimate(clock.getDelta());
//    }

//    keyboardUpdate();
   renderer.render(scene, camera) // Render scene
   requestAnimationFrame(render);
}