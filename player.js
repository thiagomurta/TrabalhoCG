import * as THREE from  'three';
import {setDefaultMaterial} from "../libs/util/util.js";
import  * as CT from "./point.js"
import {initRenderer}from "../libs/util/util.js";


export function instancePlayer(camera,scenario,renderer){
    let player = new THREE.Mesh(new THREE.BoxGeometry(1,2,1),setDefaultMaterial());

    return player;
}