import * as THREE from  'three';

import * as SL from './staired_level.js';


import {
        setDefaultMaterial,
        createGroundPlaneXZ} from "../libs/util/util.js";

export function Scene0()
{
    let material0 = setDefaultMaterial("lightgreen");
    let bu0=SL.genStairedLevel(100,20,100,33,10,20,material0);
    
    let material1 = setDefaultMaterial();
    let bu1=SL.genStairedLevel(100,20,100,33,10,20,material1);

    let material2 = setDefaultMaterial("lightblue");
    let bu2=SL.genStairedLevel(100,20,100,33,10,20,material2);

    let material3 = setDefaultMaterial("lightyellow");
    let bu3=SL.genStairedLevel(300,20,100,33,10,20,material3);
    bu3.rotateY(Math.PI);
    
    let wallU=new THREE.Mesh(new THREE.BoxGeometry(500,40,0.1),setDefaultMaterial("lightgrey"));
    let wallD=new THREE.Mesh(new THREE.BoxGeometry(500,40,0.1),setDefaultMaterial("lightgrey"));
    let wallL=new THREE.Mesh(new THREE.BoxGeometry(0.1,40,500),setDefaultMaterial("lightgrey"));
    let wallR=new THREE.Mesh(new THREE.BoxGeometry(0.1,40,500),setDefaultMaterial("lightgrey"));

  

    let center=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),material1);
    
    center.add(bu0);
    bu0.translateZ(-150);
    bu0.translateX(-125);
    bu0.translateY(0.15);

    center.add(bu1);
    bu1.translateZ(-150);
    bu1.translateY(0.15);

    center.add(bu2);
    bu2.translateZ(-150);
    bu2.translateX(125);
    bu2.translateY(0.15);

    center.add(bu3);
    bu3.translateZ(-150);
    bu3.translateY(0.15);

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



    
    return center;
}