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
        let fineTuneU=20;
        let fineTuneV=8;
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
export function setMaterial(file, repeatU = 1, repeatV = 1, color = 'rgb(255,255,255)'){
    let loader = new THREE.TextureLoader();
    let mat = new THREE.MeshBasicMaterial({ map: loader.load(file), color:color});
      mat.map.colorSpace = THREE.SRGBColorSpace;
   mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
   mat.map.minFilter = mat.map.magFilter = THREE.LinearFilter;
   mat.map.repeat.set(repeatU,repeatV); 
   return mat;
}