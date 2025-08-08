import * as THREE from  'three';
import * as TF from './texturingfuncs.js'
import { CSG } from '../libs/other/CSGMesh.js';

export function HANGARTeto(raio1, raio2, altura){

    let cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(2 * raio1, 10, 2 * raio1));
    let cubeMesh2 = new THREE.Mesh(new THREE.BoxGeometry((2 * raio1)-1, 10, (2 * raio1)-1));
    let cubeMesh3 = new THREE.Mesh(new THREE.BoxGeometry(2 * raio1, raio1, 2 * raio1));
    let cubeMesh4 = new THREE.Mesh(new THREE.BoxGeometry((2 * raio1)-1, 10, (2 * raio1)-1));
    let cubeMesh5 = new THREE.Mesh(new THREE.BoxGeometry((2 * raio1)-1, 10, (2 * raio1)-1));

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
    cubeMesh.position.set(raio1/2, 0, raio1/2);
    cubeMesh2.position.set(raio1/2, 0, -raio1/2);
    cubeMesh3.position.set(raio1/2, 0, -raio1/2);
    cubeMesh4.position.set(-raio1/2, 0, -raio1/2);

    cylinderMesh.matrixAutoUpdate = false;
    cylinderMesh.updateMatrix();
    cylinderMesh2.matrixAutoUpdate = false;
    cylinderMesh2.updateMatrix();
    // cubeMesh.matrixAutoUpdate = false;
    // cubeMesh.updateMatrix();
    // cubeMesh2.matrixAutoUpdate = false;
    // cubeMesh2.updateMatrix();
    // cubeMesh3.matrixAutoUpdate = false;
    // cubeMesh3.updateMatrix();
    // cubeMesh4.matrixAutoUpdate = false;
    // cubeMesh4.updateMatrix();

    let cubeCSG      = CSG.fromMesh(cubeMesh);
    let cubeCSG2     = CSG.fromMesh(cubeMesh2);
    let cubeCSG3     = CSG.fromMesh(cubeMesh3);
    let cubeCSG4     = CSG.fromMesh(cubeMesh4);
    let cylinderCSG  = CSG.fromMesh(cylinderMesh);
    let cylinderCSG2 = CSG.fromMesh(cylinderMesh2);

    let cylinderM   = cylinderCSG.subtract(cylinderCSG2);
    let cylinderCut = cylinderM.subtract(cubeCSG3);
    let cubeObject  = cubeCSG.subtract(cubeCSG4);
    let cubeObject2 = cubeObject.subtract(cubeCSG2);
    let csgObject   = cubeObject2.union(cylinderCut);

    let csgFinal = CSG.toMesh(cylinderM, new THREE.Matrix4());
    csgFinal.material = new THREE.MeshLambertMaterial( {color:'rgba(156, 52, 52, 1)'});
    // csgFinal.translateY(5);
    csgFinal.material = TF.setMaterial('./T3_assets/elevador.jpg', 4, 4);

    return csgFinal;
}