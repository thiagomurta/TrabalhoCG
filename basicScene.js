import * as THREE from  'three';
import * as GB from './generic_box.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";
import KeyboardState from '../libs/util/KeyboardState.js';

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.
var keyboard = new KeyboardState(); // use the keyboard
let shootBall = false;

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);


var cylinderGeometry = new THREE.CylinderGeometry(15, 15, 75, 25);
var gunMaterial = setDefaultMaterial('rgb(100,255,100)');            
var cylinder = new THREE.Mesh( cylinderGeometry, gunMaterial );
gunMaterial.depthTest = false;
gunMaterial.renderOrder = 2;
console.log("Gun Material ID:", gunMaterial.id);
cylinder.position.set(0.0, -30.0, -70);
cylinder.rotateZ(THREE.MathUtils.degToRad(60));
cylinder.rotateX(THREE.MathUtils.degToRad(-90));



const crosshair = document.createElement('div');
crosshair.className = 'crosshair';
document.body.appendChild(crosshair);

scene.add(camera);
camera.add(cylinder);

let test_box=GB.genBox(4.0,6.0,1.0,2.0,4.0,material);
test_box.translateY(test_box.height/2);
scene.add(test_box);

let ballArrays = [];


// Use this to show information onscreen
//let controls = new InfoBox();
//  controls.add("Basic Scene");
//  controls.addParagraph();
//  controls.add("Use mouse to interact:");
//  controls.add("* Left button to rotate");
//  controls.add("* Right button to translate (pan)");
//  controls.add("* Scroll to zoom in/out.");
//  controls.show();
//
render();
function render()
{

  if (shootBall) {
    shoot();
  }

  for (var sphere of ballArrays){
    moveSphere(sphere);
  }

  keyboardUpdate();

  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}



function shoot(){
  console.log("created a ball")
  var sphGeo = new THREE.SphereGeometry(1, 20, 20);
  var ballMaterial = setDefaultMaterial('rgb(100,255,100)');      
  var sphere = new THREE.Mesh(sphGeo, ballMaterial);

  console.log("Ball Material ID:", ballMaterial.id);
  console.log("Ball Material depthTest:", ballMaterial.depthTest);
  console.log("Ball Material depthWrite:", ballMaterial.depthWrite);
  console.log("Ball Material transparent:", ballMaterial.transparent);
  console.log("Ball Material renderOrder:", ballMaterial.renderOrder);
  
  const spawnPosition = new THREE.Vector3();
  cylinder.getWorldPosition(spawnPosition); 
  //const offset = new THREE.Vector3(0, 0, -cylinder.geometry.parameters.height / 2); // Local offset to the tip
  //offset.applyQuaternion(cylinder.getWorldQuaternion(new THREE.Quaternion())); // Rotate offset to world space
  //spawnPosition.add(offset); // Add world-space offset

  sphere.position.copy(spawnPosition);


  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  sphere.userData.velocity = direction.multiplyScalar(3.0);

  scene.add(sphere);
  ballArrays.push(sphere);
  shootBall = false;
}

function moveSphere(sphere) {
  sphere.position.add(sphere.userData.velocity);

  /*
  if (sphere.position.length() > 100) {
    scene.remove(sphere);
    ballArrays.splice(ballArrays.indexOf(sphere), 1);
  }*/
}

function keyboardUpdate() 
{
   keyboard.update();

   if ( keyboard.down("space") ) 
   {
      shootBall = true;
   }
}