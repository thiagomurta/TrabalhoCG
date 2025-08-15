import * as THREE from  'three';
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import {getMaxSize} from "../libs/util/util.js";

//---------------------------------------------------------

export async function Plane(){
    try{
        let plane = await loadOBJFile('./T3_assets/', 'plane', 18, -90, true);
        return plane;
    }
    catch (err) {
        console.error("Erro ao carregar modelo: ", err);
    }
}

function loadOBJFile(modelPath, modelName, desiredScale, angle, visibility){
    return new Promise((resolve, reject) => {

        var mtlLoader = new MTLLoader( );
        mtlLoader.setPath( modelPath );
        mtlLoader.load( modelName + '.mtl', function ( materials ) {
            materials.preload();

            var objLoader = new OBJLoader( );
            objLoader.setMaterials(materials);
            objLoader.setPath(modelPath);
            
            objLoader.load( modelName + ".obj", function ( obj ) {
                obj.visible = visibility;
                obj.name = modelName;

                // Set 'castShadow' property for each children of the group
                obj.traverse( function (child){
                    if( child.isMesh )   child.castShadow = true;
                    if( child.material ) child.material.side = THREE.DoubleSide; 
                });

                var obj = normalizeAndRescale(obj, desiredScale);
                var obj = fixPosition(obj);
                obj.rotateY(THREE.MathUtils.degToRad(-90));
                resolve(obj);
            }, undefined, function(error){
                reject(error);
            });
        }, undefined, function(error){
            reject(error);
        });
    });
}

// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale){
    var scale = getMaxSize(obj); // Available in 'utils.js'
    obj.scale.set(newScale * (1.0/scale),
                newScale * (1.0/scale),
                newScale * (1.0/scale));

    return obj;
}

function fixPosition(obj){
    // Fix position of the object over the ground plane
    var box = new THREE.Box3().setFromObject( obj );
    if(box.min.y > 0)
        obj.translateY(-box.min.y);
    else
        obj.translateY(-1*box.min.y);
  return obj;
}