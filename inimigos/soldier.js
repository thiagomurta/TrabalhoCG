import * as THREE from 'three';


function playAnimation(soldierData, newActionName) {
    if (soldierData.currentAction === newActionName) {
        return;
    }
    Object.values(soldierData.actions).forEach(action => action.stop());
    const actionToPlay = soldierData.actions[newActionName];
    if (actionToPlay) {
        actionToPlay.playLoop();
    } else {
        console.warn(`Animação não encontrada: ${newActionName}`);
    }
    soldierData.currentAction = newActionName;
}

function getDirectionNameFromAngle(angleDeg) {
    while (angleDeg <= -180) angleDeg += 360;
    while (angleDeg > 180) angleDeg -= 360;
    if (angleDeg > -22.5 && angleDeg <= 22.5) return 'Down';
    if (angleDeg > 22.5 && angleDeg <= 67.5) return 'RD';
    if (angleDeg > 67.5 && angleDeg <= 112.5) return 'Right';
    if (angleDeg > 112.5 && angleDeg <= 157.5) return 'RU';
    if (angleDeg > 157.5 || angleDeg <= -157.5) return 'Up';
    if (angleDeg > -157.5 && angleDeg <= -112.5) return 'LU';
    if (angleDeg > -112.5 && angleDeg <= -67.5) return 'Left';
    if (angleDeg > -67.5 && angleDeg <= -22.5) return 'LD';
    return 'Down';
}

function updateSoldierAnimation(soldierData, player, camera) {
    const soldierGroup = soldierData.obj;     const { actionSprite } = soldierData;

                    const lookAtPosition = player.position.clone();
    lookAtPosition.y = soldierGroup.position.y;     soldierGroup.lookAt(lookAtPosition);

                        const euler = new THREE.Euler();
    euler.setFromQuaternion(camera.quaternion, 'YXZ');
    const cameraAngle = euler.y;

    const soldierToPlayerVector = player.position.clone().sub(soldierGroup.position);
    const worldAngle = Math.atan2(soldierToPlayerVector.x, soldierToPlayerVector.z);
    
    const relativeAngle = worldAngle - cameraAngle + Math.PI;
    const angleDeg = THREE.MathUtils.radToDeg(relativeAngle);
    const directionName = getDirectionNameFromAngle(angleDeg);
    const actionName = 'Shooting' + directionName;
    
    playAnimation(soldierData, actionName);

                                        actionSprite.rotation.y = cameraAngle - soldierGroup.rotation.y;
}


export function moveSoldier(soldierData, player, camera) {
    soldierData.spriteMixer.update(soldierData.clock.getDelta());
    updateSoldierAnimation(soldierData, player, camera);
}