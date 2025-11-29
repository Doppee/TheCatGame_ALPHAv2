// game-logic.js

import { dom } from './dom-elements.js';
import { state, resetState } from './game-state.js';
import * as C from './constants.js'; // <-- DEVE ESSERE PRESENTE


let nextCoinSpawnThreshold = C.MIN_DISTANCE_BETWEEN_PATTERNS_SCORE; 

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

// 🆕 NUOVO: Funzione che gestisce la logica di movimento verticale (Salto, Hold, Gravità)
function updateCharacterPosition() {
    if (!state.isGameRunning || state.isGameOver) return;
    
    const timeElapsed = Date.now() - state.jumpStartTime;
    
    // 1. LOGICA DI SPINTA (HOLD)
    // Applica spinta aggiuntiva (che contrasta la Gravità) solo se si sta tenendo premuto, 
    // non è scaduto il tempo e non ha raggiunto l'altezza max.
    if (state.isHoldingJump && timeElapsed < C.MAX_JUMP_DURATION_MS && state.currentJumpHeightVH < C.MAX_JUMP_HEIGHT_VH) {
        state.verticalVelocityVH += C.HOLD_THRUST_VH_PER_TICK;
    } 
    
    // Forziamo la fine del hold se il tempo è scaduto
    if (state.isHoldingJump && timeElapsed >= C.MAX_JUMP_DURATION_MS) {
        stopJumpHold();
    }


    // 2. LOGICA DI GRAVITÀ
    // La gravità si applica sempre.
    state.verticalVelocityVH -= C.GRAVITY_VH_PER_TICK; 

    // 3. AGGIORNAMENTO ALTEZZA
    state.currentJumpHeightVH += state.verticalVelocityVH;

    // 4. CHECK CONDIZIONE A TERRA
    if (state.currentJumpHeightVH <= C.INITIAL_JUMP_VH) {
        state.currentJumpHeightVH = C.INITIAL_JUMP_VH;
        state.verticalVelocityVH = 0; 
        state.isJumping = false; 
        state.currentJumps = 0; 
        state.isHoldingJump = false; 
    }
    
    // 5. CHECK LIMITE ALTEZZA
    if (state.currentJumpHeightVH > C.MAX_JUMP_HEIGHT_VH) {
        state.currentJumpHeightVH = C.MAX_JUMP_HEIGHT_VH;
        if (state.verticalVelocityVH > 0) {
            state.verticalVelocityVH = 0; 
        }
    }
    
    // 6. Applica la nuova altezza al DOM
    dom.character.style.bottom = `${state.currentJumpHeightVH}vh`;
}

// === FUNZIONI PUBBLICHE (Esportate) ===

export function checkCollision() {
    if (!state.isGameRunning || state.isGameOver) return;
    
    // Ottenere i rettangoli di delimitazione attuali (Bounding Box)
    // Questo è il modo più affidabile per ottenere la posizione in pixel corrente.
    const characterRect = dom.character.getBoundingClientRect();
    const obstacleRect = dom.obstacle.getBoundingClientRect();
    
    // --- 1. Collisione Orizzontale (AABB standard) ---
    // La collisione avviene se:
    // Il lato sinistro del gatto è a sinistra del lato destro dell'ostacolo, E
    // Il lato destro del gatto è a destra del lato sinistro dell'ostacolo.
    const isHorizontalCollision =
        characterRect.left < obstacleRect.right && 
        characterRect.right > obstacleRect.left;   

    // --- 2. Collisione Verticale (AABB standard) ---
    // La collisione avviene se c'è intersezione verticale.
    // L'altezza dell'ostacolo (originalHeight) non è dinamica, quindi il Bounding Box è più accurato.
    const isVerticalCollision = 
        characterRect.top < obstacleRect.bottom &&
        characterRect.bottom > obstacleRect.top;
    
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

if (state.displayScore % C.SPEED_UPDATE_THRESHOLD === 0 && state.displayScore !== 0) {
        increaseDifficulty();
    }
    
    updateCharacterPosition();
    checkCollision();
    checkCoinCollection(); // Controlla se il gatto ha raccolto monete
    cleanupCoins();


    
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
    // 🛑 Rimuovi il vecchio corpo della funzione jump() basato sul CSS
    if (!state.isGameRunning || state.isGameOver) return;

    // Applica il salto se il numero di salti attuali è inferiore al massimo
    if (state.currentJumps < C.MAX_JUMPS) {
        
        // 1. Applica l'impulso iniziale di salto
        state.verticalVelocityVH = C.JUMP_IMPULSE_VH_PER_TICK; 
        
        // 2. Imposta lo stato di hold e il timestamp per il limite di 3 secondi
        state.isHoldingJump = true;
        state.isJumping = true;
        state.currentJumps++;
        state.jumpStartTime = Date.now();
    }
}

// 🆕 NUOVO: Funzione per gestire il rilascio del tasto (fine del Hold)
export function stopJumpHold() {
    // 1. Interrompe immediatamente la spinta aggiuntiva
    state.isHoldingJump = false;
    
    // 2. Potenziamo l'effetto della gravità immediata
    if (state.verticalVelocityVH > 0) {
        // Se stava salendo, azzeriamo la sua velocità
        state.verticalVelocityVH = 0; 
    } else {
        // Se stava già scendendo o era fermo, gli diamo un piccolo kick verso il basso
        state.verticalVelocityVH = Math.min(state.verticalVelocityVH, -C.GRAVITY_VH_PER_TICK); 
    }
}

function updateCoinDisplay() {
    // Assicurati che il display sia visibile quando viene aggiornato
    dom.coinCountDisplay.classList.remove('hidden'); 
    dom.coinCountDisplay.textContent = `💰 ${state.coins}`;
}

