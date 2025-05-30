import * as THREE from 'three';
import * as GB from './generic_box.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {
  initRenderer, 
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  onWindowResize,
  createGroundPlaneXZ
} from "../libs/util/util.js";
import KeyboardState from '../libs/util/KeyboardState.js';

// macros 
const GUN_COLOR = 'rgb(100,255,100)';
const BALL_COLOR = 'rgb(100,255,100)';
const GUN_SIZE = { radius: 15, height: 75, segments: 25 };
const BALL_SIZE = { radius: 20, widthSegments: 20, heightSegments: 20 };
const BALL_SPEED = 0.5;
const GROUND_SIZE = { width: 20, height: 20 };

//constants to help w testing the ball attaching to the gun and then detaching
const sphereGeometry = new THREE.SphereGeometry(
  BALL_SIZE.radius,
  BALL_SIZE.widthSegments,
  BALL_SIZE.heightSegments
);
const ballMaterial = setDefaultMaterial(BALL_COLOR);

const scene = new THREE.Scene();
const renderer = initRenderer();
const camera = initCamera(new THREE.Vector3(0, 15, 30));
const material = setDefaultMaterial();
const light = initDefaultBasicLight(scene);
const orbit = new OrbitControls(camera, renderer.domElement);
const keyboard = new KeyboardState();

let shootBall = false;
const ballArray = [];

function initScene() {
  const axesHelper = new THREE.AxesHelper(12);
  scene.add(axesHelper);

  const plane = createGroundPlaneXZ(GROUND_SIZE.width, GROUND_SIZE.height);
  scene.add(plane);

  const cylinderGeometry = new THREE.CylinderGeometry(
    GUN_SIZE.radius,
    GUN_SIZE.radius,
    GUN_SIZE.height,
    GUN_SIZE.segments
  );

  const gunMaterial = setDefaultMaterial(GUN_COLOR);
  //gunMaterial.depthTest = false;
  //gunMaterial.renderOrder = 5;

  
  
  const gun = new THREE.Mesh(cylinderGeometry, gunMaterial);
  /*
  gun.position.set(0.0, -30.0, -70);
  gun.rotateX(THREE.MathUtils.degToRad(-90));*/

  //gun.position.set(0.0, -30.0, -50);
  //gun.rotateX(THREE.MathUtils.degToRad(-85))

  gun.position.set(0.0, 0.0, -5.0);

  const crosshair = document.createElement('div');
  crosshair.className = 'crosshair';
  document.body.appendChild(crosshair);

  scene.add(camera);
  camera.add(gun);

  //ballMaterial.depthTest = false;
  //ballMaterial.renderOrder = 7;
  const testSphere = new THREE.Mesh(sphereGeometry, gunMaterial);
  //

  camera.add(testSphere);
  //testSphere.position.set(0.0, -30.0, -60);
  testSphere.position.set(0.0, 0.0, -160);
  ballArray.push(testSphere);
  


  const testBox = GB.genBox(4.0, 6.0, 1.0, 2.0, 4.0, material);
  testBox.translateY(testBox.height / 2);
  scene.add(testBox);

  window.addEventListener('resize', () => onWindowResize(camera, renderer), false);
}

function shoot() {

  const sphere = new THREE.Mesh(sphereGeometry, ballMaterial);

  const spawnPosition = new THREE.Vector3();
  camera.getWorldPosition(spawnPosition);
  const forwardOffset = new THREE.Vector3(0, 0, -2); // um offset piquitito
  forwardOffset.applyQuaternion(camera.quaternion);
  spawnPosition.add(forwardOffset);
  sphere.position.copy(spawnPosition);

  // raycast para achar a mira
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera); // Center screen
  const intersects = raycaster.intersectObjects(scene.children);

  let target = new THREE.Vector3();
  camera.getWorldDirection(target);
  target.multiplyScalar(100).add(spawnPosition);

  if (intersects.length > 0) {
    const minDistance = 10; // Minimum distance to consider a valid hit
    if (intersects[0].distance > minDistance) {
      target = intersects[0].point;
    }
  }

  // direcao até o target
  const direction = target.clone().sub(sphere.position).normalize();
  sphere.userData.velocity = direction.multiplyScalar(BALL_SPEED);

  scene.add(sphere);
  ballArray.push(sphere);
}

function updateBalls() {
  for (let i = ballArray.length - 1; i >= 0; i--) {
    const sphere = ballArray[i];
    if (sphere.userData.velocity) sphere.position.add(sphere.userData.velocity);
    else {
      scene.attach(sphere);
      const spawnPosition = new THREE.Vector3();
      let target = new THREE.Vector3();
      camera.getWorldDirection(target);
      sphere.position.copy(spawnPosition)
      target.multiplyScalar(100).add(spawnPosition);
      const direction = target.clone().sub(sphere.position).normalize();
      sphere.userData.velocity = direction.multiplyScalar(BALL_SPEED);
    }
  }
}

function handleKeyboardInput() {
  keyboard.update();
  if (keyboard.down("space")) {
    shootBall = true;
  }
}

function render() {
  if (shootBall) {
    shoot();
    shootBall = false;
  }

  updateBalls();
  handleKeyboardInput();

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

initScene();
render();