import {
    Euler,
    EventDispatcher,
    Vector3
} from 'three';
import * as THREE from 'three';

export function Foward(pointerLC) {
        let vector= new THREE.Vector3(0,0,-1);
        let auxY=vector.y;
        vector.applyQuaternion(pointerLC.camera.quaternion);
        vector.y=auxY;

        return vector;
    }

export  function  Backward(pointerLC) {
        let vector= new THREE.Vector3(0,0,1);
        let auxY=vector.y;
        vector.applyQuaternion(pointerLC.camera.quaternion);
        vector.y=auxY;

        return vector;
    }

export  function  Left(pointerLC) {
        let vector= new THREE.Vector3(-1,0,0);
        let auxY=vector.y;
        vector.applyQuaternion(pointerLC.camera.quaternion);
        vector.y=auxY;

        return vector;
    }

export function    Right(pointerLC) {
       let vector= new THREE.Vector3(1,0,0);
        let auxY=vector.y;
        vector.applyQuaternion(pointerLC.camera.quaternion);
        vector.y=auxY;

        return vector;
    }
export function Down(pointerLC)
{
    let vector= new THREE.Vector3(0,-1,0);
        return vector;
}
export function Up(pointerLC)
{
    let vector= new THREE.Vector3(0,1,0);
        return vector;
}
