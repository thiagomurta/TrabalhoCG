import * as THREE from 'three';

export function elevador(staired_level,material)
{
    let height = 0.5;
    let elevador=new THREE.Mesh(new THREE.BoxGeometry(staired_level.s_w,height,staired_level.s_l),material);
    staired_level.add(elevador);
    staired_level.elevador=elevador;
    staired_level.remove(staired_level.stair);
    staired_level.elevador.translateZ(staired_level.length/2 - staired_level.s_l/2);
    staired_level.elevador.translateY(height/2);
    elevador.castShadow=true;
    elevador.recieveShadow=true;
    elevador.height=height;
    elevador.detectors=[];
    elevador.detectRange=5;
    for(let i=0;i<4;i++)
    {
        let detectGeometry1=new THREE.BoxGeometry(elevador.detectRange,1,staired_level.s_l)
        let detector = new THREE.Mesh(detectGeometry1,material);
        staired_level.add(detector);
        detector.visible=false;
        elevador.detectors.push(detector);

    }
    for(let i=0;i<2;i++)
    {
        let detectGeometry1=new THREE.BoxGeometry(staired_level.s_w,1,elevador.detectRange)
        let detector = new THREE.Mesh(detectGeometry1,material);
        staired_level.add(detector);
        detector.visible=false;
        elevador.detectors.push(detector);
    }
     positioningDetectors(staired_level,elevador.detectors);
}
export function elevadorLogic(caster,level,controls,canMove)
{
    
    let elevador=level.elevador;
    let canGo=caster.intersectObject(elevador).length>0; 
    let goDown=false;
    if(elevador.position.y<(level.height-elevador.height/2) && canMove && canGo){
        elevador.position.y+=(level.height-3*elevador.height/2)/60;
        controls.camera.position.y+=(level.height-3*elevador.height/2)/60;
    }
    for(let i=0;i<elevador.detectors.length&& goDown!=true;i++)
    {
        goDown=caster.intersectObject(elevador.detectors[i]);
        
    }
    goDown=goDown && !canGo &&(elevador.position.y>=(level.height-elevador.height/2)||elevador.position.y>(elevador.height/2));
    if(goDown)
    {
        elevador.position.y-=(level.height-3*elevador.height/2)/60;
        return false;
    }
    return canGo;
}
function positioningDetectors(staired_level,detectors)
{
    for(let i=0;i<detectors.length;i++)
    {
        if(i==0 || i==1 || i==4)
            detectors[i].translateY(staired_level.height);
       
    }
    for(let i=0;i<4;i++)
    {
        if(i%2==0)
        {
            detectors[i].translateX(-staired_level.s_w/2 - 2.5);
        }
        else
        {
            detectors[i].translateX(+staired_level.s_w/2 + 2.5);
        }
    }
    for(let i=4;i<6;i++)
    {
        if(i==4)
        {
            detectors[i].translateZ(staired_level.length/2-staired_level.s_l-2.5)
        }
        else
        {
            detectors[i].translateZ(staired_level.length/2+2.5)
        }
    }
    for(let i=0;i<4;i++)
    {
        if(i<2)
        {
            detectors[i].translateZ(staired_level.length/2-staired_level.s_l/2);
        }
        else
        {
            detectors[i].translateZ(staired_level.length/2+staired_level.s_l/2);
        }
    }
}