import * as THREE from  'three';

export function boxTexture(path,width,height,length)
{
        let fineTuneU=5;
        let fineTuneV=2;
        let material=[
            setMaterial(path,length/fineTuneU,height/fineTuneV),
            setMaterial(path,length/fineTuneU,height/fineTuneV),
            setMaterial(path,width/fineTuneU,length/fineTuneU),
            setMaterial(path,width/fineTuneU,length/fineTuneU),
            setMaterial(path,width/fineTuneU,height/fineTuneV),
            setMaterial(path,width/fineTuneU,height/fineTuneV)
        ]
        return material;
}
function setMaterial(file, repeatU = 1, repeatV = 1, color = 'rgb(255,255,255)'){
    let loader = new THREE.TextureLoader();
    let mat = new THREE.MeshBasicMaterial({ map: loader.load(file), color:color});
      mat.map.colorSpace = THREE.SRGBColorSpace;
   mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
   mat.map.minFilter = mat.map.magFilter = THREE.LinearFilter;
   mat.map.repeat.set(repeatU,repeatV); 
   return mat;
}