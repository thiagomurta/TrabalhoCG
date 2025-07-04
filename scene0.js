import * as THREE from  'three';

import * as SL from './staired_level.js';


import {
        setDefaultMaterial,
        createGroundPlaneXZ} from "../libs/util/util.js";
        

export function Scene0()
{
    let material0 = new THREE.MeshLambertMaterial({color: "rgb(86, 202, 19)"});
    let bu0=SL.genStairedLevel(100,6,100,33,10,8,material0,-0.25);
    
    let material1 = new THREE.MeshLambertMaterial({color: "rgb(231, 11, 11)"});
    let bu1=SL.genStairedLevel(100,6,100,33,10,8,material1,0);

    let material2 = new THREE.MeshLambertMaterial({color: "rgb(7, 255, 214)"});
    let bu2=SL.genStairedLevel(100,6,100,33,10,8,material2,0.25);

    let material3 = new THREE.MeshLambertMaterial({color: "rgb(156, 165, 37)"});
    let bd0=SL.genStairedLevel(300,6,100,33,10,8, material3,0);
    bd0.rotateYC(Math.PI);
    
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

    center.objects=[bu0,bu1,bu2,bd0,wallU,wallR,wallD,wallL];
    
    
    
    
    return center;
}