import * as THREE from 'three'

export function gateAnim(staired_level,condition)
{
    if(condition.value==true)
    {
        if(staired_level.gate.position.x<(staired_level.position.x+staired_level.s_w))
            staired_level.gate.translateX(staired_level.s_w/120);
        else
            condition.value=false;
    }
}