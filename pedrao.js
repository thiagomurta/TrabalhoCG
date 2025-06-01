import * as THREE from 'three';
import GUI from '../libs/util/dat.gui.module.js'
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
  initDefaultSpotlight,
  initCamera,
  createGroundPlane,
  onWindowResize} from "../libs/util/util.js";
import KeyboardState from '../libs/util/KeyboardState.js';

let scene    = new THREE.Scene();    // Create main scene
let renderer = initRenderer();    // View function in util/utils
initDefaultSpotlight(scene, new THREE.Vector3(7.0, 7.0, 7.0), 300); 
// let camera   = initCamera(new THREE.Vector3(3.6, 4.6, 8.2)); // Init camera in this position

// ---------------------Câmera---------------------
let camPos  = new THREE.Vector3(0.0, 0.5, 0.0);
// let camUp   = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0.0, 0.5, -1.0);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(camPos);
camera.lookAt(camLook);


// const renderer = new THREE.WebGLRenderer({ antialias: true });
// ---------------------Mouse---------------------
//renderer.domElement.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousemove', onMouseMove, false);
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
let material = new THREE.MeshPhongMaterial({color:"red", shininess:"200"});
let obj = new THREE.Mesh(geometry, material);
  obj.castShadow = true;
  obj.position.set(0, 0.2, 0);
  obj.add(camera);
scene.add(obj);

// Variables that will be used for linear interpolation
const lerpConfig = {
  destination: new THREE.Vector3(0.0, 0.2, 0.0),
  alpha: 0.7,
  move: true
}
var keyboard = new KeyboardState();

render();

lerpConfig.move=true;
function render(){
  let velocidadeRotacao = 1;
  let olharX = mouseY * velocidadeRotacao;
  let olharY = mouseX * velocidadeRotacao;
  obj.rotation.x = olharX;
  obj.rotation.y = olharY;
  // camLook = 
  // stats.update();
  trackballControls.update();
  keyboardUpdate();
  if(lerpConfig.move) {camera.position.lerp(lerpConfig.destination, lerpConfig.alpha)};
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}

function onMouseMove(event){
  mouseX = (event.clientX - windowHalfX) / window.innerWidth;
  mouseY = (event.clientY - windowHalfY) / window.innerHeight;
}

function keyboardUpdate() {
  keyboard.update();
  let angle = THREE.MathUtils.degToRad(1);
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