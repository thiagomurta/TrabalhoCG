import * as THREE from  'three';
import {setDefaultMaterial} from "../libs/util/util.js";


export function instancePlayer(controls,scenario)
{
    let body= new THREE.Mesh(new THREE.BoxGeometry(1,2,1),setDefaultMaterial());
    const lerpConfig = {
      destination: new THREE.Vector3(body.position.x,body.position.y,body.position.z),
      alpha: 0.1,
      move: true
    }
    let player;
    player.body=body;
    player.lerp=lerp;
    player.proportions={width:1,height:2,length:1};
    player.controls=controls;
    player.controls.set(0,1.8,0);
    player.scenario=scenario;

    player.moveFoward = function()
    {
        let vaux=controls.lookFoward();
        this.lerp.destination=vaux;
        this.collide();

    }
    player.moveRight = function()
    {
        let vaux=controls.lookRight();
        this.lerp.destination=vaux;
        this.collide();
    }
    player.moveLeft = function()
    {
        let vaux=controls.lookLeft();
        this.lerp.destination=vaux;
        this.collide();
    }
    player.moveBack = function()
    {
        let vaux=controls.lookBack();
        this.lerp.destination=vaux;
        this.collide();
    }
    player.collide = function()
    {
      for (let i = 0; i < this.scenario.objects.length; i++)
        this.scenario.objects[i].collision(this);      
    }

}