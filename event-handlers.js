// event-handlers.js

import { dom } from './dom-elements.js';
import { startGame, resetGame, backToMenu, jump } from './game-logic.js';
import { state } from './game-state.js';

/**
 * Collega tutti i listener di eventi all'interfaccia.
 */
export function setupEventListeners() {
    // Listener per i pulsanti: Start, Restart, Menu
    dom.startButton.addEventListener('click', (e) => { e.stopPropagation(); startGame(); });
    dom.restartButton.addEventListener('click', (e) => { e.stopPropagation(); resetGame(); });
    dom.menuButton.addEventListener('click', (e) => { e.stopPropagation(); backToMenu(); });

    // Listener per il salto (tasto Spazio)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !state.isGameOver && state.isGameRunning) {
            e.preventDefault(); // Evita lo scorrimento della pagina con spazio
            jump();
        }
    });

    // Listener per il salto (TOCCO/CLICK sul contenitore di gioco)
    dom.gameContainer.addEventListener('click', (e) => { 
        if (!state.isGameOver && state.isGameRunning && e.target.tagName !== 'BUTTON') { 
            jump();
        }
    });

    dom.gameContainer.addEventListener('touchstart', (e) => { 
        if (!state.isGameOver && state.isGameRunning && e.target.tagName !== 'BUTTON') {
            // e.preventDefault() non è necessario qui, il CSS gestisce overflow
            jump();
        }
    });
}