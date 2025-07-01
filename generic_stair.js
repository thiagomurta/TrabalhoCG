import * as THREE from  'three';

export function genStair(width,height,length,number_of_steps,materialForStair)
{
    
    let centerGeometry=new THREE.BoxGeometry(0.1,0.1,0.1);
    let center=new THREE.Mesh(centerGeometry,materialForStair); // center: is on ground level, under the topmost step and at left  of the lowest step (using a vertical profile obtained by a cut with y - vertical - and z -horizontal .)
                                                                // at the 3d space(representation), center would be under the topmost step and on an z line with the lowest. x is on the exact middle of width;  
    let l_p_step=length/number_of_steps;
    let h_p_step=height/number_of_steps;
    let step_array=new Array();
    center.step_array=step_array;

    let step_geometry=new THREE.BoxGeometry(width,h_p_step,l_p_step);
    
    for(let i=0;i<number_of_steps;i++)
    {
        let aux_buff=new THREE.Mesh(step_geometry,materialForStair);
        center.add(aux_buff);
        center.step_array.push(aux_buff);

        center.step_array[i].translateZ((length-l_p_step/2)-l_p_step*i);
        center.step_array[i].translateY(h_p_step/2+(h_p_step*i));

    }

    return center;

}
