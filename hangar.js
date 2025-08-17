import * as THREE from  'three';
import * as TF from './texturingfuncs.js'
import { CSG } from '../libs/other/CSGMesh.js';
import { DoubleSide } from '../build/three.module.js';

export function HANGAR(comprimento,raio1, raio2, altura){

    let thickness = 1;
   let cubeMaterial = new THREE.MeshLambertMaterial({color:'rgb(255, 255, 255)'});
    let boxMaterial1=TF.boxTexture(["./T3_assets/concrete_wall.jpg"],thickness*1.5,altura,comprimento);
    let centro    = new THREE.Mesh(new THREE.BoxGeometry(0, 0, 0),cubeMaterial);
    let cubeMesh  = new THREE.Mesh(new THREE.BoxGeometry(thickness*1.5, altura, comprimento), boxMaterial1);
    let cubeMesh2 = new THREE.Mesh(new THREE.BoxGeometry(thickness*1.5, altura, comprimento), boxMaterial1);

    let boxMaterial2=TF.boxTexture(["./T3_assets/concrete_wall.jpg"],2*raio1,altura,thickness);
    let cubeMesh3 = new THREE.Mesh(new THREE.BoxGeometry(2*raio1, altura, thickness), boxMaterial2);
    
    let boxMaterial3=TF.boxTexture(["./T3_assets/concrete_wall.jpg"],raio1/2,altura,thickness);
    let cubeMesh4 = new THREE.Mesh(new THREE.BoxGeometry(raio1/2, altura, thickness), boxMaterial3);
    let cubeMesh5 = new THREE.Mesh(new THREE.BoxGeometry(raio1/2, altura, thickness), boxMaterial3);
    
    let boxMaterial4=TF.boxTexture(["./T3_assets/metal_wall_rot.jpg"],raio1+thickness, altura, thickness*1.5);
    let cubeMesh6 = new THREE.Mesh(new THREE.BoxGeometry(raio1+thickness, altura, thickness*1.5), boxMaterial4);


    let cylinderGeometry = new THREE.CylinderGeometry(raio1, raio1, comprimento+0.1, 32, true, undefined, Math.PI, Math.PI);
    var cylinderGeometry2 = new THREE.CylinderGeometry(raio2, raio2, comprimento+0.1, 32, true, undefined, Math.PI, Math.PI);

    var cylinderMaterial1 = [TF.setMaterial("./T3_assets/militar_roof_rot.jpg",comprimento/10,Math.PI*raio1/10),
        TF.setMaterial("./T3_assets/militar_roof_rot.jpg",Math.PI*raio1/10,Math.PI*raio1/10),
        TF.setMaterial("./T3_assets/militar_roof_rot.jpg",Math.PI*raio1/10,Math.PI*raio1/10)
    ];
    var cylinderMaterial2 = [TF.setMaterial("./T3_assets/militar_roof_rot.jpg",comprimento/10,Math.PI*raio2/10),
        TF.setMaterial("./T3_assets/militar_roof_rot.jpg",Math.PI*raio2/10,Math.PI*raio2/10),
        TF.setMaterial("./T3_assets/militar_roof_rot.jpg",Math.PI*raio2/10,Math.PI*raio2/10)
    ];

    let cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial1);
    let cylinderMesh2 = new THREE.Mesh(cylinderGeometry2, cylinderMaterial2);


    cylinderMesh.rotateX(THREE.MathUtils.degToRad(90));
    cylinderMesh.rotateY(THREE.MathUtils.degToRad(90));
    cylinderMesh.rotateZ(THREE.MathUtils.degToRad(180));
    cylinderMesh2.rotateX(THREE.MathUtils.degToRad(90));
    cylinderMesh2.rotateY(THREE.MathUtils.degToRad(90));
    cylinderMesh2.rotateZ(THREE.MathUtils.degToRad(180));


    cylinderMesh.position.set(0,0, 0);
    centro.outCyl=cylinderMesh;

    cylinderMesh2.position.set(0, 0, 0);
    centro.inCyl=cylinderMesh2;
    cubeMesh.position.set(raio1-thickness*0.75,0, 0);
    cubeMesh2.position.set(-raio1+thickness*0.75, 0, 0);
    cubeMesh3.position.set(0, 0, -comprimento/2+thickness/2);
    cubeMesh4.position.set(raio1-(raio1/4)+(thickness/2), 0, comprimento/2-thickness/2);
    cubeMesh5.position.set(-raio1+(raio1/4)-(thickness/2), 0, comprimento/2-thickness/2);
    cubeMesh6.position.set(0, 0, comprimento/2-thickness*0.375);

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
    let cylinderWall1 = new THREE.CylinderGeometry(raio2, raio2, thickness/2, 32, true, undefined, Math.PI, Math.PI);
    let cylinderWall1Mesh = new THREE.Mesh(cylinderWall1, cylinderMaterial1);
    let cylinderWall2 = new THREE.CylinderGeometry(raio2, raio2, thickness/2, 32, true, undefined, Math.PI, Math.PI);
    let cylinderWall2Mesh = new THREE.Mesh(cylinderWall2, cylinderMaterial2);

    cylinderWall1Mesh.rotateX(THREE.MathUtils.degToRad(90));
    cylinderWall1Mesh.rotateY(THREE.MathUtils.degToRad(90));
    cylinderWall1Mesh.rotateZ(THREE.MathUtils.degToRad(180));
    cylinderWall2Mesh.rotateX(THREE.MathUtils.degToRad(90));
    cylinderWall2Mesh.rotateY(THREE.MathUtils.degToRad(90));
    cylinderWall2Mesh.rotateZ(THREE.MathUtils.degToRad(180));

    cylinderWall1Mesh.position.set(0, altura/2, comprimento/2);
    cylinderWall2Mesh.position.set(0, altura/2, -comprimento/2);

    cylinderWall1Mesh.matrixAutoUpdate = false;
    cylinderWall1Mesh.updateMatrix();
    cylinderWall2Mesh.matrixAutoUpdate = false;
    cylinderWall2Mesh.updateMatrix();


    let cylinderCSG  = CSG.fromMesh(cylinderMesh); // cilindro maior
    let cylinderCSG2 = CSG.fromMesh(cylinderMesh2); // cilindro menor
    let cylinderM   = cylinderCSG.subtract(cylinderCSG2); // cilindro pronto

    let tetoFinal = CSG.toMesh(cylinderM, new THREE.Matrix4());
    tetoFinal.material = new THREE.MeshLambertMaterial( {color:'rgba(156, 52, 52, 1)'});
    tetoFinal.material = TF.setMaterial("./T3_assets/militar_roof.jpg",10,10);
    tetoFinal.material.side=DoubleSide;
    tetoFinal.translateY(thickness/2);
    centro.teto = tetoFinal;
    centro.teto.castShadow=true;
    centro.teto.receiveShadow=true;
    centro.add(centro.teto);
    centro.teto.translateY(altura/2-(thickness));
    centro.objects = [cubeMesh, cubeMesh2, cubeMesh3, cylinderWall1Mesh, cylinderWall2Mesh, cubeMesh4, cubeMesh5, cubeMesh6/*cylinderDoor2Mesh*/];
    for (let i = 0; i < centro.objects.length; i++){
        centro.add(centro.objects[i]);
    }
    centro.raio2=raio2;
    centro.comprimento=comprimento;
    centro.altura=altura;
    /// translates
    /// translate em z para parede fundo e frente
    /// translate em x para parede fundo e frente
    return centro;
}