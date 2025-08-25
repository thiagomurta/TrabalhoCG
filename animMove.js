import * as THREE from  'three';

export function animVert(objectsArray,height,condition,lim)
{
    if(condition.value)
    {

        for(let i=0;i<objectsArray.length;i++)
        {
                   if(height==30)
                console.log(objectsArray[i].position.y);
            if(objectsArray[i].position.y>=lim)
                objectsArray[i].translateY(-height/(360));
        }
    }
}