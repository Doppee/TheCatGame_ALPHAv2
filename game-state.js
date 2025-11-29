// game-state.js

import { INITIAL_GAME_SPEED, INITIAL_JUMP_VH } from './constants.js';

/**
 * Oggetto che gestisce lo stato di gioco.
 */
export const state = {
    score: 0,
    displayScore: 0,
    isGameOver: false,
    isGameRunning: false, 
    gameSpeed: INITIAL_GAME_SPEED, 
    lastSpeedUpdateScore: 0,

    coins: 0, 
    activeCoins: [], 
    coinSpawnTimeout: null, 
    lastCoinSpawnScore: 0,

    // 🆕 VARIABILI SALTO (AGGIUNTE)
    currentJumps: 0, // Salto attuale (0 = a terra, 1 = primo salto, 2 = doppio salto)
    isJumping: false, // Indica se è in corso un'azione di salto/caduta (non a terra)
    isHoldingJump: false, // Indica se il tasto/touch è premuto
    jumpStartTime: 0, // Timestamp di inizio del 'hold'
    currentJumpHeightVH: INITIAL_JUMP_VH, // Altezza attuale del personaggio in vh 
    verticalVelocityVH: 0, // Velocità verticale (positiva per salita, negativa per caduta)
    
    // Timer e Intervalli (gestiti in main.js/game-logic.js ma dichiarati qui)
    gameInterval: null, 
    spawnTimeout: null, 
};

/**
 * Resetta lo stato di gioco ai valori iniziali.
 */
export function resetState() {
    state.score = 0;
    state.displayScore = 0;
    state.isGameOver = false;
    state.isGameRunning = false;
    state.gameSpeed = INITIAL_GAME_SPEED;
    state.lastSpeedUpdateScore = 0;

    // 🆕 RESET STATO SALTO (AGGIUNTO)
    state.currentJumps = 0;
    state.isJumping = false;
    state.isHoldingJump = false;
    state.jumpStartTime = 0;
    state.currentJumpHeightVH = INITIAL_JUMP_VH; 
    state.verticalVelocityVH = 0; 

    state.coins = 0;
    // Rimuovi tutti gli elementi moneta dal DOM e svuota l'array
    state.activeCoins.forEach(coin => coin.domElement.remove());
    state.activeCoins = []; 

    if (state.coinSpawnTimeout) {
        clearTimeout(state.coinSpawnTimeout);
        state.coinSpawnTimeout = null;
    }
    state.lastCoinSpawnScore = 0;
    
    // Pulisce i riferimenti ai timer (per sicurezza)
    if (state.gameInterval) {
        clearInterval(state.gameInterval);
        state.gameInterval = null;
    }
    if (state.spawnTimeout) {
        clearTimeout(state.spawnTimeout);
        state.spawnTimeout = null;
    }
}