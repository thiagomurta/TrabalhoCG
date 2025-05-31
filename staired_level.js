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

    // Stair creation
    let stair = GS.genStair(stair_w, height, stair_l, number_of_steps, material);
    center.add(stair);
    stair.translateZ(+(length/2 - stair_l));
    stair.translateY(-0.05);

    // Collision phantom box (invisible)
    let phantomBox = new THREE.Mesh(new THREE.BoxGeometry(width, height, length), material);
    center.add(phantomBox);
    phantomBox.visible = false;
    phantomBox.translateY(-0.05 + height/2);
    
    // Initialize bounding box
    center.updateMatrixWorld(true);
    center.bb = new THREE.Box3().setFromObject(phantomBox);
    center.phBx = phantomBox;

    // Stair collider setup
    const stairCollider = new THREE.Mesh(
        new THREE.BoxGeometry(stair_w, 1, stair_l),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    center.add(stairCollider);

    // Calculate stair points
    const stairDLeft = new THREE.Vector3(
        center.position.x - stair_w/2,
        0,
        center.position.z + length/2
    );
    const stairDRight = new THREE.Vector3(
        center.position.x + stair_w/2,
        0,
        center.position.z + length/2
    );
    const stairULeft = new THREE.Vector3(
        center.position.x - stair_w/2,
        height,
        center.position.z + length/2 - stair_l
    );
    const stairURight = new THREE.Vector3(
        center.position.x + stair_w/2,
        height,
        center.position.z + length/2 - stair_l
    );

    // Calculate plane normal and position collider
    const stairDLtoUL = new THREE.Vector3().subVectors(stairULeft, stairDLeft);
    const stairDLtoDR = new THREE.Vector3().subVectors(stairDRight, stairDLeft);
    const planeNormal = new THREE.Vector3()
        .crossVectors(stairDLtoUL, stairDLtoDR)
        .normalize();

    stairCollider.position.copy(stairDLeft)
        .add(stairDRight)
        .add(stairULeft)
        .add(stairURight)
        .multiplyScalar(0.25);

    stairCollider.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        planeNormal
    );
    stairCollider.scale.y = 0.01;

    // Store references
    center.stairBB = new THREE.Box3().setFromObject(stairCollider);
    center.stairNormal = planeNormal;

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
        this.stairBB.setFromObject(stairCollider);
    };

    // Collision detection
    center.colision = function(player) {
        this.updateBB();
        player.updateMatrixWorld(true);
        
        const playerBB = new THREE.Box3().setFromObject(player);
        const isColliding = this.bb.intersectsBox(playerBB);
        
        if(isColliding) {
            this.projectMovement(player);
        }
    };

    center.projectMovement = function(player) {
        let vAux = player.lerp.destination.clone().projectOnVector(this.detectSurface(player));
        player.lerp.destination.copy(vAux);
    };

    center.detectSurface = function(player) {
        let cornerUnL = new THREE.Vector3(
            this.position.x - width/2,
            player.position.y,
            this.position.z - length/2
        );
        let cornerUnR = new THREE.Vector3(
            this.position.x + width/2,
            player.position.y,
            this.position.z - length/2
        );
        let cornerDnL = new THREE.Vector3(
            this.position.x - width/2,
            player.position.y,
            this.position.z + length/2
        );
        let cornerDnR = new THREE.Vector3(
            this.position.x + width/2,
            player.position.y,
            this.position.z + length/2
        );
        
        if(player.position.x < cornerUnL.x && player.position.x > cornerUnL.x-0.15 && 
           player.position.z > cornerUnL.z && player.position.z < cornerDnL.z) {
            // Left wall
            return  new THREE.Vector3(0,0,1);
        }
        if(player.position.x > cornerUnR.x && player.position.x < cornerUnR.x+0.15 && 
           player.position.z > cornerUnR.z && player.position.z < cornerDnR.z) {
            // Right wall
            return  new THREE.Vector3(0,0,1);
        }
        if(player.position.z < cornerUnL.z && player.position.z > cornerUnL.z-0.15 && 
           player.position.x > cornerUnL.x && player.position.x < cornerUnR.x) {
            // Upper wall
            return  new THREE.Vector3(1,0,0);
        }
        if(player.position.x > cornerDnL.x && player.position.x < cornerDnR.x) {
            // Down wall - needs to consider stairs
            if(((player.position.x < stairDLeft.x) || (player.position.x > stairDRight.x)) && 
               (player.position.z > cornerDnL.z && player.position.z < cornerDnL.z+0.15)) {
                //down wall - not stairs
                return new THREE.Vector3(1,0,0);
            }
            else if(player.position.x > stairDLeft.x && player.position.x < stairDRight.x && 
                   player.position.z <= stairDLeft.z && player.position.z > stairULeft.z) {
                // Stair surface
                if (this.stairBB.containsPoint(player.position)) {
                    //not redundant 'cause we could fall on the stair from over the top level. As such, being inside the "stair prism" is not enough. This verification garantees that you'll only obey stair logic when on the stair surface.
                    return new THREE.Vector3.subVectors(
                        stairDLeft, stairULeft
                    ).normalize();
                }
                return new THREE.Vector3(0,1,0); // Default up vector
            }
        }
        if((player.position.x<cornerUnL.x || player.position.z<cornerUnL.z || player.position.x>cornerDnR.x || player.position.z>cornerDnR.z)||(player.position.y>=height&&player.position.x>stairDLeft.x && 
            player.position.x<stairDRight.x && player.position.z<stairDLeft.z && player.position.z>stairULeft.z)) {
            // The right side of 'or' could shite the functioning of falling when on the stair prism and over the stair level on the given x,y.
            // if's logic : if out of staired level box on great heights or inside the stair prism higher than the stair plane , enter fall . 
            return new THREE.Vector3(0,1,0);
        }
    };

    return center;
}