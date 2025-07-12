import * as THREE from  'three';

import * as SL from './staired_level.js';

export function area1(staired_level,material)
{
  let radius=0.75;
  let height=7.5;
  let cylinderGeo=new THREE.CylinderGeometry( radius, radius, height, 35 );
  //let numColLine=20;
  //let numDispLine=numColLine-1;
  let displacement=(staired_level.vaultedBox.width - 20*2*radius)/19;
  let stairXStart=+(staired_level.vaultedBox.width*staired_level.vaultedBox.stair_displacement)-staired_level.vaultedBox.stair_w/2;
  let stairXFinish=stairXStart+staired_level.vaultedBox.stair_w;
  for(let i=0;i<76;i++)
  {
    let collumn = new THREE.Mesh(cylinderGeo,material);
    staired_level.vaultedBox.add(collumn);
    collumn.translateY(staired_level.vaultedBox.height + height/2);
    
    if(i<20) // left line
    {
        collumn.translateX(-(staired_level.vaultedBox.width/2)+radius);
        collumn.translateZ((staired_level.vaultedBox.length/2));
        collumn.translateZ(-(2*radius+displacement)*i-radius);
        

    }
    if(i>19 && i<40) // right line
    {
        collumn.translateX(+(staired_level.vaultedBox.width/2)-radius);
        collumn.translateZ((staired_level.vaultedBox.length/2));
        collumn.translateZ(-(2*radius+displacement)*(i-20)-radius);
    }
    if(i>=40 && i<58)// upper line
    {
        collumn.translateZ(-staired_level.vaultedBox.width/2 + radius);
        collumn.translateX(-(staired_level.vaultedBox.width/2)+radius);
        collumn.translateX(+(2*radius+displacement)*(i-40+1));
        
    }
    if(i>=58)
    {
        collumn.translateZ(+staired_level.vaultedBox.width/2 - radius);
        collumn.translateX(-(staired_level.vaultedBox.width/2)+radius);
        collumn.translateX(+(2*radius+displacement)*(i-58+1));
       
    }
    staired_level.vaultedBox.meshes.push(collumn);
    if((collumn.position.x>=stairXStart && collumn.position.x<=stairXFinish)&&collumn.position.z>0)
    {  
        staired_level.vaultedBox.remove(collumn);
    }else
    {
        let cylinderGeo1=new THREE.CylinderGeometry( radius+0.8, radius+0.8, height, 35 );
        let collumnCol = new THREE.Mesh(cylinderGeo1,material);
        collumn.add(collumnCol);
        collumnCol.visible=false;
        staired_level.vaultedBox.meshes.push(collumnCol);
    }
    
    }  
}