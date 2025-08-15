import * as THREE from  'three';

import * as SL from './staired_level.js';
import * as A1 from './area1.js'
import * as A2 from './area2.js'
import * as EL from './elevador.js'
import * as HANGAR from './hangar.js'

import {
        setDefaultMaterial,
        createGroundPlaneXZ} from "../libs/util/util.js";
import * as TF from './texturingfuncs.js'      

export function Scene0()
{
    let material0 = new THREE.MeshLambertMaterial({color: "rgba(129, 125, 125, 0.43)"});
    let bu0=SL.genStairedLevel(100,6,100,33,10,10,["../assets/textures/stonewall.jpg"],-0.25);
    
    A1.area1(bu0,material0);
    
    let material1 = new THREE.MeshLambertMaterial({color: "rgb(231, 11, 11)"});
    let bu1_paths=["./T3_assets/MetalBoxSide.jpg","./T3_assets/MetalBoxSide.jpg","./T3_assets/mb.jpg","./T3_assets/mb.jpg","./T3_assets/MetalBoxSide.jpg","./T3_assets/MetalBoxSide.jpg"]
    let bu1=SL.genStairedLevel(100,6,100,33,10,16,bu1_paths,0);
    A2.area2(bu1,["./T3_assets/mb_pillar.png"]);
    EL.elevador(bu1,['./T3_assets/elevador.jpg']);
    
    let material2 = new THREE.MeshLambertMaterial({color: "rgb(7, 255, 214)"});
    let bu2=SL.genStairedLevel(100,6,100,33,10,16,["../assets/textures/stonewall.jpg"],0.25);

    let material3 = new THREE.MeshLambertMaterial({color: "rgb(156, 165, 37)"});
    let bd0=SL.genStairedLevel(300,6,100,33,10,16, ["../assets/textures/stonewall.jpg"],0);
    bd0.rotateYC(Math.PI);
    
    let material4 = new THREE.MeshLambertMaterial({color: "rgb(165, 49, 49)"});
    let box = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), material4);
        
    let material5 = new THREE.MeshLambertMaterial({color: "rgb(71, 68, 68)"})
    let wallU=new THREE.Mesh(new THREE.BoxGeometry(500,40,0.1),material5);
    let wallD=new THREE.Mesh(new THREE.BoxGeometry(500,40,0.1),material5);
    let wallL=new THREE.Mesh(new THREE.BoxGeometry(0.1,40,500),material5);
    let wallR=new THREE.Mesh(new THREE.BoxGeometry(0.1,40,500),material5);
    

  

    let center=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),material1);
    
    center.add(bu0);
    bu0.translateZC(-150);
    bu0.translateXC(-125);
   // bu0.translateYC();

    center.add(bu1);
    bu1.translateZC(-150);
  //  bu1.translateYC();

    center.add(bu2);
    bu2.translateZC(-150);
    bu2.translateXC(125);
    //bu2.translateY();

    center.add(bd0);
    bd0.translateZC(-150);
    //bd0.translateYC();

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

    center.add(box);
    box.translateZ(-98);
    box.translateX(20);
    box.translateY(0.75);
    let materialBox = new THREE.MeshLambertMaterial({color: "rgb(86, 202, 19)"});
    let box2 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), materialBox);
    center.add(box2);
    box2.translateX(-130);
    box2.translateY(5);
    box2.translateZ(-160);

    let materialBox3 = new THREE.MeshLambertMaterial({color: "rgb(165, 49, 49)"});
    let box3 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), materialBox3);
    center.add(box3);
    box3.translateX(0);
    box3.translateY(6.5);
    box3.translateZ(-160);

    let materialBoundingBox = new THREE.MeshLambertMaterial();
    let boundingBoxPlane = new THREE.Mesh(new THREE.BoxGeometry(12,10,18), materialBoundingBox);
    boundingBoxPlane.visible = false;

    let hangar = HANGAR.HANGAR(20, 19, 12);

    center.objects=[bu0,bu1,bu2,bd0,wallU,wallR,wallD,wallL,box, box2, box3, hangar, boundingBoxPlane];
    center.add(hangar);
    
    
    
    return center;
}
