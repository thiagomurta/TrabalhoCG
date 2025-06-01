import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {PointerLockControls} from '../build/jsm/controls/PointerLockControls.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        SecondaryBox,
        onWindowResize,
        createGroundPlane,
        createGroundPlaneXZ} from "../libs/util/util.js";
import KeyboardState from '../libs/util/KeyboardState.js';
import { Euler,
    EventDispatcher,
    Vector3 } from 'three';

const _euler = new Euler( 0, 0, 0, 'YXZ' );
let isLocked = false;

let scene, renderer; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
let material = setDefaultMaterial(); // create a basic material
var stats = new Stats();

// ---------------------Câmera---------------------
let camPos  = new THREE.Vector3(0.0, 0.5, 0.0);
// let camUp   = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0.0, 0.5, -1.0);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(camPos);
camera.lookAt(camLook);

// ---------------------Controle de Câmera---------------------
const controls = new PointerLockControls(camera, renderer.domElement);
console.log();
initDefaultBasicLight(scene); // Create a basic light to illuminate the scene


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


//window.addEventListener('mousemove', onMouseMove, false);
let mouseX = 0;
let mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;


let trackballControls = new TrackballControls(camera, renderer.domElement );

// Show axes 
let axesHelper = new THREE.AxesHelper( 5 );
  axesHelper.translateY(0.1);
  scene.add( axesHelper );


// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

let groundPlane = createGroundPlane(10, 10, 40, 40); // width, height, resolutionW, resolutionH
  groundPlane.rotateX(THREE.MathUtils.degToRad(-90));
scene.add(groundPlane);

// Create sphere
let geometry = new THREE.SphereGeometry( 0.2, 32, 16 );
let material2 = new THREE.MeshPhongMaterial({color:"red", shininess:"200"});
let obj = new THREE.Mesh(geometry, material2);
  obj.castShadow = true;
  obj.position.set(0, 0.2, 0);
  obj.add(camera);
scene.add(obj);

// Variables that will be used for linear interpolation
const lerpConfig = {
  destination: new THREE.Vector3(0.0, 0.2, 0.0),
  alpha: 1,
  move: true
}
var keyboard = new KeyboardState();

render();
domElement.ownerDocument.addEventListener( 'mousemove', this._onMouseMove );

// lerpConfig.move=true;
function render(){
  onMouseMove.bind(onMouseMove);
//   let velocidadeRotacao = 1;
//   let olharX = mouseY * velocidadeRotacao;
//   let olharY = mouseX * velocidadeRotacao;
  // obj.rotation.x = mouseY * velocidadeRotacao;
  // obj.rotation.y = mouseX * velocidadeRotacao;
//   camLook = (olharX, , olharY);
  stats.update();
  trackballControls.update();
  keyboardUpdate();
  if(lerpConfig.move) {camera.position.lerp(lerpConfig.destination, lerpConfig.alpha)};
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}

function onMouseMove(event){


    if ( isLocked === false ) return;

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    const camera = this.camera;
    _euler.setFromQuaternion( camera.quaternion );

    _euler.y -= movementX * 0.002 * 1;
    _euler.x -= movementY * 0.002 * 1;

    _euler.x = Math.max( _PI_2 - controls.maxPolarAngle, Math.min( _PI_2 - 0, _euler.x ) );

    camera.quaternion.setFromEuler( _euler );

    dispatchEvent( _changeEvent );
  // mouseX = (event.clientX - windowHalfX) / window.innerWidth;
  // mouseY = (event.clientY - windowHalfY) / window.innerHeight;
}

function keyboardUpdate() {
  keyboard.update();
  let direita = keyboard.pressed("D") || keyboard.pressed("right");
  let esquerda = keyboard.pressed("A") || keyboard.pressed("left");
  let frente = keyboard.pressed("W") || keyboard.pressed("up");
  let atras = keyboard.pressed("S") || keyboard.pressed("down");
  
  if ( esquerda ) {
    lerpConfig.destination.z+=0.1;
  }
  else if ( direita ) {
    lerpConfig.destination.z-=0.1;
  }
  if ( frente ) {
    lerpConfig.destination.x+=0.1;
  }
  else if ( atras ) {
    lerpConfig.destination.x-=0.1;
  }
}