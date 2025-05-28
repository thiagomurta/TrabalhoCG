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
    center.isColliding = function(player) {
        this.updateBB();
        player.updateMatrixWorld(true);
        
        const playerBB = player.bb || new THREE.Box3().setFromObject(player);
        const isColliding = this.bb.intersectsBox(playerBB);
        
        // DEBUG: Uncomment to see collision results
        // console.log(`Collision: ${isColliding}`, {
        //     thisBB: this.bb,
        //     playerBB: playerBB
        // });
        
        console.log( isColliding);  
    };

    return center;
}