// game-logic.js

import { dom } from './dom-elements.js';
import { state, resetState } from './game-state.js';
import * as C from './constants.js'; 

// === FUNZIONI PRIVATE ===

function increaseDifficulty() {
    if (state.gameSpeed > C.MIN_SPEED) {
        state.gameSpeed = Math.max(C.MIN_SPEED, state.gameSpeed - C.SPEED_DECREMENT);
        state.lastSpeedUpdateScore = state.displayScore;
        dom.obstacle.style.animationDuration = `${state.gameSpeed}s`;
    }
}

function endGame() {
    state.isGameOver = true;
    state.isGameRunning = false;
    
    clearInterval(state.gameInterval); 
    clearTimeout(state.spawnTimeout); 
    
    dom.gameContainer.classList.add('paused-animations'); 
    dom.character.style.animationPlayState = 'paused';

    dom.finalScoreDisplay.textContent = state.displayScore;
    dom.gameOverScreen.classList.remove('hidden');
}

// === FUNZIONI PUBBLICHE (Esportate) ===

export function checkCollision() {
    if (!state.isGameRunning || state.isGameOver) return;
    
    // Logica di collisione invariata, ma che usa gli oggetti importati.
    const characterRect = dom.character.getBoundingClientRect();
    const obstacleRect = dom.obstacle.getBoundingClientRect();
    const gameContainerRect = dom.gameContainer.getBoundingClientRect();

    const currentScaleFactor = characterRect.width / C.CHARACTER_WIDTH;
    const verticalScaleFactor = characterRect.height / (C.CHARACTER_WIDTH * (45/60)); 
    
    const scaledTolerance = C.ORIGINAL_TOLERANCE_PX * currentScaleFactor;
    const scaledGroundHeight = C.ORIGINAL_GROUND_HEIGHT * verticalScaleFactor;
    const scaledHalfObstacleHeight = (C.ORIGINAL_OBSTACLE_HEIGHT / 2) * verticalScaleFactor;

    const characterBottom = gameContainerRect.bottom - characterRect.bottom;
    const obstacleLeft = obstacleRect.left - gameContainerRect.left;

    const isHorizontalCollision =
        obstacleLeft < (C.CHARACTER_START_LEFT * currentScaleFactor + characterRect.width - scaledTolerance) && 
        (obstacleLeft + obstacleRect.width - scaledTolerance) > (C.CHARACTER_START_LEFT * currentScaleFactor);

    const isVerticalCollision = characterBottom <= scaledGroundHeight + scaledHalfObstacleHeight;
    
    if (isHorizontalCollision && isVerticalCollision) {
        endGame();
    }
}

export function gameLoop() {
    if (!state.isGameRunning || state.isGameOver) return;

    state.score++;
    state.displayScore = Math.floor(state.score / 10);
    dom.scoreDisplay.textContent = `SCORE: ${state.displayScore}`;

    if (state.displayScore > state.lastSpeedUpdateScore + C.SPEED_UPDATE_THRESHOLD) {
        increaseDifficulty();
    }

    checkCollision();
}

export function spawnObstacle() {
    if (!state.isGameRunning) return;

    dom.obstacle.style.animation = `${C.OBSTACLE_ANIMATION_NAME} ${state.gameSpeed}s linear`;
    
    dom.obstacle.onanimationend = () => {
        dom.obstacle.style.animation = 'none'; 
        
        const spawnDelay = Math.random() * (1500 - 500) + 500;
        state.spawnTimeout = setTimeout(spawnObstacle, spawnDelay);
    };
}

export function jump() {
    if (!dom.character.classList.contains('jump') && state.isGameRunning) {
        dom.character.classList.add('jump');
        dom.character.addEventListener('animationend', () => {
            dom.character.classList.remove('jump');
        }, { once: true });
    }
}

export function startGame() {
    if (state.isGameRunning) return;

    dom.homepage.classList.add('hidden');
    dom.character.classList.remove('hidden'); 
    dom.obstacle.classList.remove('hidden');
    dom.scoreDisplay.classList.remove('hidden');

    state.isGameRunning = true;
    dom.character.style.animationPlayState = 'running';
    dom.gameContainer.classList.remove('paused-animations');
    
    spawnObstacle();
    state.gameInterval = setInterval(gameLoop, C.COLLISION_CHECK_INTERVAL_MS);
}

export function resetGame() {
    dom.gameOverScreen.classList.add('hidden');
    dom.gameContainer.classList.remove('paused-animations'); 
    dom.obstacle.removeAttribute('style'); 
    void dom.obstacle.offsetWidth; 

    resetState();

    dom.character.classList.remove('jump'); 
    
    startGame();
}

export function backToMenu() {
    dom.gameOverScreen.classList.add('hidden');
    dom.gameContainer.classList.remove('paused-animations'); 
    
    resetState();

    dom.obstacle.style.animation = 'none'; 
    dom.obstacle.style.right = C.OBSTACLE_WIDTH * -1 + 'px'; 
    dom.character.style.animationPlayState = 'paused';

    dom.homepage.classList.remove('hidden');
    dom.character.classList.add('hidden'); 
    dom.obstacle.classList.add('hidden');
    dom.scoreDisplay.classList.add('hidden');
}