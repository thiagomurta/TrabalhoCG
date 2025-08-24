import * as THREE from  'three';

import * as SL from './staired_level.js';
import * as TF from './texturingfuncs.js'
import * as COL from './coluna.js'
export function area1(staired_level,material)
{
  let radius=1;
  let height=10;
  let cylinderGeo=new THREE.CylinderGeometry( radius, radius, height, 35 );
  //let numColLine=20;
  //let numDispLine=numColLine-1;
  let displacement=(staired_level.vaultedBox.width - 20*2*radius*1.3)/19;
  let stairXStart=+(staired_level.vaultedBox.width*staired_level.vaultedBox.stair_displacement)-staired_level.vaultedBox.stair_w/2;
  let stairXFinish=stairXStart+staired_level.vaultedBox.stair_w;
  for(let i=0;i<38;i++)
  {
    let collumn =COL.coluna(radius,1,height
    );
    staired_level.vaultedBox.add(collumn);
    collumn.translateY(staired_level.vaultedBox.height + height/2);
    
    if(i<10) // left line
    {
        collumn.translateX(-(staired_level.vaultedBox.width/2)+radius+radius*0.3);
        collumn.translateZ((staired_level.vaultedBox.length/2));
        collumn.translateZ(-(2*radius+displacement)*i-radius);
        

    }
    if(i>9 && i<19) // right line
    {
        collumn.translateX(+(staired_level.vaultedBox.width/2)-radius-radius*0.3);
        collumn.translateZ((staired_level.vaultedBox.length/2));
        collumn.translateZ(-(2*radius+displacement)*(i-10)-radius);
    }
    if(i>=19 && i<28)// upper line
    {
        collumn.translateZ(-staired_level.vaultedBox.width/2 + radius+radius*0.3);
        collumn.translateX(-(staired_level.vaultedBox.width/2)+radius);
        collumn.translateX(+(2*radius+displacement)*(i-20+1));
        
    }
    if(i>=28)
    {
        collumn.translateZ(+staired_level.vaultedBox.width/2 - radius -radius*0.3);
        collumn.translateX(-(staired_level.vaultedBox.width/2)+radius);
        collumn.translateX(+(2*radius+displacement)*(i-28+1));
       
    }
    staired_level.vaultedBox.meshes.push(collumn);
    if((collumn.position.x>=stairXStart && collumn.position.x<=stairXFinish)&&collumn.position.z>0)
    {  
        staired_level.vaultedBox.remove(collumn);
    }else
    {
        let cylinderGeo1=new THREE.CylinderGeometry( radius+0.4, radius+0.4, height, 35 );
        let collumnCol = new THREE.Mesh(cylinderGeo1,material);
        collumn.castShadow=true;
        collumn.receiveShadow=true;
        collumn.add(collumnCol);
        collumnCol.visible=false;
        staired_level.vaultedBox.meshes.push(collumnCol);
       

        
    }
    }
     let boxGeometryFlag= new THREE.BoxGeometry(staired_level.s_w,1,2);
       
        
        let boxFlag = new THREE.Mesh(boxGeometryFlag,material);
        staired_level.add(boxFlag);
        boxFlag.position.copy(staired_level.stair.position);
        boxFlag.translateY(staired_level.height+0.5);
        staired_level.bf=boxFlag;
        boxFlag.visible=false;
        staired_level.enemyActivateBox=boxFlag;
        for(let i=0;i<4;i++){
            let blockGeo=new THREE.BoxGeometry(50,2,4);
            let block=new THREE.Mesh(blockGeo,TF.boxTexture(["./T3_assets/romanWall.jpg"],50,2,4));
            staired_level.add(block);
            if(i==0)
            {
                block.translateX(0);
                block.translateY(staired_level.height + 1 + height);
                block.translateZ(-(staired_level.length/2));
                block.translateX(25);
            }else if(i==1)
            {
                block.rotateY(Math.PI/2);
                block.translateY(staired_level.height + 1 + height);
                block.translateZ(-(staired_level.length/2));
                block.translateX(-25);
            }else if(i==2){
                block.rotateY(Math.PI/2);
                block.translateY(staired_level.height + 1 + height);
                block.translateZ((staired_level.length/2));
                block.translateX(20);
            }else{
                block.translateX(0);
                block.translateY(staired_level.height + 1 + height);
                block.translateZ((staired_level.length/2));
                block.translateX(5);
            }
        }
}