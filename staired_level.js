import * as THREE from 'three';
import * as GB from './generic_box.js';
import * as GS from './generic_stair.js';
import {initRenderer,
        initDefaultBasicLight,
        setDefaultMaterial, 
        onWindowResize,
        createGroundPlaneXZ                } from "../libs/util/util.js";

export function genStairedLevel(width, height, length, stair_w, stair_l, number_of_steps, material,stair_displacement) {
    // Main container
    let center = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), material);
    center.offset=5;
    // Visible geometry
    let vaultedBox = GB.genBox(width, height, length, stair_w, stair_l, material,stair_displacement);
    center.add(vaultedBox);
    vaultedBox.translateY(-0.05);

    // Stair creation
    let stair = GS.genStair(stair_w, height, stair_l, number_of_steps, material);
    center.add(stair);
    stair.translateZ(+(length/2 - stair_l));
    stair.translateY(-0.05);
    stair.translateX(stair_displacement*width);
    center.vaultedBox=vaultedBox;
    center.stair=stair;

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
        center.position.x - stair_w/2+stair_displacement,
        0,
        center.position.z + length/2
    );
    const stairDRight = new THREE.Vector3(
        center.position.x + stair_w/2+stair_displacement,
        0,
        center.position.z + length/2
    );
    const stairULeft = new THREE.Vector3(
        center.position.x - stair_w/2+stair_displacement,
        height,
        center.position.z + length/2 - stair_l
    );
    const stairURight = new THREE.Vector3(
        center.position.x + stair_w/2+stair_displacement,
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
    center.width=width;
    center.height=height;
    center.length=length;
    center.s_l=stair_l;
    center.s_w=stair_w;
    center.stair_displacement=stair_displacement;

    return center;
}