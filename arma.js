import * as THREE from 'three';
import {setDefaultMaterial} from "../libs/util/util.js";
// --------------------- ARMA ---------------------


// MACROS 
const GUN_COLOR = 'rgb(100,255,100)';
const BALL_COLOR = 'rgb(100, 193, 255)';
const GUN_SIZE = { radius: 0.1, height: 2, segments: 32};
const BALL_SIZE = { radius: 0.1, widthSegments: 20, heightSegments: 20 };
const BALL_SPEED = 0.5;
const GROUND_SIZE = { width: 20, height: 20 };

let shootBall = false;
const ballArray = [];

export function isShootBall() {
  return shootBall;
}

export function toggleShootBall() {
  /*if (ballArray.length > 0) {
    console.log("Bullet already exists, toggling shooting state.");
    scene.remove(ballArray[0]); 
  }*/
  shootBall = !shootBall;
  console.log("Shooting state toggled:", shootBall);
  /*if (shootBall && ballArray.length === 0) {
    console.log("No bullets available, initializing bullet.");
    initBullet();
  }*/
}

export function moveBullet() {
  //if (shootBall && ballArray.length > 0) {
    const ball = ballArray[0];
    ball.translateZ(-BALL_SPEED);
    console.log("Bullet moved to position:", ball.position);
  //}
}

function initBullet(scene, gun) {
  const sphereGeometry = new THREE.SphereGeometry(
    BALL_SIZE.radius,
    BALL_SIZE.widthSegments,
    BALL_SIZE.heightSegments
  )

  const ballMaterial = setDefaultMaterial(BALL_COLOR);

  const ball = new THREE.Mesh(sphereGeometry, ballMaterial);
  ball.position.set(0.0, -0.3, -1.3);
  ballArray.push(ball);
  console.log("Bullet initialized at position:", ball.position);
  scene.add(ball);
  gun.attach(ball); 
  console.log("Bullet added to gun:", ball.position);
}

export function initGun(scene, camera) {
  
    console.log("initGun() called"); 
    const cylinderGeometry = new THREE.CylinderGeometry(
        GUN_SIZE.radius,
        GUN_SIZE.radius,
        GUN_SIZE.height,
        GUN_SIZE.segments
      );
      const gunMaterial = setDefaultMaterial(GUN_COLOR);
      const gun = new THREE.Mesh(cylinderGeometry, gunMaterial);
      gun.position.set(0.0, -0.3, -0.0);
      gun.rotateX(THREE.MathUtils.degToRad(-90));
      scene.add(camera);
      camera.add(gun);
      console.log("Gun added to scene:", gun.position);

      initBullet(camera, gun);

}
