import * as THREE from  'three';

export function coluna(radius,dispScale,height)
{
    let geom = new THREE.CylinderGeometry(radius, radius, height, 100, 100, true);
    let colormap = 	new THREE.TextureLoader().load("./T3_assets/col_color.jpg");
        colormap.colorSpace = THREE.SRGBColorSpace;
    let normalmap = new THREE.TextureLoader().load("./T3_assets/col_norm.jpg");
    let dispmap = 	new THREE.TextureLoader().load("./T3_assets/col_disp.jpg");
    
    let mat = new THREE.MeshLambertMaterial({
        //side: THREE.DoubleSide,
        color:"white",
        map: colormap,
        normalMap: normalmap,
        displacementMap: dispmap,
        displacementScale: dispScale,
    });
    mat.normalScale.set(0.7, 0.7);
    
    let mesh = new THREE.Mesh(geom, mat);
    setTextureOptions(mesh.material, 1,1); // Set repeat and wrapping modes
    return mesh;
}
function setTextureOptions(material, repu, repv){
    material.map.repeat.set(repu,repv);
    material.displacementMap.repeat.set(repu,repv);
    material.normalMap.repeat.set(repu,repv);
    
    material.map.wrapS = material.displacementMap.wrapS = material.normalMap.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = material.displacementMap.wrapT = material.normalMap.wrapT = THREE.RepeatWrapping;	
}