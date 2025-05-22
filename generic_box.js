import * as THREE from  'three';

export function genBox(width,height,length,stair_w,stair_l,materialForBox)
{
    let BoxGeometry0=new THREE.BoxGeometry((width-stair_l)/2,height,length);
    let BoxGeometry1=new THREE.BoxGeometry(stair_w,height,length-stair_l);
    let subBox1=new THREE.Mesh(BoxGeometry0,materialForBox);
    let subBox2=new THREE.Mesh(BoxGeometry0,materialForBox);
    let subBox0=new THREE.Mesh(BoxGeometry1,materialForBox);
    let center=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),materialForBox);
    center.lowerBox=subBox0;
    center.leftBox=subBox1;
    center.rightBox=subBox2;

    center.width=width;
    center.length=length;
    center.height=height;
    center.stair_l=stair_l;
    center.stair_w=stair_w;

    center.add(center.lowerBox);
    center.add(center.leftBox);
    center.add(center.rightBox);

    center.lowerBox.translateZ(stair_l/2);
    center.leftBox.translateX(-(stair_w+width)/4);
    center.rightBox.translateX((stair_w+width)/4);

    return center;

}

