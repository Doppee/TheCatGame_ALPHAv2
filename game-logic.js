// game-logic.js

import { dom } from './dom-elements.js';
import { state, resetState } from './game-state.js';
import * as C from './constants.js'; // <-- DEVE ESSERE PRESENTE

// === FUNZIONI PRIVATE ===

function increaseDifficulty() {
    if (state.gameSpeed > C.MIN_SPEED) {
        state.gameSpeed = Math.max(C.MIN_SPEED, state.gameSpeed - C.SPEED_DECREMENT);
        state.lastSpeedUpdateScore = state.displayScore;

        // 🛑 NUOVO: Se l'ostacolo è visibile, aggiorna la sua velocità
        if (!dom.obstacle.classList.contains('hidden')) {
            // Recupera il moltiplicatore di velocità dell'ostacolo attuale.
            // Questo è un placeholder, il modo pulito richiederebbe di tracciare l'ostacolo corrente in `state`.
            // Per una soluzione rapida, applichiamo solo la nuova velocità base *senza* moltiplicatore.
            // La velocità corretta verrà applicata al *prossimo* ostacolo generato.
            // *** In questo contesto, lasciamo la riga originale, ma con l'avviso che potrebbe causare uno scatto temporaneo. ***
            // *** La gestione della velocità corrente è complessa in CSS-only animation. ***

            // dom.obstacle.style.animationDuration = `${state.gameSpeed}s`; // Rimosso/ignorato perché la logica è nel spawn
        }
    }
}

function endGame() {
// ... (invariato)
    state.isGameOver = true;
    state.isGameRunning = false;
    
    clearInterval(state.gameInterval); 
    clearTimeout(state.spawnTimeout); 
    
    dom.gameContainer.classList.add('paused-animations'); 
    dom.character.style.animationPlayState = 'paused';

    dom.finalScoreDisplay.textContent = state.displayScore;
    dom.gameOverScreen.classList.remove('hidden');
}

function resetObstaclePosition() {
    // 1. Pulisce i riferimenti ai timer
    if (state.spawnTimeout) {
        clearTimeout(state.spawnTimeout);
        state.spawnTimeout = null;
    }
    // 2. Rimuove l'animazione in esecuzione e il listener
    dom.obstacle.style.animation = 'none'; 
    dom.obstacle.onanimationend = null;

    // 🛑 NUOVO: Rimuove TUTTE le classi di ostacolo per la pulizia
    C.OBSTACLE_TYPES.forEach(type => {
        dom.obstacle.classList.remove(type.className);
    });

    // 3. Nasconde l'ostacolo
    dom.obstacle.classList.add('hidden'); 

    // 4. Forza la posizione statica di partenza (right)
    dom.obstacle.style.right = `var(--obstacle-start-right)`; 

    // 5. Forza un reflow (fondamentale)
    void dom.obstacle.offsetWidth; 
}

