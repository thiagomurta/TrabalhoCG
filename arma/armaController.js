import { initGun, removeGun, initShootBall } from "./armaLancador.js";
import { loadChaingun, removeChaingun, startShootingChaingun, stopShootingChaingun } from "./chaingun.js";

export const GUNTYPE = {
    chaingun: 'chaingun',
    lancador: 'lancador'
};
export let currentGun = GUNTYPE.chaingun;
let isMouseDown = false;
let isCoolingDown = false;

export function initWeaponSystem(camera, renderer) {
    loadChaingun(camera); // Start with the chaingun

    window.addEventListener('mousedown', () => { isMouseDown = true; });
    window.addEventListener('mouseup', () => { isMouseDown = false; });

    renderer.domElement.addEventListener('wheel', (event) => {
        if (event.deltaY !== 0 && !isCoolingDown) {
            toggleGun(camera);
            isCoolingDown = true;
            setTimeout(() => { isCoolingDown = false; }, 500);
        }
    });
}

function toggleGun(camera) {
    if (currentGun === GUNTYPE.chaingun) {
        currentGun = GUNTYPE.lancador;
        removeChaingun(camera);
        initGun(camera);
    } else {
        currentGun = GUNTYPE.chaingun;
        removeGun(camera);
        loadChaingun(camera);
    }
}

export function updateWeapons(scene, camera, enemies) {
    if (isMouseDown) {
        switch (currentGun) {
            case GUNTYPE.chaingun:
                startShootingChaingun(enemies, camera);
                break;
            case GUNTYPE.lancador:
                initShootBall(scene, camera); // Simplified: Assumes it handles its own cooldown
                break;
        }
    } else {
        stopShootingChaingun();
    }
}