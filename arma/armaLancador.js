import * as THREE from 'three';
import { handleProjectileCollision } from '../inimigos/damageHandler.js'; 
import { teto } from '../t3.js';
import { playSound }  from '../sons/sons.js';
// --------------------- ARMA ---------------------
// MACROS
const ROCKET_LAUNCHER_LOCATION = "./T3_assets/rocketlauncher.png";
const BALL_COLOR = 'rgb(100, 193, 255)';
const BALL_SIZE = { radius: 0.1, widthSegments: 20, heightSegments: 20 };
const BALL_SPEED = 3.0;
const BULLET_ORIGIN_POS = {x: 0.0, y: -0.0, z: 0.0};
//{x: 0.0, y: -0.35, z: -1.3}; muzzle

const BALL_BOX_SIZE = 0.1;

let rocketLauncherSprite = null;
let rocketLauncherTexture = null;
let animationTimer = null;
let ballArray = [];
let currentBulletIndex = 0;
let lastShotTime = 0;
const SHOOT_COOLDOWN = 0.5; // (seconds)

// RASTREAR A CADÊNCIA DE TIROS PARA ATIRAR
export function initShootBall(scenario, scene, camera) {
  
  const currentTime = performance.now() / 1000; // Get current time in seconds
  if (currentTime - lastShotTime >= SHOOT_COOLDOWN) {
      playSound('ROCKET_LAUNCHER_FIRE');

      shootBall(scenario, scene, camera);
      lastShotTime = currentTime; // Update the last shot time
  }
}

// ADICIONA A BALA PRESA NA ARMA NA CENA E HABILITA SUA MOVIMENTAÇÃO
// CRIA SUA BOUNDING BOX
// CONSERTA O OFFSET DE Y POR UM RAYCASTER
// DEPOIS INICIALIZA A PRÓXIMA BALA PARA SER ATIRADA
export function shootBall(scenario, scene, camera) {
  animateRocketShot(); // Play the muzzle flash animation

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
  //const RIGHTMOST_BOX = scenario.objects[2];
  //const LOWER_MIDDLE_BOX = scenario.objects[3];
  const NORTH_WALL = scenario.objects[2];
  const SOUTH_WALL = scenario.objects[3];
  const LEFT_WALL = scenario.objects[4];
  const RIGHT_WALL = scenario.objects[5];
  const PLANE = scene.children[0];
  const intersects = raycaster.intersectObjects([teto, PLANE,
    LEFTMOST_BOX, UPPER_MIDDLE_BOX,
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
  // É mais seguro iterar de trás para frente ao remover itens de um array
  for (let i = ballArray.length - 1; i >= 0; i--) {
    const bullet = ballArray[i];
    const ball = bullet.ball; 
    if (bullet.isShooting) {
      
      // 1. Mova o projétil
      bullet.ball.position.add(bullet.velocity);
      
      // 2. Verifique a colisão
      const hasCollided = handleProjectileCollision(bullet, enemies);

      if (hasCollided) {
        removeBullet(scene, bullet, ball, ballArray, i, camera);
        continue; 
      }

      // 3. Verifique se o projétil atingiu seu alvo ou distância máxima
      const distanceToTarget = ball.position.distanceTo(bullet.targetPoint);
      if (distanceToTarget <= BALL_SPEED) {
        removeBullet(scene, bullet, ball, ballArray, i, camera);
        continue;
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

function animateRocketShot() {
    if (!rocketLauncherTexture) return;

    rocketLauncherTexture.offset.x = 1 / 3;

    animationTimer = setTimeout(() => {
        if (rocketLauncherTexture) {
            rocketLauncherTexture.offset.x = 2 / 3;
        }
    }, 100);

    animationTimer = setTimeout(() => {
        if (rocketLauncherTexture) {

            rocketLauncherTexture.offset.x = 0 / 3; 
        }
    }, 200);
}

// CRIA O CILINDRO (ARMA), ADICIONA A CAMERA NA CENA E A ARMA NA CAMERA
// E INICIALIZA A PRIMEIRA BALA
export function initGun(camera) {
    if (rocketLauncherSprite) {
        removeGun(camera);
    }

    const rocketLauncherMaterial = new THREE.SpriteMaterial({
        transparent: true
    });

    rocketLauncherTexture = new THREE.TextureLoader().load(
        ROCKET_LAUNCHER_LOCATION, 
        (texture) => { 
            
            texture.repeat.set(1 / 3, 1);
            texture.wrapS = THREE.ClampToEdgeWrapping; // Prevents wrapping

            rocketLauncherMaterial.map = texture;

            rocketLauncherMaterial.needsUpdate = true; 

            rocketLauncherSprite = new THREE.Sprite(rocketLauncherMaterial);
            const aspectRatio = (261/3) / 135; 
            rocketLauncherSprite.scale.set(aspectRatio * 0.9, 0.9, 1);
            rocketLauncherSprite.position.set(0, -0.35, -1.2);

            rocketLauncherSprite.name = 'rocketLauncher';
            camera.add(rocketLauncherSprite);
            rocketLauncherSprite.raycast = () => {};
        }
    );

    initBullet(camera);
}

export function removeGun(camera) {
    const sprite = camera.getObjectByName('rocketLauncher');
    if (sprite) {
        camera.remove(sprite);
        rocketLauncherSprite = null;
        rocketLauncherTexture = null;
    }

    if (animationTimer) {
        clearTimeout(animationTimer);
        animationTimer = null;
    }

    for (let i = ballArray.length - 1; i >= 0; i--) {
        const bulletObj = ballArray[i];
        const ballMesh = bulletObj.ball;

        if (ballMesh.parent) {
            ballMesh.parent.remove(ballMesh);
        }
    }

    ballArray = [];
    currentBulletIndex = 0;
    lastShotTime = 0;
    
    console.log("Rocket launcher and all bullets removed.");
}

