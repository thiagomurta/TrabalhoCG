import * as THREE from  'three';
import { CSG } from '../libs/other/CSGMesh.js';

export function CHAVE(){

    let cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));

    var cylinderGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1, 25);
    var cylinderMaterial = new THREE.MeshPhongMaterial( {color:'rgb(100,255,100)'});

    let cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    let cylinderMesh2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    let cylinderMesh3 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);


    cylinderMesh.rotateX(THREE.MathUtils.degToRad(90))
    cylinderMesh3.rotateZ(THREE.MathUtils.degToRad(90));


    cylinderMesh.position.set(0, 0, 0)
    cylinderMesh2.position.set(0, 0, 0)
    cylinderMesh3.position.set(0, 0, 0)

    cylinderMesh.matrixAutoUpdate = false;
    cylinderMesh.updateMatrix();
    cylinderMesh2.matrixAutoUpdate = false;
    cylinderMesh2.updateMatrix();
    cylinderMesh3.matrixAutoUpdate = false;
    cylinderMesh3.updateMatrix();

    let cubeCSG = CSG.fromMesh(cubeMesh);
    let cylinderCSG = CSG.fromMesh(cylinderMesh);
    let cylinderCSG2 = CSG.fromMesh(cylinderMesh2);
    let cylinderCSG3 = CSG.fromMesh(cylinderMesh3);

    let cylinderObject = cylinderCSG.union(cylinderCSG2);

    let csgObject = cubeCSG.subtract(cylinderObject).subtract(cylinderCSG3);

    let csgFinal = CSG.toMesh(csgObject, new THREE.Matrix4());
    csgFinal.material = new THREE.MeshPhongMaterial({color: 'lightgreen'})
    csgFinal.position.y = 1;

    return csgFinal;
}