import * as THREE from  'three';

export function animVert(objects,height,condition,lim)
{
    if(condition.value)
    {

        for(let i=0;i<objects.length;i++)
        {
                   if(height==30)
                console.log(objects[i].position.y);
            if(objects[i].position.y>=lim)
                objects[i].translateY(-height/(360));
        }
    }
}