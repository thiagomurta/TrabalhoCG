import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {PointerLockControls} from '../build/jsm/controls/PointerLockControls.js';

import * as LOOK from './lookers.js'

export function intersection(caster, objects, enemies, controls, distance)
{
    const ray = caster.ray;

    // Check intersection with skull meshes
    const isIntersectingSkulls = caster.intersectObjects(enemies.skulls.map(e => e.obj)).length > 0;
    // Check intersection with meshes
    const isIntersectingCacodemons = caster.intersectObjects(enemies.cacodemons.map(e => e.obj)).length > 0;


    if (isIntersectingSkulls || isIntersectingCacodemons) return true;

    for(let i =0;i<objects.length;i++)
    {
        if(i<=3)
        {
            for(let j=0;j<objects[i].vaultedBox.meshes.length;j++)
            {
                let intersects=caster.intersectObject(objects[i].vaultedBox.meshes[j]);
                if(intersects.length>0)
                {
                    let hitNormal=intersects[0].face.normal;
                    fixDir(hitNormal,caster.ray.direction);
                    controls.camera.position.addScaledVector(caster.ray.direction,distance);

                    return true;
                }
            }
        }
        else
        {
            let intersects=caster.intersectObject(objects[i]);
                if(intersects.length>0)
                {
                    let hitNormal=intersects[0].face.normal;
                    fixDir(hitNormal,caster.ray.direction);
                    controls.camera.position.addScaledVector(caster.ray.direction,distance);

                    return true;
                }
        }
    }
    return false;
}
export function fixDir(normal,direction)
{
    if((normal.x>0 && direction.x<0)||(normal.x<0 && direction.x>0))
        direction.x=0;
    if((normal.z>0 && direction.z<0)||(normal.z<0 && direction.z>0))
        direction.z=0;
    direction.normalize();
}
export function fall(caster,objects,controls,distance)
{
    let fall=true;
    for(let i=0;i<objects.length && fall==true;i++)
    {
        if(i<4)
        {
            for(let j=0;j<objects[i].vaultedBox.meshes.length && fall==true;j++)
            {
                fall=(caster.intersectObject(objects[i].vaultedBox.meshes[j]).length>0)?false:true;
               
                
                
            }
            if(fall==true)
            {
                fall=(caster.intersectObject(objects[i].stair.plane).length>0)?false:true;
                
            }

        }
        if(i==4 && fall==true)
        {
            fall=(caster.intersectObject(objects[i]).length>0)?false:true;
            
        }
    }
    if(fall==true)
    {
        controls.camera.position.addScaledVector(caster.ray.direction,distance);
    }
}
export function activateAi(caster,objects,enter1,enter2,controls)
{
        if(enter1.value==false)
        {
            let enterAux=caster.intersectObject(objects[0]).length>0;
            if(enterAux==true){
                enter1.value=enterAux;
                console.log(enter1.value);
            }
        }
         if(enter2.value==false)
        {
            let enterAux2=caster.intersectObject(objects[1]).length>0;
            enter2.value=enterAux2;
        }
    
}
