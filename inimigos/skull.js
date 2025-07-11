import * as THREE from 'three';
// Assuming these constants are defined correctly in the specified file.
import { AREA_DIMENSION, AREAS_Z, AREAS_Y } from '../inimigos.js';


export const SKULL_STATE = {
    WANDERING: 'WANDERING',
    CHARGING: 'CHARGING',
};
const SEARCH_RADIUS = 15;
const INSTA_DETECT_RADIUS = 6;
const DETECTION_ANGLE_THRESHOLD = Math.PI / 4; 
const CHARGE_DISTANCE = 1000; 
const CHARGE_SPEED = 0.5;
const WANDER_SPEED = 0.1;
const PROXIMITY_THRESHOLD = 0.5;
const MAX_PATHFINDING_ATTEMPTS = 10;
const BOUNDARY_THRESHOLD = 0.5; 
const WANDER_FORWARD_DISTANCE = 5; 

export function moveSkull(skullData, scenario, player) {

    if (!skullData.collisionObjects) {
        skullData.collisionObjects = getCollisionObjects(scenario);
    }

    switch (skullData.state) {
        case SKULL_STATE.WANDERING:
            handleWanderingState(skullData, player);
            break;
        case SKULL_STATE.CHARGING:
            handleChargingState(skullData);
            break;
    }
}