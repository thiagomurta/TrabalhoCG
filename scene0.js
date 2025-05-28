import * as THREE from  'three';

import * as SL from './staired_level.js';


import {
        setDefaultMaterial,
        createGroundPlaneXZ} from "../libs/util/util.js";

export function Scene0()
{
    let material0 = setDefaultMaterial("lightgreen");
    let bu0=SL.genStairedLevel(100,10,100,33,10,8,material0);
    
    let material1 = setDefaultMaterial();
    let bu1=SL.genStairedLevel(100,10,100,33,10,8,material1);

    let material2 = setDefaultMaterial("lightblue");
    let bu2=SL.genStairedLevel(100,10,100,33,10,8,material2);

    let material3 = setDefaultMaterial("lightyellow");
    let bd0=SL.genStairedLevel(300,10,100,33,10,8, material3);
    bd0.rotateYC(Math.PI);
    
    let wallU=new THREE.Mesh(new THREE.BoxGeometry(500,40,0.1),setDefaultMaterial("lightgrey"));
    let wallD=new THREE.Mesh(new THREE.BoxGeometry(500,40,0.1),setDefaultMaterial("lightgrey"));
    let wallL=new THREE.Mesh(new THREE.BoxGeometry(0.1,40,500),setDefaultMaterial("lightgrey"));
    let wallR=new THREE.Mesh(new THREE.BoxGeometry(0.1,40,500),setDefaultMaterial("lightgrey"));

  

    let center=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),material1);
    
    center.add(bu0);
    bu0.translateZC(-150);
    bu0.translateXC(-125);
    bu0.translateYC(0.15);

    center.add(bu1);
    bu1.translateZC(-150);
    bu1.translateYC(0.15);

    center.add(bu2);
    bu2.translateZC(-150);
    bu2.translateXC(125);
    bu2.translateY(0.15);

    center.add(bd0);
    bd0.translateZC(-150);
    bd0.translateYC(0.15);

    center.add(wallU);
    wallU.translateZ(250.05);
    wallU.translateY(20.15);

    center.add(wallD);
    wallD.translateZ(-250.05);
    wallD.translateY(20.15);

    center.add(wallL);
    wallL.translateX(-250.05);
    wallL.translateY(20.15);
    center.add(wallR);
    wallR.translateX(+250.05);
    wallR.translateY(20.15);

    center.objects=[bu0,bu1,bu2,bd0,wallU,wallR,wallD,wallL];
    
    
    return center;
}