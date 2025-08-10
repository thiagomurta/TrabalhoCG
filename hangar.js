import * as THREE from  'three';
import * as TF from './texturingfuncs.js'
import { CSG } from '../libs/other/CSGMesh.js';
// import {initDefaultSpotlight,
//         createLightSphere} from "../libs/util/util.js";

export function HANGARTeto(raio1, raio2, altura){

    // let lightPosition = new THREE.Vector3(1.7, 0.8, 1.1);
    // let light = initDefaultSpotlight(scene, lightPosition, 5); // Use default light
    // let lightSphere = createLightSphere(scene, 0.1, 10, 10, lightPosition);
    let thickness = 1;
    let cubeMaterial = new THREE.MeshLambertMaterial({color:'rgb(255, 255, 255)'});

    let centro    = new THREE.Mesh(new THREE.BoxGeometry(0, 0, 0),cubeMaterial);
    let cubeMesh  = new THREE.Mesh(new THREE.BoxGeometry(thickness, altura, 2*raio1), cubeMaterial);
    let cubeMesh2 = new THREE.Mesh(new THREE.BoxGeometry(thickness, altura, 2*raio1), cubeMaterial);
    let cubeMesh3 = new THREE.Mesh(new THREE.BoxGeometry(2*raio1, altura, thickness), cubeMaterial);
    let cubeMesh4 = new THREE.Mesh(new THREE.BoxGeometry(raio1/2, altura, thickness), cubeMaterial);
    let cubeMesh5 = new THREE.Mesh(new THREE.BoxGeometry(raio1/2, altura, thickness), cubeMaterial);


    let cylinderGeometry = new THREE.CylinderGeometry(raio1, raio1, 2*raio1, 32, true, undefined, Math.PI, Math.PI);
    var cylinderGeometry2 = new THREE.CylinderGeometry(raio2, raio2, 2*raio1, 32, true, undefined, Math.PI, Math.PI);

    var cylinderMaterial = new THREE.MeshLambertMaterial( {color:'rgba(156, 52, 52, 1)'});

    let cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    let cylinderMesh2 = new THREE.Mesh(cylinderGeometry2, cylinderMaterial);


    cylinderMesh.rotateX(THREE.MathUtils.degToRad(90));
    cylinderMesh.rotateY(THREE.MathUtils.degToRad(90));
    cylinderMesh.rotateZ(THREE.MathUtils.degToRad(180));
    cylinderMesh2.rotateX(THREE.MathUtils.degToRad(90));
    cylinderMesh2.rotateY(THREE.MathUtils.degToRad(90));
    cylinderMesh2.rotateZ(THREE.MathUtils.degToRad(180));


    cylinderMesh.position.set(0, 0, 0);
    cylinderMesh2.position.set(0, 0, 1);
    cubeMesh.position.set(raio1, 0, 0);
    cubeMesh2.position.set(-raio1, 0, 0);
    cubeMesh3.position.set(0, 0, -raio1);
    // cubeMesh4.position.set(raio1-(raio1/4)+(thickness/2), 0, raio1);
    // cubeMesh5.position.set(-raio1+(raio1/4)-(thickness/2), 0, raio1);

    cylinderMesh.matrixAutoUpdate = false;
    cylinderMesh.updateMatrix();
    cylinderMesh2.matrixAutoUpdate = false;
    cylinderMesh2.updateMatrix();
    cubeMesh.matrixAutoUpdate = false;
    cubeMesh.updateMatrix();
    cubeMesh2.matrixAutoUpdate = false;
    cubeMesh2.updateMatrix();
    cubeMesh3.matrixAutoUpdate = false;
    cubeMesh3.updateMatrix();
    // cubeMesh4.matrixAutoUpdate = false;
    // cubeMesh4.updateMatrix();
    // cubeMesh5.matrixAutoUpdate = false;
    // cubeMesh5.updateMatrix();

    // portas cilíndricas
    let cylinderDoor1 = new THREE.CylinderGeometry(raio1, raio1, thickness/2, 32, true, undefined, Math.PI/2, Math.PI/2);
    let cylinderDoor2 = new THREE.CylinderGeometry(raio1, raio1, thickness/2, 32, true, undefined, Math.PI/2, Math.PI/2);
    let cylinderDoor1Mesh = new THREE.Mesh(cylinderDoor1, cylinderMaterial);
    let cylinderDoor2Mesh = new THREE.Mesh(cylinderDoor2, cylinderMaterial);

    cylinderDoor1Mesh.rotateX(THREE.MathUtils.degToRad(90));
    cylinderDoor2Mesh.rotateX(THREE.MathUtils.degToRad(90));
    cylinderDoor2Mesh.rotateZ(THREE.MathUtils.degToRad(180));

    // cylinderDoor1Mesh.position.set(raio1-(raio1/4)+(thickness/2), 0, raio1);
    // cylinderDoor2Mesh.position.set(-raio1+(raio1/4)-(thickness/2), 0, raio1);
    cylinderDoor1Mesh.position.set(0, 0, raio1);
    cylinderDoor2Mesh.position.set(0, 0, raio1);

    cylinderDoor1Mesh.matrixAutoUpdate = false;
    cylinderDoor1Mesh.updateMatrix();
    cylinderDoor2Mesh.matrixAutoUpdate = false;
    cylinderDoor2Mesh.updateMatrix();


    let cylinderCSG  = CSG.fromMesh(cylinderMesh); // cilindro maior
    let cylinderCSG2 = CSG.fromMesh(cylinderMesh2); // cilindro menor
    let cylinderM   = cylinderCSG.subtract(cylinderCSG2); // cilindro pronto

    let tetoFinal = CSG.toMesh(cylinderM, new THREE.Matrix4());
    tetoFinal.material = new THREE.MeshLambertMaterial( {color:'rgba(156, 52, 52, 1)'});
    // tetoFinal.translateY(altura);
    tetoFinal.material = TF.setMaterial('./T3_assets/elevador.jpg', 4, 4);
    centro.teto = tetoFinal;
    centro.add(centro.teto);
    // centro.teto.translateY(altura/2-thickness);
    centro.paredes = [cubeMesh, cubeMesh2, cubeMesh3, cylinderDoor1Mesh, cylinderDoor2Mesh];
    for (let i = 0; i < centro.paredes.length; i++){
        centro.add(centro.paredes[i]);
    }

    /// translates
    /// translate em z para parede fundo e frente
    /// translate em x para parede fundo e frente

    return centro;
}