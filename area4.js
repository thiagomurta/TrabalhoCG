import * as THREE from  'three';

import * as SL from './staired_level.js';
import * as A1 from './area1.js'
import * as A2 from './area2.js'
import * as EL from './elevador.js'
import * as HANGAR from './hangar.js'
import * as SAI from './saida.js'

import {
        setDefaultMaterial,
        createGroundPlaneXZ} from "../libs/util/util.js";
import * as TF from './texturingfuncs.js'      


export function area4()
{
    let center = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),TF.setMaterial(["../assets/textures/intertravado.jpg"],0.1,0.1));

let hangarL = HANGAR.HANGAR(70, 40, 38, 20);
let hangarR = HANGAR.HANGAR(70, 40, 38, 20);
center.add(hangarL);
center.add(hangarR);
center.objects=[];
let hangars=[hangarL,hangarR];
for(let i=0;i<8;i++)
{
    let BoxGeometry=new THREE.BoxGeometry(3,3,3);
    let boxMat= TF.setMaterial("./T3_assets/cargo.jpg",1,1);
    for(let j=0;j<2;j++)
    {
        let b1=new THREE.Mesh(BoxGeometry,boxMat);
        let b2=new THREE.Mesh(BoxGeometry,boxMat);
        let b3=new THREE.Mesh(BoxGeometry,boxMat);
        let b4=new THREE.Mesh(BoxGeometry,boxMat);
        hangars[j].add(b1);
        hangars[j].objects.push(b1);
        b1.translateX(-hangars[j].raio2*0.7);
        b1.translateZ(-0.4*hangars[j].comprimento + hangars[j].comprimento*0.1*i);
        b1.translateY(1.5);


        hangars[j].add(b2);
        hangars[j].objects.push(b2);
        b2.translateX(-hangars[j].raio2*0.7+3);
        b2.translateZ(-0.4*hangars[j].comprimento + hangars[j].comprimento*0.1*i);
        b2.translateY(1.5);

        hangars[j].add(b3);
        hangars[j].objects.push(b3);
        b3.translateX(+hangars[j].raio2*0.7);
        b3.translateZ(-0.4*hangars[j].comprimento + hangars[j].comprimento*0.1*i);
        b3.translateY(1.5);
        
        hangars[j].add(b4);
        hangars[j].objects.push(b4);
        b4.translateX(+hangars[j].raio2*0.7-3);
        b4.translateZ(-0.4*hangars[j].comprimento + hangars[j].comprimento*0.1*i);
        b4.translateY(1.5);
        if(i==0){
            hangars[j].remove(hangars[j].objects[7]);
            hangars[j].objects.splice(7);
        }
        hangars[j].objects.push(b1);
        hangars[j].objects.push(b2);
        hangars[j].objects.push(b3);
        hangars[j].objects.push(b4);
    }
}
for(let i=0;i<hangars[0].objects.length;i++)
{
    center.objects.push(hangars[0].objects[i]);
    center.objects.push(hangars[1].objects[i]);
}
hangars[0].translateX(-75);
hangars[0].translateZ(-35);

hangars[1].translateX(75);
hangars[1].translateZ(-35);

let boxGeo1=new THREE.BoxGeometry(250,30,4);
let boxMat1=TF.boxTexture(["./T3_assets/wall4.jpg"],125,15,4);
let wall1=new THREE.Mesh(boxGeo1,boxMat1);
let wall2=new THREE.Mesh(boxGeo1,boxMat1);

let boxGeo2=new THREE.BoxGeometry(4,30,150);
let boxMat2=TF.boxTexture(["./T3_assets/wall4.jpg"],4,15,75);
let wall3=new THREE.Mesh(boxGeo2,boxMat2);
let wall4=new THREE.Mesh(boxGeo2,boxMat2);

center.add(wall1);
wall1.translateZ(-125-2);
wall1.translateY(15);

center.add(wall2);
wall2.translateZ(25+2);
wall2.translateY(15);


center.add(wall3);
wall3.translateY(15);
wall3.translateX(125+2);
wall3.translateZ(-50);
center.add(wall4);
wall4.translateY(15);
wall4.translateX(-125-2)
wall4.translateZ(-50);
let saidaG=new THREE.BoxGeometry(5,0.15,5);
let saida=SAI.saidaArea();
center.add(saida);
saida.translateZ(90);
center.saida=saida;
 center.objects.push(wall1);
 center.objects.push(wall2);
 center.objects.push(wall3);
 center.objects.push(wall4);
center.walls4=[wall1,wall2,wall3,wall4];
for(let i=0;i<saida.meshes.length;i++){
    center.objects.push(saida.coliders[i]);
    center.objects.push(saida.meshes[i]);
    center.objects.push(saida.cantos[i]);
}
center.portaSaida=saida.portaSaida;
return center;
}