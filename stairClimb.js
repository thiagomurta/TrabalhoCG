export function stairclimb(caster,objects,controls)
{
    for(let i=0;i<objects.length;i++)
    {
        let ramp=caster.intersectObject(objects[i].stair);
        if(ramp.length>0)
        {
            
            let intersection=ramp[0].point;
            let playerPosition=controls.camera.position;
            if(playerPosition.y<intersection.y+6 || playerPosition.y>intersection.y-6)
            {
                //console.log("ba");
                playerPosition.y=intersection.y+2;
            }
        }
    }
}