import * as THREE from  'three';

import * as SL from './staired_level.js';
import * as A1 from './area1.js'
import * as A2 from './area2.js'
import * as EL from './elevador.js'
import * as HANGAR from './hangar.js'
import * as A4 from './area4.js'

import {
        setDefaultMaterial,
        createGroundPlaneXZ} from "../libs/util/util.js";
import * as TF from './texturingfuncs.js'      

export function Scene0()
{
    let material0 = new THREE.MeshLambertMaterial({color: "rgba(129, 125, 125, 0.43)"});
    let bu0=SL.genStairedLevel(100,6,100,33,10,10,["./T3_assets/romanWall.jpg","./T3_assets/romanWall.jpg","./T3_assets/stone_floor.jpg","./T3_assets/romanWall.jpg","./T3_assets/romanWall.jpg","./T3_assets/romanWall.jpg"],-0.25,["./T3_assets/roman_steps.jpg"]);
    
    A1.area1(bu0,material0);
    
    let material1 = new THREE.MeshLambertMaterial({color: "rgb(231, 11, 11)"});
    let bu1_paths=["./T3_assets/metalBoxSide.jpeg","./T3_assets/metalBoxSide.jpeg","./T3_assets/mb.jpg","./T3_assets/mb.jpg","./T3_assets/metalBoxSide.jpeg","./T3_assets/metalBoxSide.jpeg"]
    let bu1=SL.genStairedLevel(100,6,100,33,10,16,bu1_paths,0,["./T3_assets/metalBoxSide.jpeg"]);
    A2.area2(bu1,["./T3_assets/mb_pillar.jpg"]);
    EL.elevador(bu1,['./T3_assets/elevador.jpg']);
    
    

    
    // let material4 = new THREE.MeshLambertMaterial({color: "rgb(165, 49, 49)"});
    // let boxDropKeyA1 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), material4);
        
    let material5 = new THREE.MeshLambertMaterial({color: "rgb(71, 68, 68)"})
    let wallU=new THREE.Mesh(new THREE.BoxGeometry(500,40,0.1),TF.boxTexture(["./T3_assets/outside_wall.jpg"],250,20,0.1));
    let wallD=new THREE.Mesh(new THREE.BoxGeometry(500,40,0.1),TF.boxTexture(["./T3_assets/outside_wall.jpg"],250,20,0.1));
    let wallL=new THREE.Mesh(new THREE.BoxGeometry(0.1,40,500),TF.boxTexture(["./T3_assets/outside_wall.jpg"],0.1,20,250));
    let wallR=new THREE.Mesh(new THREE.BoxGeometry(0.1,40,500),TF.boxTexture(["./T3_assets/outside_wall.jpg"],0.1,20,250));
    

  

    let center=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),material1);
    
    center.add(bu0);
    bu0.translateZC(-150);
    bu0.translateXC(-125);
   // bu0.translateYC();

    center.add(bu1);
    bu1.translateZC(-150);
  //  bu1.translateYC();

   


    center.add(wallU);
    wallU.translateZ(250.05);
    wallU.translateY(20);

    center.add(wallD);
    wallD.translateZ(-250.05);
    wallD.translateY(20);

    center.add(wallL);
    wallL.translateX(-250.05);
    wallL.translateY(20);
    center.add(wallR);
    wallR.translateX(+250.05);
    wallR.translateY(20);

    // center.add(boxDropKeyA1);
    // boxDropKeyA1.translateZ(-98);
    // boxDropKeyA1.translateX(20);
    // boxDropKeyA1.translateY(0.75);
    // let materialBox = new THREE.MeshLambertMaterial({color: "rgb(86, 202, 19)"});
    // let boxTakeKeyA1 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), materialBox);
    // center.add(boxTakeKeyA1);
    // boxTakeKeyA1.translateX(-130);
    // boxTakeKeyA1.translateY(5);
    // boxTakeKeyA1.translateZ(-160);

    // let materialBox3 = new THREE.MeshLambertMaterial({color: "rgb(165, 49, 49)"});
    // let boxTakeKeyA2 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), materialBox3);
    // center.add(boxTakeKeyA2);
    // boxTakeKeyA2.translateX(0);
    // boxTakeKeyA2.translateY(6.5);
    // boxTakeKeyA2.translateZ(-160);

    // let materialBox4 = new THREE.MeshLambertMaterial({color: "rgb(214, 83, 8)"});
    // let boxTakeKeyA3 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), materialBox4);
    // center.add(boxTakeKeyA3);
    // boxTakeKeyA3.translateX(130);
    // boxTakeKeyA3.translateY(0.75);
    // boxTakeKeyA3.translateZ(-98);

    let materialBoundingBox = new THREE.MeshLambertMaterial();
    let boundingBoxPlane = new THREE.Mesh(new THREE.BoxGeometry(12,10,18), materialBoundingBox);
    center.add(boundingBoxPlane);
    boundingBoxPlane.visible = false;
    boundingBoxPlane.translateX(150);
    boundingBoxPlane.translateZ(-180);


    let hangar = HANGAR.HANGAR(100, 40, 38, 20);
                //  0    1   2   3    4     5     6     7        8              9            10           11              12 
    center.objects=[bu0,bu1,wallU,wallR,wallD,wallL/*,boxDropKeyA1, boxTakeKeyA1, boxTakeKeyA2, boxTakeKeyA3, boundingBoxPlane, hangar*/, boundingBoxPlane];
    center.add(hangar);
    hangar.translateX(150);
    hangar.translateZ(-150);
    
    let a4=A4.area4();
    center.add(a4);
    a4.translateZ(150);
    for(let i=0;i<a4.objects.length;i++)
    {
      center.objects.push(a4.objects[i]);
    }
    
    return center;
}
