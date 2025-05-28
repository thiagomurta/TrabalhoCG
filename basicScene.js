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
const BALL_SIZE = { radius: 1, widthSegments: 20, heightSegments: 20 };
const BALL_SPEED = 1.0;
const GROUND_SIZE = { width: 20, height: 20 };

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
  gunMaterial.depthTest = false;
  gunMaterial.renderOrder = 5;
  
  const gun = new THREE.Mesh(cylinderGeometry, gunMaterial);
  gun.position.set(0.0, -30.0, -70);
  //gun.rotateZ(THREE.MathUtils.degToRad(0));
  gun.rotateX(THREE.MathUtils.degToRad(-90));

  const crosshair = document.createElement('div');
  crosshair.className = 'crosshair';
  document.body.appendChild(crosshair);

  scene.add(camera);
  camera.add(gun);

  const testBox = GB.genBox(4.0, 6.0, 1.0, 2.0, 4.0, material);
  testBox.translateY(testBox.height / 2);
  scene.add(testBox);

  window.addEventListener('resize', () => onWindowResize(camera, renderer), false);
}

/*
function shoot() {
  const sphereGeometry = new THREE.SphereGeometry(
    BALL_SIZE.radius,
    BALL_SIZE.widthSegments,
    BALL_SIZE.heightSegments
  );
  const ballMaterial = setDefaultMaterial(BALL_COLOR);
  const sphere = new THREE.Mesh(sphereGeometry, ballMaterial);

  // ** SPAWN POSITION FROM CAMERA
  const spawnPosition = new THREE.Vector3();
  camera.getWorldPosition(spawnPosition);
  sphere.position.copy(spawnPosition);
  console.log("POS sphere {" + sphere.position.x.toFixed(1) + ", " + sphere.position.y.toFixed(1) + ", " + sphere.position.z.toFixed(1) + "} ")

  // ** SPAWN POSITION FROM MUZZLE
  const muzzlePosition = new THREE.Vector3();
  const gun = camera.children[0];
  gun.localToWorld(muzzlePosition);
  sphere.position.copy(muzzlePosition);


  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  console.log("POS direction {" + direction.x.toFixed(1) + ", " + direction.y.toFixed(1) + ", " + direction.z.toFixed(1) + "} ")
  sphere.userData.velocity = direction.multiplyScalar(BALL_SPEED);

  scene.add(sphere);
  console.log("POS sphere {" + sphere.position.x.toFixed(1) + ", " + sphere.position.y.toFixed(1) + ", " + sphere.position.z.toFixed(1) + "} ")
  ballArray.push(sphere);
} */

  function shoot() {
    const sphereGeometry = new THREE.SphereGeometry(
      BALL_SIZE.radius,
      BALL_SIZE.widthSegments,
      BALL_SIZE.heightSegments
    );
    const ballMaterial = setDefaultMaterial(BALL_COLOR);
    const sphere = new THREE.Mesh(sphereGeometry, ballMaterial);
  
    // 1. Get camera's world position (original spawn)
    const spawnPosition = new THREE.Vector3();
    camera.getWorldPosition(spawnPosition);
  
    // 2. Move spawn down (relative to camera orientation)
    const downwardOffset = new THREE.Vector3(0, -1.5, -12); // Adjust Y to move down
    downwardOffset.applyQuaternion(camera.quaternion); // Align with camera rotation
    spawnPosition.add(downwardOffset); // Apply offset in world space
  
    // 3. Set sphere position
    sphere.position.copy(spawnPosition);
  
    // 4. Get camera's forward direction for velocity
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    sphere.userData.velocity = direction.multiplyScalar(BALL_SPEED);
  
    scene.add(sphere);
    console.log("POS sphere (adjusted)", sphere.position);
    ballArray.push(sphere);
  }
function updateBalls() {
  for (let i = ballArray.length - 1; i >= 0; i--) {
    const sphere = ballArray[i];
    sphere.position.add(sphere.userData.velocity);
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