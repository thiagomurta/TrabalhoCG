import * as THREE from  'three';
import {setDefaultMaterial} from "../libs/util/util.js";


export function instancePlayer()
{
    let body= new THREE.Mesh(new THREE.BoxGeometry(1,2,1),setDefaultMaterial());
    const lerpConfig = {
      destination: new THREE.Vector3(body.position.x,body.position.y,body.position.z),
      alpha: 0.1,
      move: true
    }
    let player;
    player.body=body;
    player.lerp=lerp;
    player.proportions={width:1,height:2,length:1};


}