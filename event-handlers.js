// event-handlers.js

import { dom } from './dom-elements.js';
import { startGame, resetGame, backToMenu, jump, stopJumpHold } from './game-logic.js';
import { state } from './game-state.js';

/**
 * Collega tutti i listener di eventi all'interfaccia.
 */
export function setupEventListeners() {
    // Listener per i pulsanti: Start, Restart, Menu
    dom.startButton.addEventListener('click', (e) => { e.stopPropagation(); startGame(); });
    dom.restartButton.addEventListener('click', (e) => { e.stopPropagation(); resetGame(); });
    dom.menuButton.addEventListener('click', (e) => { e.stopPropagation(); backToMenu(); });

// === GESTIONE TASTIERA (Spacebar) ===
    // Listener per la PRESSIONE (Inizia il salto/hold)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !state.isGameOver && state.isGameRunning) {
            e.preventDefault(); 
            // Chiama jump() solo al primo keydown per l'impulso iniziale/hold
            if (e.repeat === false) { 
                 jump();
            }
        }
    });
    
    // 🆕 Listener per il RILASCIO (Termina il hold)
    document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && state.isHoldingJump) {
        stopJumpHold(); // 🛑 Questo è CRUCIALE
    }
});

    // === GESTIONE MOUSE (Click/Touch) ===
    // 🆕 Listener per la PRESSIONE MOUSE (Inizia il salto/hold)
    dom.gameContainer.addEventListener('mousedown', (e) => { 
        // 🛑 Rimosso l'old listener 'click'
        if (!state.isGameOver && state.isGameRunning && e.target.tagName !== 'BUTTON') { 
            e.preventDefault();
            jump();
        }
    });

    // 🆕 Listener per il RILASCIO MOUSE (Termina il hold)
    // Su TUTTO il documento per sicurezza
    document.addEventListener('mouseup', () => { 
    if (state.isHoldingJump) {
        stopJumpHold(); // 🛑 CRUCIALE
    }
});
    
    // 🆕 Listener per la PRESSIONE TOUCH (Inizia il salto/hold)
    dom.gameContainer.addEventListener('touchstart', (e) => { 
        if (!state.isGameOver && state.isGameRunning && e.target.tagName !== 'BUTTON') {
            e.preventDefault(); // Necessario per bloccare il comportamento di default
            jump();
        }
    });
    
    // 🆕 Listener per il RILASCIO TOUCH (Termina il hold)
    // Su TUTTO il documento per sicurezza
   document.addEventListener('touchend', () => { 
    if (state.isHoldingJump) {
        stopJumpHold(); // 🛑 CRUCIALE
    }
});
}