import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {PointerLockControls} from '../build/jsm/controls/PointerLockControls.js';

import * as LOOK from './lookers.js'

export function intersection(caster,objects,controls,distance)
{
    let which_one=[0,false,'n'];
    let is_coliding;
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
