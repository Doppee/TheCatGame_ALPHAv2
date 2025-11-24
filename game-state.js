// game-state.js

import { INITIAL_GAME_SPEED } from './constants.js';

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