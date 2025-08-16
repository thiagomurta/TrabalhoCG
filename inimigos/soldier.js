import * as THREE from 'three';

// -----------------------------------------------------------------------------------
// As funções auxiliares vêm primeiro.
// -----------------------------------------------------------------------------------

/**
 * Controla qual animação do soldado deve ser executada, garantindo que
 * apenas uma animação toque por vez.
 * @param {object} soldierData - Os dados do soldado.
 * @param {string} newActionName - O nome da nova animação a ser tocada (ex: 'ShootingUp').
 */
function playAnimation(soldierData, newActionName) {
    // Se a animação que queremos tocar já está ativa, não fazemos nada.
    if (soldierData.currentAction === newActionName) {
        return;
    }

    // Para todas as animações possíveis, para a que estiver tocando no momento.
    Object.values(soldierData.actions).forEach(action => action.stop());

    // Procura e seleciona a nova ação a ser tocada.
    const actionToPlay = soldierData.actions[newActionName];

    if (actionToPlay) {
        actionToPlay.playLoop(); // Toca a nova animação em loop.
    } else {
        // Log de aviso caso a animação não seja encontrada.
        console.warn(`Animação não encontrada: ${newActionName}`);
    }

    // Guarda o nome da animação que está tocando agora.
    soldierData.currentAction = newActionName;
}

/**
 * Converte um ângulo em graus para um nome de direção (Up, Down, Left, Right, etc.).
 * @param {number} angleDeg - O ângulo em graus, já calculado em relação à câmera.
 * @returns {string} O nome da direção correspondente.
 */
function getDirectionNameFromAngle(angleDeg) {
    // Normaliza o ângulo para o intervalo de -180 a 180 para facilitar os cálculos.
    while (angleDeg <= -180) angleDeg += 360;
    while (angleDeg > 180) angleDeg -= 360;

    if (angleDeg > -22.5 && angleDeg <= 22.5) return 'Down';    // Frente
    if (angleDeg > 22.5 && angleDeg <= 67.5) return 'RD';     // Frente-Direita
    if (angleDeg > 67.5 && angleDeg <= 112.5) return 'Right';   // Direita
    if (angleDeg > 112.5 && angleDeg <= 157.5) return 'RU';    // Trás-Direita
    if (angleDeg > 157.5 || angleDeg <= -157.5) return 'Up';  // Trás
    if (angleDeg > -157.5 && angleDeg <= -112.5) return 'LU'; // Trás-Esquerda
    if (angleDeg > -112.5 && angleDeg <= -67.5) return 'Left';  // Esquerda
    if (angleDeg > -67.5 && angleDeg <= -22.5) return 'LD';   // Frente-Esquerda
    
    return 'Down'; // Direção padrão caso algo dê errado.
}

// -----------------------------------------------------------------------------------
// Conteúdo da função de atualização (agora preenchida).
// -----------------------------------------------------------------------------------

/**
 * Atualiza a orientação e a animação do sprite do soldado.
 * @param {object} soldierData - Os dados do soldado.
 * @param {object} player - O objeto do jogador.
 * @param {object} camera - A câmera principal da cena.
 */
function updateSoldierAnimation(soldierData, player, camera) {
    const { obj: soldier, actionSprite } = soldierData;

    // 1. EFEITO BILLBOARD: Fazer o sprite sempre encarar a câmera.
    // Copiamos a rotação da câmera no eixo Y para o sprite.
    const euler = new THREE.Euler();
    euler.setFromQuaternion(camera.quaternion, 'YXZ');
    actionSprite.rotation.y = euler.y;

    // 2. CÁLCULO DO ÂNGULO RELATIVO
    // O soldado sempre "olha" para o jogador, então criamos um vetor nessa direção.
    const soldierToPlayerVector = player.position.clone().sub(soldier.position);

    // O ângulo no "mundo" do vetor que aponta do soldado para o jogador.
    const worldAngle = Math.atan2(soldierToPlayerVector.x, soldierToPlayerVector.z);
    
    // O ângulo de visão da câmera no "mundo".
    const cameraAngle = euler.y;

    // O ângulo relativo é a diferença entre para onde o soldado olha (jogador)
    // e de onde a câmera está olhando. Somamos PI (180 graus) para ajustar o quadrante.
    const relativeAngle = worldAngle - cameraAngle + Math.PI;
    
    // Convertemos de radianos para graus para usar na nossa função auxiliar.
    const angleDeg = THREE.MathUtils.radToDeg(relativeAngle);

    // 3. SELEÇÃO E EXECUÇÃO DA ANIMAÇÃO
    // Com o ângulo relativo, descobrimos o nome da direção (ex: 'Up', 'Left', 'RD').
    const directionName = getDirectionNameFromAngle(angleDeg);

    // Como o soldado está parado e em alerta, usamos as animações "Shooting".
    // Elas mostram o soldado mirando naquela direção.
    const actionName = 'Shooting' + directionName;

    // Finalmente, tocamos a animação correta.
    playAnimation(soldierData, actionName);
}

// -----------------------------------------------------------------------------------
// Função principal de exportação (permanece a mesma do Passo 1).
// -----------------------------------------------------------------------------------

export function moveSoldier(soldierData, player, camera) {
    soldierData.spriteMixer.update(soldierData.clock.getDelta());
    updateSoldierAnimation(soldierData, player, camera);
}