import * as THREE from 'three';
import GUI from '../libs/util/dat.gui.module.js'
import Stats from '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initDefaultSpotlight,
        setDefaultMaterial,
        initCamera,
        createGroundPlane,
        createGroundPlaneXZ,
        onWindowResize} from "../libs/util/util.js";
import KeyboardState from '../libs/util/KeyboardState.js';

let scene, renderer, material; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
material = setDefaultMaterial(); // create a basic material
initDefaultSpotlight(scene, new THREE.Vector3(7.0, 7.0, 7.0), 300);
var stats = new Stats();

// ---------------------Câmera---------------------
let camPos  = new THREE.Vector3(0.0, 0.5, 0.0);
// let camUp   = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0.0, 0.5, -1.0);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(camPos);
camera.lookAt(camLook);

let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// let trackballControls = new TrackballControls(camera, renderer.domElement );

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
// let material = new THREE.MeshPhongMaterial({color:"red", shininess:"200"});
let obj = new THREE.Mesh(geometry, material);
  obj.castShadow = true;
  camera.position.copy(0, 0.2, 0);
scene.add(obj);

// Variables that will be used for linear interpolation
const lerpConfig = {
  destination: new THREE.Vector3(0.0, 0.2, 0.0),
  alpha: 1,
  move: true
}
var keyboard = new KeyboardState();

render();

lerpConfig.move=true;
function render(){
    stats.update();
    // trackballControls.update();
    keyboardUpdate();
    if(lerpConfig.move) {obj.position.lerp(lerpConfig.destination, lerpConfig.alpha)};
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}

function keyboardUpdate() {
   keyboard.update();
   if ( keyboard.pressed("left") ) {
    lerpConfig.destination.z+=0.01;
   }
   else if ( keyboard.pressed("A") ) {
    lerpConfig.destination.z+=0.01;
   }
   else if ( keyboard.pressed("right") ) {
    lerpConfig.destination.z-=0.01;
   }
   else if ( keyboard.pressed("D") ) {
    lerpConfig.destination.z-=0.01;
   }
   else if ( keyboard.pressed("up") ) {
        lerpConfig.destination.x+=0.01;
   }
   else if ( keyboard.pressed("W") ) {
    lerpConfig.destination.x+=0.01;
   }
   else if ( keyboard.pressed("down") ) {
    lerpConfig.destination.x-=0.01;
   }
   else if ( keyboard.pressed("S") ) {
    lerpConfig.destination.x-=0.01;
   }
}