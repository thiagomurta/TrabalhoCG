import * as THREE from  'three';
import * as TF from './texturingfuncs.js'
export function genBox(width,height,length,stair_w,stair_l,path,stair_displacement,) 
{
    let BoxGeometryLeft=new THREE.BoxGeometry((width-stair_w)/2 + (stair_displacement*width),height,length);
    let BoxGeometryRight=new THREE.BoxGeometry((width-stair_w)/2 - (stair_displacement*width),height,length);

    let BoxGeometryUp=new THREE.BoxGeometry(stair_w,height,length-stair_l);
    
    let mat1=TF.boxTexture(path,((width-stair_w)/2 + (stair_displacement*width)),height,length);
    let subBox1=new THREE.Mesh(BoxGeometryLeft,mat1);
    let mat2=TF.boxTexture(path,((width-stair_w)/2 - (stair_displacement*width)),height,length);
    let subBox2=new THREE.Mesh(BoxGeometryRight,mat2);
    
    let mat3=TF.boxTexture(path,stair_w,height,length-stair_l);
    let subBox0=new THREE.Mesh(BoxGeometryUp,mat3);
    
    let center=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),mat1);
    center.upperBox=subBox0;
    center.upperBox.name="upper";
    center.leftBox=subBox1;
    center.leftBox.name="left";
    center.rightBox=subBox2;
    center.rightBox.name="right";

    center.width=width;
    center.length=length;
    center.height=height;
    center.stair_l=stair_l;
    center.stair_w=stair_w;
    center.stair_displacement=stair_displacement;

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
    center.meshes=[];
    center.meshes.push(center.leftBox);
    center.meshes.push(center.upperBox);
    center.meshes.push(center.rightBox);
    for (let mesh of center.meshes) {
        mesh.receiveShadow = true;
        mesh.castShadow = true;
    }

    return center;

}