// 🆕 FUNZIONE: Gestisce il ritardo casuale e l'avvio dell'animazione
// 🆕 FUNZIONE: Gestisce il ritardo casuale e l'avvio dell'animazione
function startObstacleLoop() {
    if (!state.isGameRunning) return;
    
    // 1. **SELEZIONE CASUALE DEL NUOVO TIPO DI OSTACOLO**
    const randomIndex = Math.floor(Math.random() * C.OBSTACLE_TYPES.length);
    const newObstacleType = C.OBSTACLE_TYPES[randomIndex]; //

    // 2. **RESET E PULIZIA CLASSI PRECEDENTI**
    // Rimuove l'animazione. 
    dom.obstacle.style.animation = 'none'; 
    
    // Rimuove tutte le classi di tipo ostacolo.
    C.OBSTACLE_TYPES.forEach(type => {
        dom.obstacle.classList.remove(type.className);
    });

    // 🛑 CORREZIONE CHIAVE: Forzare il reflow qui. 
    // Questo è cruciale per assicurare che il browser 'dimentichi' la dimensione e la posizione CSS dell'ostacolo precedente.
    void dom.obstacle.offsetWidth; 

    // 3. **APPLICA LA NUOVA CLASSE**
    // Aggiunge la nuova classe che imposta l'immagine e le variabili CSS (es. --obstacle-width, --obstacle-height).
    dom.obstacle.classList.add(newObstacleType.className); //

    // 4. **CALCOLA LA VELOCITÀ**
    const animationDuration = state.gameSpeed * newObstacleType.speedMultiplier; //
    
    // 5. Imposta il ritardo casuale prima del prossimo ostacolo
    const spawnDelay = Math.random() * (1500 - 500) + 500;
    
    state.spawnTimeout = setTimeout(() => {
        // 6. Rendi visibile e avvia l'animazione (dopo il ritardo)
        dom.obstacle.classList.remove('hidden'); 
        dom.obstacle.style.animation = `${C.OBSTACLE_ANIMATION_NAME} ${animationDuration}s linear`; 
    }, spawnDelay);
}



// === FUNZIONI PUBBLICHE (Esportate) ===

export function checkCollision() {
// ... (invariato)
    if (!state.isGameRunning || state.isGameOver) return;
    
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
// ... (invariato)
    if (!state.isGameRunning || state.isGameOver) return;

    state.score++;
    state.displayScore = Math.floor(state.score / 10);
    dom.scoreDisplay.textContent = `SCORE: ${state.displayScore}`;

    if (state.displayScore > state.lastSpeedUpdateScore + C.SPEED_UPDATE_THRESHOLD) {
        increaseDifficulty();
    }

    checkCollision();
}

// 🛑 RIVISTA: Ora imposta il listener e avvia il primo ciclo
export function spawnObstacle() {
// ... (invariato)
    if (!state.isGameRunning) return;
    
    // Configura il listener UNA SOLA VOLTA.
    dom.obstacle.onanimationend = () => {
        // 1. L'ostacolo è completamente fuori dallo schermo, NASCONDILO.
        dom.obstacle.classList.add('hidden'); 
        // 2. Riavvia il ciclo di spawn/ritardo
        startObstacleLoop(); 
    };
    
    // Avvia il PRIMO ostacolo
    startObstacleLoop();
}


export function jump() {
// ... (invariato)
    if (!dom.character.classList.contains('jump') && state.isGameRunning) {
        dom.character.classList.add('jump');
        dom.character.addEventListener('animationend', () => {
            dom.character.classList.remove('jump');
        }, { once: true });
    }
}

export function startGame() {
// ... (invariato)
    if (state.isGameRunning) return;

    dom.homepage.classList.add('hidden');
    dom.character.classList.remove('hidden'); 
    dom.scoreDisplay.classList.remove('hidden');

    state.isGameRunning = true;
    dom.character.style.animationPlayState = 'running';
    dom.gameContainer.classList.remove('paused-animations');
    
    spawnObstacle();
    state.gameInterval = setInterval(gameLoop, C.COLLISION_CHECK_INTERVAL_MS);
}

export function resetGame() {
// ... (invariato)
    dom.gameOverScreen.classList.add('hidden');
    dom.gameContainer.classList.remove('paused-animations'); 
    
    resetObstaclePosition(); 

    resetState();

    dom.character.classList.remove('jump'); 
    
    startGame();
}

export function backToMenu() {
// ... (invariato)
    dom.gameOverScreen.classList.add('hidden');
    dom.gameContainer.classList.remove('paused-animations'); 
    
    resetState();

    resetObstaclePosition(); 

    dom.character.style.animationPlayState = 'paused';

    dom.homepage.classList.remove('hidden');
    dom.character.classList.add('hidden'); 
    dom.obstacle.classList.add('hidden');
    dom.scoreDisplay.classList.add('hidden');
}