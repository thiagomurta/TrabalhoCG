import * as THREE from  'three';
import * as TF from './texturingfuncs.js'
import { CSG } from '../libs/other/CSGMesh.js';

export function HANGARTeto(raio1, raio2, altura){

    let cubeMaterial = new THREE.MeshLambertMaterial({color:'rgb(255, 255, 255)'});

    let centro    = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1),cubeMaterial);
    let cubeMesh  = new THREE.Mesh(new THREE.BoxGeometry(1, altura, 2*raio1), cubeMaterial);
    let cubeMesh2 = new THREE.Mesh(new THREE.BoxGeometry(1, altura, 2*raio1), cubeMaterial);
    let cubeMesh3 = new THREE.Mesh(new THREE.BoxGeometry(2*raio1, altura, 1), cubeMaterial);
    let cubeMesh4 = new THREE.Mesh(new THREE.BoxGeometry(raio1/2, altura, 1), cubeMaterial);
    let cubeMesh5 = new THREE.Mesh(new THREE.BoxGeometry(raio1/2, altura, 1), cubeMaterial);


    let cylinderGeometry = new THREE.CylinderGeometry(raio1, raio1, 2*raio1, 32, true, undefined, Math.PI, Math.PI);
    var cylinderGeometry2 = new THREE.CylinderGeometry(raio2, raio2, 2*raio1, 32, true, undefined, Math.PI, Math.PI);

    var cylinderMaterial = new THREE.MeshLambertMaterial( {color:'rgb(0, 0, 0)'});

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
    cubeMesh4.position.set(raio1-(raio1/4)+0.5, 0, raio1);
    cubeMesh5.position.set(-raio1+(raio1/4)-0.5, 0, raio1);

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


    let cylinderCSG  = CSG.fromMesh(cylinderMesh); // cilindro maior
    let cylinderCSG2 = CSG.fromMesh(cylinderMesh2); // cilindro menor
    let cylinderM   = cylinderCSG.subtract(cylinderCSG2); // cilindro pronto

    let tetoFinal = CSG.toMesh(cylinderM, new THREE.Matrix4());
    tetoFinal.material = new THREE.MeshLambertMaterial( {color:'rgba(156, 52, 52, 1)'});
    // tetoFinal.translateY(altura);
    tetoFinal.material = TF.setMaterial('./T3_assets/elevador.jpg', 4, 4);
    centro.teto = tetoFinal;
    centro.add(centro.teto);
    centro.paredes = [cubeMesh, cubeMesh2, cubeMesh3, cubeMesh4, cubeMesh5];
    for (let i = 0; i < centro.paredes.length; i++){
        centro.add(centro.paredes[i]);
    }

    /// translates
    /// translate em z para parede fundo e frente
    /// translate em x para parede fundo e frente

    return centro;
}