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
        gap: '5px',      
        height: '32px',
        display: 'none',
        zIndex: '100'
    });

    // Cria 10 corações
    for (let i = 0; i < 10; i++) {
        const heartContainer = document.createElement('div');
        Object.assign(heartContainer.style, {
            width: '32px',
            height: '32px',
            position: 'relative' 
        });

        // Camada de fundo (coração vazio)
        const heartBg = document.createElement('div');
        Object.assign(heartBg.style, {
            width: '100%',
            height: '100%',
            backgroundImage: "url('./T3_assets/heart_empty.png')", 
            backgroundSize: 'cover',
            position: 'absolute'
        });

        // Camada da frente (coração cheio)
        const heartFill = document.createElement('div');
        heartFill.id = `heart-fill-${i}`; 
        Object.assign(heartFill.style, {
            width: '100%', 
            height: '100%',
            backgroundImage: "url('./T3_assets/heart_full.png')", 
            backgroundSize: 'cover',
            position: 'absolute',
            overflow: 'hidden', 
            transition: 'width 0.2s ease-out' 
        });
        
        heartContainer.appendChild(heartBg);
        heartContainer.appendChild(heartFill);
        hpContainer.appendChild(heartContainer);
    }

    document.body.appendChild(hpContainer);
}

export function updatePlayerHpBar(player) {
    const currentHp = player.userData.hp;
    const hpPerHeart = 20; // Cada coração vale 20 HP

    for (let i = 0; i < 10; i++) {
        const heartFill = document.getElementById(`heart-fill-${i}`);
        if (!heartFill) continue;

        const hpThreshold = (i + 1) * hpPerHeart; // O HP necessário para encher este coração completamente
        
        let fillPercentage = 0;

        if (currentHp >= hpThreshold) {
            // Se o HP atual é suficiente para encher este coração e os anteriores, ele fica 100% cheio.
            fillPercentage = 100;
        } else if (currentHp < hpThreshold && currentHp > (i * hpPerHeart)) {
            const hpInThisHeart = currentHp % hpPerHeart;
            fillPercentage = (hpInThisHeart === 0 && currentHp > 0) ? 100 : (hpInThisHeart / hpPerHeart) * 100;

        } else {
            fillPercentage = 0;
        }

        heartFill.style.width = `${fillPercentage}%`;
    }
}