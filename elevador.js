import * as THREE from 'three';

export function elevador(staired_level,material)
{
    let height =0.5;
    let elevador=new THREE.Mesh(new THREE.BoxGeometry(staired_level.s_w,height,staired_level.s_l),material);
    staired_level.add(elevador);
    staired_level.elevador=elevador;
    staired_level.remove(staired_level.stair);
    staired_level.elevador.translateZ(staired_level.length/2 - staired_level.s_l/2);
    staired_level.elevador.translateY(height/2);
    elevador.castShadow=true;
    elevador.recieveShadpw=true;
}