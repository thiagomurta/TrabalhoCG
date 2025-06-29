import * as THREE from  'three';
import {setDefaultMaterial} from "../libs/util/util.js";
import  * as CT from "./point.js"
import {initRenderer}from "../libs/util/util.js";


export function instancePlayer(camera,scenario,renderer)
{
    let body= new THREE.Mesh(new THREE.BoxGeometry(1,2,1),setDefaultMaterial());
    
    let player=body;
    // player.renderer=renderer;
    // player.camera=camera;
    // player.add(camera);
    // player.camera.position.set(0,1.8,0);
    // player.velocity=0.5;
    //player.position.set(-50,0,-90);
    // const lerpConfig = {
    //   destination: new THREE.Vector3(body.position.x,body.position.y,body.position.z),
    //   alpha: 1.0,
    //   move: true
    // }
    // player.lerp=lerpConfig;
    player.proportions={width:1,height:2,length:1};
    // player.controls=new CT.PointerLockControls(camera, renderer.domElement);
    //player.controls.set(0,1.8,0);
    // player.scenario=scenario;

    // player.moveFoward = function()
    // {
    //     this.lerp.move=false;
    //     let vaux=this.controls.lookFoward();
    //     let vaux2=vaux.clone();
    //     vaux.add(this.position);
        
    //     this.updateLerp(vaux);
        
    //     this.collide(vaux2);
    //     this.lerp.move=true;
        

    // }
    // player.moveRight = function()
    // {
    //     this.lerp.move=false;
    //     let vaux=this.controls.lookRight();
    //     let vaux2=vaux.clone();
    //     vaux.add(this.position);
        
    //     this.updateLerp(vaux);
        
    //     this.collide(vaux2);
    //     this.lerp.move=true;
    // }
    // player.moveLeft = function()
    // {
    //     this.lerp.move=false;
    //     let vaux=this.controls.lookLeft();
    //     let vaux2=vaux.clone();
    //     vaux.add(this.position);
        
    //     this.updateLerp(vaux);
        
    //     this.collide(vaux2);
    //     this.lerp.move=true;
    // }
    // player.moveBack = function()
    // {
    //     this.lerp.move=false;
    //     let vaux=this.controls.lookBackward();
    //     let vaux2=vaux.clone();
    //     vaux.add(this.position);
        
    //     this.updateLerp(vaux);
        
    //     this.collide(vaux2);
    //     this.lerp.move=true;
    // }
    // player.collide = function(vaux2)
    // {
    //   for (let i = 0; i < this.scenario.objects.length; i++)
    //     this.scenario.objects[i].collision(this,vaux2);      
    // }
    // player.updateLerp=function(vector)
    // {
    //     this.lerp.destination=vector;
    // }
    return player;
}