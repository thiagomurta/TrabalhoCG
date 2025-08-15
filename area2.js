import * as THREE from  'three';

import * as SL from './staired_level.js';
import * as TF from './texturingfuncs.js'

export function area2(staired_level,path)
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
            let boxGeometry=new THREE.BoxGeometry(b_w,(i)+(j)+4,b_w);
            
            var material = TF.boxTextureCust(path,b_w,i+j+4,b_w,4,4);
            
            let box= new THREE.Mesh(boxGeometry,material);
            staired_level.vaultedBox.add(box);
            box.translateY(sl_height+((i)+(j)+4)/2);
            box.translateX(+b_w/2 -sl_width/2+(j)*(displacement_x+b_w) );
            box.translateZ(+b_w/2-sl_width/2+(i)*(displacement_z+b_w));
            if(box.position.z>(sl_width/2-staired_level.s_l) && box.position.x>=(-staired_level.s_w/2 )&& (box.position.x<=(staired_level.s_w/2)))
                staired_level.vaultedBox.remove(box);
            else{
                    let boxGeometry1=new THREE.BoxGeometry(b_w+2.8,(i)+(j)+4,b_w+2.8    );
                    let boxCol= new THREE.Mesh(boxGeometry1,material);
                    box.add(boxCol);
                    boxCol.visible=false;
                    box.castShadow=true;
                    box.recieveShadow=true;
                    
                    staired_level.vaultedBox.meshes.push(boxCol);
                    let boxGeometryFlag= new THREE.BoxGeometry(staired_level.s_w,1,2);
                    let boxFlag = new THREE.Mesh(boxGeometryFlag,material);
                    staired_level.add(boxFlag);
                    boxFlag.translateY(+staired_level.height);
                    boxFlag.translateZ(staired_level.width/2-staired_level.s_l -0.5);
                    boxFlag.visible=false;
                    staired_level.enemyActivateBox=boxFlag;
            }

           
        }
    }
    let gateG=new THREE.BoxGeometry(staired_level.s_w,staired_level.height,1);
    let gate=new THREE.Mesh(gateG,TF.boxTextureCust(['./T3_assets/gate.jpg'],staired_level.s_w,staired_level.height,1,staired_level.s_w/2,staired_level.height));
    gate.width=staired_level.s_w;
    staired_level.add(gate);
    gate.translateY(staired_level.height/2);
    gate.translateZ(staired_level.length/2 - 0.49);
    staired_level.gate=gate;
    staired_level.vaultedBox.meshes.push(gate);

}