import * as THREE from  'three';
import {setDefaultMaterial} from "../libs/util/util.js";
import  * as CT from "./point.js"
import {initRenderer}from "../libs/util/util.js";


export function instancePlayer(){
    let player = new THREE.Mesh(new THREE.BoxGeometry(1,2,1),setDefaultMaterial());
    // Adiciona o HP inicial ao objeto do jogador
    player.userData = {
        hp: 200,
        maxHp: 200
    };
    return player;
}

// ---- HP ----
export function createPlayerHpBar() {
    if (document.getElementById('player-hp-container')) return;

    const hpContainer = document.createElement('div');
    hpContainer.id = 'player-hp-container';
    Object.assign(hpContainer.style, {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        width: '250px',
        height: '25px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        border: '2px solid white',
        borderRadius: '5px',
        display: 'none', 
        zIndex: '100'
    });

    const hpBar = document.createElement('div');
    hpBar.id = 'player-hp-bar';
    Object.assign(hpBar.style, {
        width: '100%',
        height: '100%',
        backgroundColor: 'red',
        borderRadius: '3px',
        transition: 'width 0.2s ease-in-out'
    });

    const hpText = document.createElement('div');
    hpText.id = 'player-hp-text';
    Object.assign(hpText.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
        textShadow: '1px 1px 2px black'
    });

    hpContainer.appendChild(hpBar);
    hpContainer.appendChild(hpText);
    document.body.appendChild(hpContainer);
}

export function updatePlayerHpBar(player) {
    const hpBar = document.getElementById('player-hp-bar');
    const hpText = document.getElementById('player-hp-text');

    if (hpBar && hpText) {
        const healthPercentage = Math.max(0, (player.userData.hp / player.userData.maxHp) * 100);
        hpBar.style.width = `${healthPercentage}%`;
        hpText.innerText = `HP: ${player.userData.hp} / ${player.userData.maxHp}`;
    }
}