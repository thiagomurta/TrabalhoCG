import * as THREE from  'three';

export function boxTextureCust(path,width,height,length,fu,fv)
{
        let fineTuneU=fu;
        let fineTuneV=fv;
        let material=[
            setMaterial(path[0],length/fineTuneU,height/fineTuneV),
            setMaterial(path[0],length/fineTuneU,height/fineTuneV),
            setMaterial(path[0],width/fineTuneU,length/fineTuneU),
            setMaterial(path[0],width/fineTuneU,length/fineTuneU),
            setMaterial(path[0],width/fineTuneU,height/fineTuneV),
            setMaterial(path[0],width/fineTuneU,height/fineTuneV)
        ]
        return material;
}

export function boxTexture(path,width,height,length)
{
         let fineTuneU=5;
        let fineTuneV=2;
        let material=[
            setMaterial(path[0],length/fineTuneU,height/fineTuneV),
            setMaterial(path[0],length/fineTuneU,height/fineTuneV),
            setMaterial(path[0],width/fineTuneU,length/fineTuneU),
            setMaterial(path[0],width/fineTuneU,length/fineTuneU),
            setMaterial(path[0],width/fineTuneU,height/fineTuneV),
            setMaterial(path[0],width/fineTuneU,height/fineTuneV)
        ]
        return material;
}
export function boxMultipleTexture(path,width,height,length)
{
        let fineTuneU=5;
        let fineTuneV=2;
        let material=[
            setMaterial(path[0],length/fineTuneU,height/fineTuneV),
            setMaterial(path[1],length/fineTuneU,height/fineTuneV),
            setMaterial(path[2],width/fineTuneU,length/fineTuneU),
            setMaterial(path[3],width/fineTuneU,length/fineTuneU),
            setMaterial(path[4],width/fineTuneU,height/fineTuneV),
            setMaterial(path[5],width/fineTuneU,height/fineTuneV)
        ]
        return material;
}
export function planeTex(path)
{
    var material=setMaterial(path[0],50,50,);
    console.log(material)
    return material;
}
export function cylDispTexture(path,pathDisp,height,radius1,radius2,segments)
{
    let fineTuneU=1;
    let fineTuneV=1;
    let fineTuneDispU=10;
    let fineTuneDispV=1;
    let mat=[setDispMaterial(path,fineTuneU,fineTuneV,'rgba(114, 114, 114, 1)',pathDisp,fineTuneDispU,fineTuneDispV),setDispMaterial(path),setMaterial(path)];
    return mat;
}
export function setMaterial(file, repeatU = 1, repeatV = 1, color="rgb(64,64,64)" ){

    let loader = new THREE.TextureLoader();
    let mat = new THREE.MeshLambertMaterial({ map: loader.load(file)});
      mat.map.colorSpace = THREE.SRGBColorSpace;
   mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
   mat.map.minFilter = mat.map.magFilter = THREE.LinearFilter;
   mat.map.repeat.set(repeatU,repeatV); 
   return mat;
}
export function setDispMaterial(file, repeatU = 1, repeatV = 1, color="rgb(64,64,64)" ,dispMapPath,dispU,dispV){

    let loader = new THREE.TextureLoader();
    let map=loader.load(file);
    let dispmap=loader.load(dispMapPath);
    //dispmap.repeat.set(dispU,dispV);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.minFilter = map.magFilter = THREE.LinearFilter;
    map.repeat.set(repeatU,repeatV); 

    let mat = new THREE.MeshStandardMaterial({
      map : map,
      displacementMap:dispmap,
      displacementScale:0.3,
    });
    
     

   //mat.side = THREE.DoubleSide;

   return mat;
}
export function createGroundPlaneXZCust(width, height, widthSegments = 10, heightSegments = 10, material) {
   
   let planeGeometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
   let planeMaterial = material;

   let mat4 = new THREE.Matrix4(); // Aux mat4 matrix   
   let plane = new THREE.Mesh(planeGeometry, planeMaterial);
   plane.receiveShadow = true;
   // Rotate 90 in X and perform a small translation in Y
   plane.matrixAutoUpdate = false;
   plane.matrix.identity();    // resetting matrices
   // Will execute R1 and then T1
   plane.matrix.multiply(mat4.makeTranslation(0.0, -0.1, 0.0)); // T1   
   plane.matrix.multiply(mat4.makeRotationX(degreesToRadians(-90))); // R1   

   return plane;
}
export function degreesToRadians(degrees) {
   var pi = Math.PI;
   return degrees * (pi / 180);
}
