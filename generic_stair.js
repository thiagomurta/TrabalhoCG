import * as THREE from  'three';
import * as TF from './texturingfuncs.js'

export function genStair(width,height,length,number_of_steps,path)
{
    let materialForStair=TF.boxTexture(path,width,height/number_of_steps,length/number_of_steps);
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
        let materialForStairAux=TF.boxTexture(path,width,height/number_of_steps,length/number_of_steps);
        let aux_buff=new THREE.Mesh(step_geometry,materialForStairAux);
        aux_buff.material[4].map.offset.y=((2)/number_of_steps)*i;
        aux_buff.material[2].map.offset.y=((2)/number_of_steps)*i;
        center.add(aux_buff);
        aux_buff.castShadow=true;
        aux_buff.recieveShadow=true;
        center.step_array.push(aux_buff);

        center.step_array[i].translateZ((length-l_p_step/2)-l_p_step*i);
        center.step_array[i].translateY(h_p_step/2+(h_p_step*i));

    }
    
    

    let p_length=Math.sqrt(Math.pow(height,2)+Math.pow(length,2));
    
    const planeGeometry = new THREE.PlaneGeometry(width,p_length);
    let plane=new THREE.Mesh(planeGeometry,materialForStair);
    center.plane=plane;
    center.add(plane);
   
    plane.translateY(height/2+0.3);
    plane.translateZ(length/2);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0), // Default normal (+Z)
    new THREE.Vector3().crossVectors(new THREE.Vector3(1,0,0),new THREE.Vector3(0,-height,-length) )
    )
    plane.quaternion.copy(quaternion);
   
    

    center.p_length=p_length;
    plane.visible=false;
    return center;

}
