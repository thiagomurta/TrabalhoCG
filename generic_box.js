import * as THREE from  'three';

export function genBox(width,height,length,stair_w,stair_l,materialForBox,stair_displacement,/*material_right*/) // uncomment so see the diference between right box and the rest (would need to pass an aditional material at the end)
{
    let BoxGeometryLeft=new THREE.BoxGeometry((width-stair_w)/2 + (stair_displacement*width),height,length);
    let BoxGeometryRight=new THREE.BoxGeometry((width-stair_w)/2 - (stair_displacement*width),height,length);

    let BoxGeometryUp=new THREE.BoxGeometry(stair_w,height,length-stair_l);
    let subBox1=new THREE.Mesh(BoxGeometryLeft,materialForBox);
    let subBox2=new THREE.Mesh(BoxGeometryRight,materialForBox/*material_right*/);
    let subBox0=new THREE.Mesh(BoxGeometryUp,materialForBox);
    let center=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),materialForBox);
    center.upperBox=subBox0;
    center.leftBox=subBox1;
    center.rightBox=subBox2;

    center.width=width;
    center.length=length;
    center.height=height;
    center.stair_l=stair_l;
    center.stair_w=stair_w;

    center.add(center.upperBox);
    center.add(center.leftBox);
    center.add(center.rightBox);

    center.upperBox.translateZ(-stair_l/2);
    center.upperBox.translateX(+stair_displacement*width); // since upper is paralel to the stairs, it needs to be translated with it's displacement

    center.leftBox.translateX(-((width-stair_w)/2 + (stair_displacement*width))/2-(stair_w/2-stair_displacement*width));
    center.rightBox.translateX(((width-stair_w)/2 - (stair_displacement*width))/2+(stair_w/2+stair_displacement*width));
    

    center.upperBox.translateY(height/2);
    center.leftBox.translateY(height/2);
    center.rightBox.translateY(height/2);

    return center;

}

