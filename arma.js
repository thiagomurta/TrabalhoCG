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

const BALL_BOX_SIZE = 0.1;

let ballArray = [];
let currentBulletIndex = 0;
let lastShotTime = 0;
const SHOOT_COOLDOWN = 0.5; // (seconds)

// RASTREAR A CADÊNCIA DE TIROS PARA ATIRAR
export function initShootBall(scene, camera) {
  
  const currentTime = performance.now() / 1000; // Get current time in seconds
  if (currentTime - lastShotTime >= SHOOT_COOLDOWN) {
      shootBall(scene, camera);
      lastShotTime = currentTime; // Update the last shot time
  }
}

// ADICIONA A BALA PRESA NA ARMA NA CENA E HABILITA SUA MOVIMENTAÇÃO
// CRIA SUA BOUNDING BOX
// CONSERTA O OFFSET DE Y POR UM RAYCASTER
// DEPOIS INICIALIZA A PRÓXIMA BALA PARA SER ATIRADA
export function shootBall(scene, camera) {

  const bulletObj = ballArray[currentBulletIndex];
  scene.attach(bulletObj.ball); // Attach the current bullet to the scene
  bulletObj.isShooting = true; // make it able to move

  // the following lines fix the y offset and make the bullet move towards the crosshair

  const muzzleWorld = new THREE.Vector3();
  bulletObj.ball.getWorldPosition(muzzleWorld);

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(), camera); // (0,0) = screen center
  const intersects = raycaster.intersectObjects(scene.children, true);

  const crosshairPoint = intersects[0]?.point || 
    raycaster.ray.direction.multiplyScalar(1000).add(camera.position);
  
  bulletObj.velocity.copy(crosshairPoint).sub(muzzleWorld).normalize()
    .multiplyScalar(BALL_SPEED);

  bulletObj.boundingBox = new THREE.Box3().setFromObject(bulletObj.ball); // create a bounding box

  initBullet(camera);   //Adding another ball to be shot the next toggle
  currentBulletIndex++;
}

// PARA CADA BALA NA CENA, TRANSLADA O Z SE MOVIMENTAÇÃO HABILITADA
export function moveBullet() {
  for (let i = 0; i < ballArray.length; i++) {
    const bullet = ballArray[i];
    const ball = bullet.ball; 
    if (bullet.isShooting) {

      bullet.ball.position.add(bullet.velocity);
      if (bullet.boundingBox) {
        
        const worldPosition = new THREE.Vector3();
        bullet.ball.getWorldPosition(worldPosition);
        
        
        bullet.boundingBox.setFromCenterAndSize(
          worldPosition,
          new THREE.Vector3(BALL_BOX_SIZE, BALL_BOX_SIZE, BALL_BOX_SIZE)
        );
      }

    }
  }

}

// CRIA GEOMETRIA DA BALA, ESCONDE NA FRENTE DA ARMA
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

  ballArray.push({
    ball: ball, 
    isShooting: false,
    boundingBox: null,
    velocity: new THREE.Vector3()
  }); //set when shot

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

  const GUN_Y_OFFSET = -0.3;
  const GUN_AIMS_FORWARD = THREE.MathUtils.degToRad(-90);

  gun.position.set(0.0, GUN_Y_OFFSET, 0.0);
  gun.rotateX(GUN_AIMS_FORWARD);

  camera.add(gun);
  initBullet(camera);
}
