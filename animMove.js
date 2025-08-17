import * as THREE from  'three';

export function animVert(objects,height,condition)
{
    if(condition.value)
    {
        for(let i=0;i<objects.length;i++)
        {
            if(onjects[i].position.y>=0)
                objects[i].translateY(-height/(60));
        }
    }
}