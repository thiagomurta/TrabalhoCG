import * as THREE from  'three';
import * as TF from './texturingfuncs.js'
import { CSG } from '../libs/other/CSGMesh.js';

export function HANGARTeto(raio1, raio2, altura){

    let thickness = 1;
    let cubeMaterial = new THREE.MeshLambertMaterial({color:'rgb(255, 255, 255)'});

    let centro    = new THREE.Mesh(new THREE.BoxGeometry(0, 0, 0),cubeMaterial);
    let cubeMesh  = new THREE.Mesh(new THREE.BoxGeometry(thickness, altura, 2*raio1), cubeMaterial);
    let cubeMesh2 = new THREE.Mesh(new THREE.BoxGeometry(thickness, altura, 2*raio1), cubeMaterial);
    let cubeMesh3 = new THREE.Mesh(new THREE.BoxGeometry(2*raio1, altura, thickness), cubeMaterial);
    let cubeMesh4 = new THREE.Mesh(new THREE.BoxGeometry(raio1/2, altura, thickness), cubeMaterial);
    let cubeMesh5 = new THREE.Mesh(new THREE.BoxGeometry(raio1/2, altura, thickness), cubeMaterial);
    let cubeMesh6 = new THREE.Mesh(new THREE.BoxGeometry(raio1+thickness, altura, thickness), cubeMaterial);


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
    cubeMesh4.position.set(raio1-(raio1/4)+(thickness/2), 0, raio1);
    cubeMesh5.position.set(-raio1+(raio1/4)-(thickness/2), 0, raio1);
    cubeMesh6.position.set(0, 0, raio1+thickness);

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
    cubeMesh4.matrixAutoUpdate = false;
    cubeMesh4.updateMatrix();
    cubeMesh5.matrixAutoUpdate = false;
    cubeMesh5.updateMatrix();
    cubeMesh6.matrixAutoUpdate = false;
    cubeMesh6.updateMatrix();

    // parede cilíndrica
    let cylinderWall1 = new THREE.CylinderGeometry(raio1, raio1, 1, 32, true, undefined, Math.PI, Math.PI);
    let cylinderWall1Mesh = new THREE.Mesh(cylinderWall1, cylinderMaterial);

    cylinderWall1Mesh.rotateX(THREE.MathUtils.degToRad(90));
    cylinderWall1Mesh.rotateY(THREE.MathUtils.degToRad(90));
    cylinderWall1Mesh.rotateZ(THREE.MathUtils.degToRad(180));

    cylinderWall1Mesh.position.set(0, altura/2, raio1);

    cylinderWall1Mesh.matrixAutoUpdate = false;
    cylinderWall1Mesh.updateMatrix();


    let cylinderCSG  = CSG.fromMesh(cylinderMesh); // cilindro maior
    let cylinderCSG2 = CSG.fromMesh(cylinderMesh2); // cilindro menor
    let cylinderM   = cylinderCSG.subtract(cylinderCSG2); // cilindro pronto

    let tetoFinal = CSG.toMesh(cylinderM, new THREE.Matrix4());
    tetoFinal.material = new THREE.MeshLambertMaterial( {color:'rgba(156, 52, 52, 1)'});
    tetoFinal.material = TF.setMaterial('./T3_assets/elevador.jpg', 4, 4);
    centro.teto = tetoFinal;
    centro.add(centro.teto);
    centro.teto.translateY(altura/2-(thickness/2));
    centro.paredes = [cubeMesh, cubeMesh2, cubeMesh3, cylinderWall1Mesh, cubeMesh4, cubeMesh5, cubeMesh6/*cylinderDoor2Mesh*/];
    for (let i = 0; i < centro.paredes.length; i++){
        centro.add(centro.paredes[i]);
    }

    /// translates
    /// translate em z para parede fundo e frente
    /// translate em x para parede fundo e frente
    
    return centro;
}