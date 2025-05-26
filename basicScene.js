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

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);


var cylinderGeometry = new THREE.CylinderGeometry(15, 15, 75, 25);
var cylinderMaterial = setDefaultMaterial('rgb(100,255,100)');            
var cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
cylinderMaterial.depthTest = false;
cylinderMaterial.renderOrder = 2;
cylinder.position.set(0.0, -30.0, -70);
cylinder.rotateZ(THREE.MathUtils.degToRad(60));
cylinder.rotateX(THREE.MathUtils.degToRad(-90));
scene.add(camera);
camera.add(cylinder);

const crosshair = document.createElement('div');
crosshair.className = 'crosshair';
document.body.appendChild(crosshair);

/*
let crosshairGeometry = new THREE.BoxGeometry(0.25, 2, 1);
let crosshairMaterial = setDefaultMaterial(); //basic material doesnt have shading i think so it works here

//crosshairMaterial.color = Color(100,255,100);

//{color:'rgb(100,255,100)'}


let crosshairHorizontal = new THREE.Mesh(crosshairGeometry, crosshairMaterial);
crosshairMaterial.depthTest = false;
crosshairMaterial.renderOrder = 2;
crosshairHorizontal.position.set(0.0, 0.0, -100);
camera.add(crosshairHorizontal)

let crosshairVertical = new THREE.Mesh(crosshairGeometry, crosshairMaterial);
crosshairVertical.position.set(0.0, 0.0, -100);
crosshairHorizontal.rotateZ(THREE.MathUtils.degToRad(90));
camera.add(crosshairVertical); */


let test_box=GB.genBox(4.0,6.0,1.0,2.0,4.0,material);
test_box.translateY(test_box.height/2);
scene.add(test_box);


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
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}