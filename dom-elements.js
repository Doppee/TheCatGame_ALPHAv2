// dom-elements.js

// === RIFERIMENTI DOM RAGGRUPPATI ===
export const dom = {
    gameContainer: document.getElementById('game-container'),
    homepage: document.getElementById('homepage'),
    startButton: document.getElementById('start-button'),
    
    // Schermata Game Over
    gameOverScreen: document.getElementById('gameOverScreen'),
    restartButton: document.getElementById('restart-button'),
    menuButton: document.getElementById('menu-button'),
    finalScoreDisplay: document.getElementById('final-score'),
    
    // Elementi di gioco
    character: document.getElementById('character'),
    obstacle: document.getElementById('obstacle'),
    scoreDisplay: document.getElementById('score-display'),

    // Elementi moneta
    coinContainer: document.getElementById('coin-container'),
    coinCountDisplay: document.getElementById('coin-count-display'),
};