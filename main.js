// main.js - Il nuovo entry point

import { dom } from './dom-elements.js';
import { setupEventListeners } from './event-handlers.js';

/**
 * Funzione di inizializzazione che viene eseguita all'avvio.
 */
function init() {
    // 1. Configura tutti gli Event Listener
    setupEventListeners();
    
    // 2. Nasconde gli elementi di gioco (come faceva la vecchia init)
    dom.character.classList.add('hidden');
    dom.obstacle.classList.add('hidden');
    dom.scoreDisplay.classList.add('hidden');
    dom.gameOverScreen.classList.add('hidden'); 
    
    // 3. Inizializza l'animazione del gatto in pausa
    dom.character.style.animationPlayState = 'paused'; 
}

// Avvia l'inizializzazione quando lo script viene caricato
init();