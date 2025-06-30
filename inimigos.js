import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';


export function initCocoDemon() {
    let glbLoader = new GLTFLoader();

    return new Promise((resolve, reject) => {
        glbLoader.load('./2025.1_T2_Assets/cacodemon.glb', function (gltf) {
            const obj = gltf.scene;
            obj.traverse(function (child) {
                if (child) {
                    child.castShadow = true;
                }
            });
            resolve(obj);
        }, undefined, function (error) {
            reject(error); 
        });
    });
}

export function initSkull(){
    let model;
    let mtlloader = new MTLLoader();
    let objloader = new OBJLoader();
    return new Promise((resolve, reject) => {
        mtlloader.load('./2025.1_T2_Assets/skull/skull.mtl',    function ( materials ) {
            materials.preload();

            objloader.setMaterials(materials);
            objloader.setPath(modelPath);
            objloader.load('./2025.1_T2_Assets/skull.obj', function     ( obj ) {
                model = obj.scene;
                model.traverse ( function(child){
                    if (child) child.castShadow = true;
                });

                resolve(model);
            }, undefined, function (error) {
                reject(error); 
            });
        });
    });
}