// Funzione per creare e posizionare una moneta
function createCoinElement(x_offset_px, y_offset_px) {
    const coinEl = document.createElement('div');
    coinEl.classList.add('coin');
    dom.coinContainer.appendChild(coinEl);

    const animationDuration = state.gameSpeed; 
    coinEl.style.animationDuration = `${animationDuration}s`;

    // Calcola la posizione 'bottom' basata sull'offset Y (in vh)
    const y_vh = C.COIN_GROUND_HEIGHT + (y_offset_px / C.GAME_AREA_HEIGHT * 100);
    coinEl.style.bottom = `${y_vh}vh`;
    
    // Posizionamento orizzontale
    coinEl.style.right = '0'; 
    coinEl.style.transform = `translateX(${x_offset_px}px)`; // Offset all'interno del pattern
    
    const coinData = {
        domElement: coinEl,
        spawnOffset: x_offset_px, 
        isCollected: false,
    };
    
    state.activeCoins.push(coinData);
    return coinData;
}



// Funzione per generare un pattern (AGGIUNTA CASUALITÀ)
function spawnCoinPattern() {
    if (!state.isGameRunning) {
        // Riprogramma per il prossimo check se il gioco non è attivo
        state.coinSpawnTimeout = setTimeout(spawnCoinPattern, 500); 
        return;
    }

    // 1. Condizione di spawn: Controlla se il punteggio attuale ha raggiunto la soglia calcolata.
    // L'unica eccezione è all'inizio del gioco (stato.lastCoinSpawnScore è 0) per garantire un primo spawn
    const hasSpawnDistancePassed = state.displayScore >= state.lastCoinSpawnScore + nextCoinSpawnThreshold;
    const isFirstSpawn = state.lastCoinSpawnScore === 0;

    if (!isFirstSpawn && !hasSpawnDistancePassed) {
        // Se non è il momento, riprogramma il check tra 500ms e RITORNA.
        state.coinSpawnTimeout = setTimeout(spawnCoinPattern, 500); 
        return; 
    }

    // 2. Se arriviamo qui, l'elemento DEVE spawnare.
    const patternIndex = Math.floor(Math.random() * C.COIN_PATTERNS.length);
    const pattern = C.COIN_PATTERNS[patternIndex];
    
    pattern.forEach(coinPos => {
        createCoinElement(coinPos.x, coinPos.y); 
    });

    // 3. Aggiorna lo score dell'ultimo spawn.
    state.lastCoinSpawnScore = state.displayScore;
    
    // 4. 🆕 CRITICO: Calcola la PROSSIMA soglia di spawn in modo casuale.
    nextCoinSpawnThreshold = Math.floor(
        Math.random() * (C.MAX_DISTANCE_BETWEEN_PATTERNS_SCORE - C.MIN_DISTANCE_BETWEEN_PATTERNS_SCORE + 1)
    ) + C.MIN_DISTANCE_BETWEEN_PATTERNS_SCORE;

    // 5. Riprogramma il prossimo check (usando un delay fisso, dato che la casualità è gestita dal punteggio)
    state.coinSpawnTimeout = setTimeout(spawnCoinPattern, 500);
}



function checkCoinCollection() {
    const characterRect = dom.character.getBoundingClientRect();
    const charLeft = characterRect.left;
    const charRight = characterRect.right;
    const charTop = characterRect.top;
    const charBottom = characterRect.bottom;
    
    let isCollected = false;

    // Iteriamo all'indietro per rimuovere elementi in modo sicuro
    for (let i = state.activeCoins.length - 1; i >= 0; i--) {
        const coin = state.activeCoins[i];
        if (coin.isCollected) continue;

        const coinRect = coin.domElement.getBoundingClientRect();
        
        // Collisione Bounding Box
        const isColliding = 
            charLeft < coinRect.right &&
            charRight > coinRect.left &&
            charTop < coinRect.bottom &&
            charBottom > coinRect.top;

        if (isColliding) {
            coin.isCollected = true; 
            coin.domElement.remove(); 
            state.coins += 1; 
            state.score += C.COIN_COLLECTION_VALUE; 
            isCollected = true;
            
            // Rimuovi la moneta dall'array activeCoins
            state.activeCoins.splice(i, 1);
        }
    }
    
    if (isCollected) {
        updateCoinDisplay();
    }
}

// Funzione di pulizia: rimuove monete raccolte o fuori schermo
function cleanupCoins() {
    const coinsToKeep = [];
    
    // Pulisce l'array originale
    for (let i = state.activeCoins.length - 1; i >= 0; i--) {
        const coin = state.activeCoins[i];
        const coinRect = coin.domElement.getBoundingClientRect();

        // Rimuovi se raccolta O se è fuori dallo schermo a sinistra (left < 0)
        if (coin.isCollected || coinRect.right < 0) {
            coin.domElement.remove();
            state.activeCoins.splice(i, 1);
        }
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
    
    // Inizializza la prima soglia di spawn qui o nel resetState per sicurezza
    nextCoinSpawnThreshold = Math.floor(
        Math.random() * (C.MAX_DISTANCE_BETWEEN_PATTERNS_SCORE - C.MIN_DISTANCE_BETWEEN_PATTERNS_SCORE + 1)
    ) + C.MIN_DISTANCE_BETWEEN_PATTERNS_SCORE;

    spawnObstacle();

    dom.coinCountDisplay.classList.remove('hidden');
    updateCoinDisplay();
    spawnCoinPattern(); 

    
    state.gameInterval = setInterval(gameLoop, C.COLLISION_CHECK_INTERVAL_MS);
}

export function resetGame() {
// ... (invariato)
    dom.gameOverScreen.classList.add('hidden');
    dom.gameContainer.classList.remove('paused-animations'); 
    
    resetObstaclePosition(); 

    resetState();
    
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