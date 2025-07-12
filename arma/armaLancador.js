import * as THREE from 'three';
import { damageCacodemon, damageSkull } from '../inimigos/inimigos.js';
// --------------------- ARMA ---------------------
// MACROS 
const GUN_COLOR = 'rgb(100,255,100)';
const BALL_COLOR = 'rgb(100, 193, 255)';
const GUN_SIZE = { radius: 0.1, height: 2, segments: 32};
const BALL_SIZE = { radius: 0.05, widthSegments: 20, heightSegments: 20 };
const BALL_SPEED = 0.8;
const BULLET_ORIGIN_POS = {x: 0.0, y: -0.0, z: 0.0};
//{x: 0.0, y: -0.35, z: -1.3}; muzzle

const BALL_BOX_SIZE = 0.1;

let ballArray = [];
let currentBulletIndex = 0;
let lastShotTime = 0;
const SHOOT_COOLDOWN = 0.5; // (seconds)

// RASTREAR A CADÊNCIA DE TIROS PARA ATIRAR
export function initShootBall(scenario, scene, camera) {
  
  const currentTime = performance.now() / 1000; // Get current time in seconds
  if (currentTime - lastShotTime >= SHOOT_COOLDOWN) {
      shootBall(scenario, scene, camera);
      lastShotTime = currentTime; // Update the last shot time
  }
}

// ADICIONA A BALA PRESA NA ARMA NA CENA E HABILITA SUA MOVIMENTAÇÃO
// CRIA SUA BOUNDING BOX
// CONSERTA O OFFSET DE Y POR UM RAYCASTER
// DEPOIS INICIALIZA A PRÓXIMA BALA PARA SER ATIRADA
export function shootBall(scenario, scene, camera) {

  const bulletObj = ballArray[currentBulletIndex];
  scene.attach(bulletObj.ball); // Attach the current bullet to the scene
  bulletObj.isShooting = true; // make it able to move

  // the following lines fix the y offset and make the bullet move towards the crosshair

  const muzzleWorld = new THREE.Vector3();
  bulletObj.ball.getWorldPosition(muzzleWorld);

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(), camera); // (0,0) = screen center
  const LEFTMOST_BOX = scenario.objects[0];
  const UPPER_MIDDLE_BOX = scenario.objects[1];
  const RIGHTMOST_BOX = scenario.objects[2];
  const LOWER_MIDDLE_BOX = scenario.objects[3];
  const NORTH_WALL = scenario.objects[4];
  const SOUTH_WALL = scenario.objects[5];
  const LEFT_WALL = scenario.objects[6];
  const RIGHT_WALL = scenario.objects[7];
  const PLANE = scene.children[0];
  const intersects = raycaster.intersectObjects([PLANE,
    LEFTMOST_BOX, UPPER_MIDDLE_BOX, RIGHTMOST_BOX, LOWER_MIDDLE_BOX,
    NORTH_WALL, SOUTH_WALL, LEFT_WALL, RIGHT_WALL]); // true for recursive intersection

  const crosshairPoint = intersects[0]?.point || 
    raycaster.ray.direction.multiplyScalar(1000).add(camera.position);
  
    bulletObj.targetPoint = crosshairPoint; 
  
  bulletObj.velocity.copy(crosshairPoint).sub(muzzleWorld).normalize()
    .multiplyScalar(BALL_SPEED);

  bulletObj.boundingBox = new THREE.Box3().setFromObject(bulletObj.ball); // create a bounding box

  initBullet(camera);   //Adding another ball to be shot the next toggle
  currentBulletIndex++;
}

function removeBullet(scene, bullet, ball, ballArray, i, camera){
  bullet.isShooting = false; // Stop movement
  //remove bullet from the scene
  scene.remove(ball);
  ballArray.splice(i, 1);
  i--;
  initBullet(camera);
}

// PARA CADA BALA NA CENA, TRANSLADA O Z SE MOVIMENTAÇÃO HABILITADA
export function moveBullet(scene, camera, enemies) {
  for (let i = 0; i < ballArray.length; i++) {
    const bullet = ballArray[i];
    const ball = bullet.ball; 
    if (bullet.isShooting) {
      const distanceToTarget = ball.position.distanceTo(bullet.targetPoint);

      if (distanceToTarget <= BALL_SPEED) {
        removeBullet(scene, bullet, ball, ballArray, i, camera);
        continue; // Skip further processing for this bullet
      }

      bullet.ball.position.add(bullet.velocity);
      if (!enemies || !Array.isArray(enemies.cacodemons) || !Array.isArray(enemies.skulls)) {
        console.log("No enemies to move or enemies data is not in the expected format.");
        console.log(enemies);
        return;
      }
      const bulletBox = new THREE.Box3().setFromObject(bullet.ball);
      
      for (const enemy of enemies.cacodemons) {
        const enemyBox = new THREE.Box3().setFromObject(enemy.obj.children[0]);
        if (bulletBox.intersectsBox(enemyBox)) {
          console.log("Hit an enemy!");
          removeBullet(scene, bullet, ball, ballArray, i, camera);
          damageCacodemon(enemy, 10);
          continue;
        }
      }
      for (const enemy of enemies.skulls) {
        const enemyBox = new THREE.Box3().setFromObject(enemy.obj.children[0]);
        if (bulletBox.intersectsBox(enemyBox)) {
          console.log("Hit an enemy!");
          removeBullet(scene, bullet, ball, ballArray, i, camera);
          damageSkull(enemy, 10);
          continue;
        }
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

  const ballMaterial = new THREE.MeshLambertMaterial({color:BALL_COLOR});
  const ball = new THREE.Mesh(sphereGeometry, ballMaterial);
  ball.position.set(BULLET_ORIGIN_POS.x, BULLET_ORIGIN_POS.y, BULLET_ORIGIN_POS.z);

  ballArray.push({
    ball: ball, 
    isShooting: false,
    boundingBox: null,
    velocity: new THREE.Vector3(),
    targetPoint: new THREE.Vector3() 
  }); //set when shot

  camera.add(ball);
}

// CRIA O CILINDRO (ARMA), ADICIONA A CAMERA NA CENA E A ARMA NA CAMERA
// E INICIALIZA A PRIMEIRA BALA
export function initGun(camera) {
  const cylinderGeometry = new THREE.CylinderGeometry(
    GUN_SIZE.radius,
    GUN_SIZE.radius,
    GUN_SIZE.height,
    GUN_SIZE.segments
  );
  const gunMaterial = new THREE.MeshLambertMaterial({color:GUN_COLOR});

  const gun = new THREE.Mesh(cylinderGeometry, gunMaterial);

  const GUN_Y_OFFSET = -0.3;
  const GUN_AIMS_FORWARD = THREE.MathUtils.degToRad(-90);

  gun.position.set(0.0, GUN_Y_OFFSET, 0.0);
  gun.rotateX(GUN_AIMS_FORWARD);

  camera.add(gun);
  initBullet(camera);
}
