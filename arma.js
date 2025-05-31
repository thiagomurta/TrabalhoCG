import * as THREE from 'three';
import {setDefaultMaterial} from "../libs/util/util.js";
// --------------------- ARMA ---------------------
// MACROS 
const GUN_COLOR = 'rgb(100,255,100)';
const BALL_COLOR = 'rgb(100, 193, 255)';
const GUN_SIZE = { radius: 0.1, height: 2, segments: 32};
const BALL_SIZE = { radius: 0.05, widthSegments: 20, heightSegments: 20 };
const BALL_SPEED = 0.5;
const GUN_MUZZLE_POSITION = {x: 0.0, y: -0.35, z: -1.3};

let ballArray = [];
let currentBulletIndex = 0;

// ADICIONA A BALA PRESA NA ARMA NA CENA E HABILITA SUA MOVIMENTAÇÃO
// DEPOIS INICIALIZA A PRÓXIMA BALA PARA SER ATIRADA
export function shootBall(scene, camera) {

  scene.attach(ballArray[currentBulletIndex].ball); // Attach the current bullet to the scene
  ballArray[currentBulletIndex].isShooting = true; // make it able to move

  console.log("Bullet attached to scene:", currentBulletIndex);

  //Adding another ball to be shot the next toggle
  initBullet(camera);
  currentBulletIndex++;
}

// PARA CADA BALA NA CENA, TRANSLADA O Z SE MOVIMENTAÇÃO HABILITADA
export function moveBullet() {
  for (let i = 0; i < ballArray.length; i++) {
    const ball = ballArray[i].ball; 
    if (ballArray[i].isShooting) ball.translateZ(-BALL_SPEED);
  }

}

// CRIA GEOMETRIA DA BALA, ADICIONA NA POSIÇÃO NA FRENTE DA ARMA
// ADICIONA NO ARRAY UM OBJETO COM A BALA E UM BOOLEAN PARA SUA MOVIMENTAÇÃO E ADICIONA A BALA NA CAMERA PARA PODER POSICIONA-LA RELATIVA A CAMERA PRIMEIRO
function initBullet(camera) {
  const sphereGeometry = new THREE.SphereGeometry(
    BALL_SIZE.radius,
    BALL_SIZE.widthSegments,
    BALL_SIZE.heightSegments
  )

  const ballMaterial = setDefaultMaterial(BALL_COLOR);

  const ball = new THREE.Mesh(sphereGeometry, ballMaterial);
  ball.position.set(GUN_MUZZLE_POSITION.x, GUN_MUZZLE_POSITION.y, GUN_MUZZLE_POSITION.z);
  ballArray.push({ball: ball, isShooting: false});
  console.log("Bullet initialized at position:", ball.position);
  camera.add(ball);

}

// CRIA O CILINDRO (ARMA), ADICIONA A CAMERA NA CENA E A ARMA NA CAMERA
// E INICIALIZA A PRIMEIRA BALA
export function initGun(scene, camera) {
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
  initBullet(camera);
}
