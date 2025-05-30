import * as THREE from 'three';
import * as GB from './generic_box.js';
import * as GS from './generic_stair.js';

export function genStairedLevel(width, height, length, stair_w, stair_l, number_of_steps, material) {
    // Main container
    let center = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), material);
    
    // Visible geometry
    let vaultedBox = GB.genBox(width, height, length, stair_w, stair_l, material);
    center.add(vaultedBox);
    vaultedBox.translateY(-0.05);

    //stair ceation
    let stair = GS.genStair(stair_w, height, stair_l, number_of_steps, material);
    center.add(stair);
    stair.translateZ(+(length/2 - stair_l));
    stair.translateY(-0.05);

    //directional vectors
    let lengthVec=new THREE.Vector3(0,0,length);
    let widthVec=new THREE.Vector3(width,0,0);
    let stairVec=new THREE.Vector3(0,height,stair_l);
    
    // Collision phantom box (invisible)
    let phantomBox = new THREE.Mesh(new THREE.BoxGeometry(width, height, length), material);
    center.add(phantomBox);
    phantomBox.visible = false;
    phantomBox.translateY(-0.05 + height/2);
    
    // Initialize bounding box
    center.updateMatrixWorld(true);
    center.bb = new THREE.Box3().setFromObject(phantomBox);
    center.phBx = phantomBox;

    // Movement methods with automatic BB updates
    center.translateXC = function(x) {
        this.translateX(x);
        this.updateBB();
    };
    
    center.translateYC = function(y) {
        this.translateY(y);
        this.updateBB();
    };
    
    center.translateZC = function(z) {
        this.translateZ(z);
        this.updateBB();
    };
    
    center.rotateXC = function(ang) {
        this.rotateX(ang);
        this.updateBB();
    };
    
    center.rotateYC = function(ang) {
        this.rotateY(ang);
        this.updateBB();
    };
    
    center.rotateZC = function(ang) {
        this.rotateZ(ang);
        this.updateBB();
    };

    // Unified BB update method
    center.updateBB = function() {
        this.updateMatrixWorld(true);
        this.bb.setFromObject(this.phBx);
        
        // DEBUG: Uncomment to verify positions
        // console.log("BB Center:", this.bb.getCenter(new THREE.Vector3()));
        // console.log("World Position:", this.phBx.getWorldPosition(new THREE.Vector3()));
    };

    // Reliable collision detection
    center.colision = function(player) {
        this.updateBB();
        player.updateMatrixWorld(true);
        
        const playerBB = new THREE.Box3().setFromObject(player);
        const isColliding = this.bb.intersectsBox(playerBB);
        
        if(isColliding)
        {
            this.projectMovement(player);
        }
        
    
    };

    center.projectMovement=function(player)
    {
        let vAux=player.lerp.destination.clone().projectOnVector(this.detectSurface(player));
    }
    center.detectSurface=function(player)
    {
        
        let cornerUnL=new THREE.Vector3(this.position.x-width/2,
                                        player.position.y,
                                        this.position.z-length/2);
        let cornerUnR=new THREE.Vector3(this.position.x+width/2,
                                        player.position.y,
                                        this.position.z-length/2);
        let cornerDnL=new THREE.Vector3(this.position.x-width/2,
                                        player.position.y,
                                        this.position.z+length/2);
        let cornerDnR=new THREE.Vector3(this.position.x+width/2,
                                        player.position.y,
                                        this.position.z+length/2);
        let stairDLeft=new THREE.Vector3(this.position.x-stair_w/2,
                                        0,
                                        this.position.z+length/2);
        let stairDRight=new THREE.Vector3(this.position.x+stair_w/2,
                                        0,
                                        this.position.z+length/2);
        let stairULeft=new THREE.Vector3(this.position.x-stair_w/2,
                                        height,
                                        this.position.z+length/2- stair_l);
        let stairURight=new THREE.Vector3(this.position.x+stair_w/2,
                                        height,
                                        this.position.z+length/2- stair_l);
        
        if(player.position.x < cornerUnL.x && player.position.x>cornerUnL.x-0.15 && player.position.z > cornerUnL.z && player.position.z < cornerDnL.z)
        {
            //left wall
            if(player.lerp.destination.z <0)
            {
                return new THREE.Vector3(0,0,-1); //going z-
            }else if(player.lerp.destination.z >=0)
                return new THREE.Vector3(0,0,1); //going z+
        }
        if(player.position.x > cornerUnR.x && player.position.x<cornerUnR.x+0.15 && player.position.z > cornerUnR.z && player.position.z < cornerDnR.z)
        {
            //right wall
            if(player.lerp.destination.z <0)
            {
                return new THREE.Vector3(0,0,-1); //going z-
            }else if(player.lerp.destination.z >=0)
                return new THREE.Vector3(0,0,1); //going z+
        }
        if(player.position.z < cornerUnL.z && player.position.z>cornerUnL.z-0.15 && player.position.x > cornerUnL.x && player.position.x < cornerUnR.x)
        {
            //upper wall
            if(player.lerp.destination.x <0)
            {
                return new THREE.Vector3(-1,0,0); //going x-
            }else if(player.lerp.destination.x >=0)
                return new THREE.Vector3(1,0,0); //going x+
        }
        if( player.position.x > cornerDnL.x && player.position.x < cornerDnR.x)
        {
            //down wall - needs to consider stairs
            if(((player.position.x<=stairDLeft.x )||(player.position.x>=stairDRight.x ))&&(player.position.z>=cornerDnL.z &&player.position.z<cornerDnL.z+0.15))
            {
                if(player.lerp.destination.x <0)
                {
                    return new THREE.Vector3(-1,0,0); //going x-
                }else if(player.lerp.destination.x >=0)
                    return new THREE.Vector3(1,0,0); //going x+
            }else if(player.position.x>stairDLeft.x && player.position.x<stairDRight.x && player.position.z <= stairDLeft.z && player.position.z >stairULeft.z)
                    {
                        //stair surface
                        
                    }
        }
                
    }

    return center;
}