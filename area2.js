import * as THREE from  'three';

import * as SL from './staired_level.js';

export function area2(staired_level,material)
{
    let sl_width=staired_level.width;
    let sl_height=staired_level.height;
    let b_w=4;
    let numLines=5;
    let numCollumns=4;

    let displacement_z= (sl_width-((numLines)*b_w))/(numLines-1);
    let displacement_x= (sl_width-((numCollumns)*b_w))/(numCollumns-1);
    for(let i=0;i<numLines;i++)   
    {
        for(let j=0;j<numCollumns;j++)
        {
            let boxGeometry=new THREE.BoxGeometry(b_w,(4-i)+(5-j)+4,b_w);
            let box= new THREE.Mesh(boxGeometry,material);
            staired_level.vaultedBox.add(box);
            box.translateY(sl_height+((4-i)+(5-j)+4)/2);
            box.translateX(+b_w/2 -sl_width/2+(j)*(displacement_x+b_w) );
            box.translateZ(+b_w/2-sl_width/2+(i)*(displacement_z+b_w));
            if(box.position.z>(sl_width/2-staired_level.s_l) && box.position.x>=(-staired_level.s_w/2 )&& (box.position.x<=(staired_level.s_w/2)))
                staired_level.vaultedBox.remove(box);
            else{
                    let boxGeometry1=new THREE.BoxGeometry(b_w+0.8,(i)+(j)+4,b_w+0.8    );
                    let boxCol= new THREE.Mesh(boxGeometry1,material);
                    box.add(boxCol);
                    boxCol.visible=false;
                    box.castShadow=true;
                    box.recieveShadow=true;
                    
                    staired_level.vaultedBox.meshes.push(boxCol);
            }

           
        }
    }
}