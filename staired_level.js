import * as THREE from  'three';

import * as GB from './generic_box.js';
import * as GS from './generic_stair.js';


export function genStairedLevel(width,height,length,stair_w,stair_l,number_of_steps,material)
{
    let center=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),material);

    let vaultedBox=GB.genBox(width,height,length,stair_w,stair_l,material);
    center.add(vaultedBox);
    vaultedBox.translateY(-0.075+height/2);

    let stair=GS.genStair(stair_w,height,stair_l,number_of_steps,material);
    center.add(stair);
    
    
    stair.translateZ(+(length/2-stair_l));
    stair.translateY(-0.075);

    return center;
}