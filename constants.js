// constants.js

// Costanti Globali di Proporzione (per il calcolo delle collisioni)
export const GAME_AREA_WIDTH = 1000; 
export const GAME_AREA_HEIGHT = 700;
export const ORIGINAL_GROUND_HEIGHT = 50; 
export const ORIGINAL_OBSTACLE_HEIGHT = 60;
export const ORIGINAL_TOLERANCE_PX = 0;

// Dimensioni base degli elementi (per calcolo collisioni)
export const CHARACTER_WIDTH = 60;
export const CHARACTER_START_LEFT = 50;

// === NUOVE COSTANTI SALTO (RIVISTE) ===
export const MAX_JUMP_DURATION_MS = 500; // Massimo 1 secondo di mantenimento

// Parametri di movimento (Ricalibrati per rendere il salto dipendente dall'Hold)
export const JUMP_IMPULSE_VH_PER_TICK = 0.1; 
// 🛑 MODIFICA CHIAVE 2: Aumenta la spinta hold per contrastare la gravità
export const HOLD_THRUST_VH_PER_TICK = 0.1; 
// 🛑 MODIFICA CHIAVE 3: Riduciamo leggermente la gravità per dare spazio alla spinta
export const GRAVITY_VH_PER_TICK = 0.05; 
// ...

// Altezza massima di riferimento
export const MAX_JUMP_HEIGHT_VH = 40.57; // Altezza massima raggiungibile col 'hold'
export const INITIAL_JUMP_VH = 5.54; // Altezza base del gatto (dal suolo)
export const MAX_JUMPS = 2; // Numero massimo di salti consecutivi

// Animazione e Gioco
export const OBSTACLE_ANIMATION_NAME = 'slide';

// 🆕 NUOVO: Definizione dei diversi tipi di ostacoli
export const OBSTACLE_TYPES = [
    {
        className: 'obstacle-car',
        speedMultiplier: 1.0, // Velocità base
        // Devi aggiornare C.ORIGINAL_OBSTACLE_HEIGHT se i veicoli hanno altezze diverse per la collisione
        originalHeight: 60, 
    },
    {
        className: 'obstacle-truck',
        speedMultiplier: 1.5, // Più lento (durata animazione = 3.0s * 1.5 = 4.5s)
        originalHeight: 90, // Un camion è più alto
    },
    {
        className: 'obstacle-sportscar',
        speedMultiplier: 0.7, // Più veloce (durata animazione = 3.0s * 0.7 = 2.1s)
        originalHeight: 50, // Un'auto sportiva è più bassa
    }
];

// Configurazione Velocità/Difficoltà
export const INITIAL_GAME_SPEED = 3.5; // Durata iniziale in secondi (più basso = più veloce)
export const MIN_SPEED = 2.0; 
export const SPEED_DECREMENT = 2.5; 
export const SPEED_UPDATE_THRESHOLD = 40; 
export const COLLISION_CHECK_INTERVAL_MS = 16; 



// === NUOVE COSTANTI MONETE ===
export const COIN_WIDTH_VW = 3; 
export const COIN_HEIGHT_VH = 4.29; 
export const COIN_COLLECTION_VALUE = 10; // Punti aggiunti al punteggio
export const COIN_GROUND_HEIGHT = 5.54; // vh (Stessa altezza 'bottom' del personaggio)
export const MIN_DISTANCE_BETWEEN_PATTERNS_SCORE = 5; // Punteggio minimo per il prossimo spawn
export const MAX_DISTANCE_BETWEEN_PATTERNS_SCORE = 10; // Punteggio massimo per il prossimo spawn (più alto = più raro)




// [ {x: offset_orizzontale_in_px, y: offset_verticale_in_px_dal_suolo} ]
export const COIN_PATTERNS = [
    // Pattern 1: Linea orizzontale a terra
    [
        { x: 0, y: 0 },
        { x: 60, y: 0 },
        { x: 120, y: 0 },
    ],
    // Pattern 2: Diagonale ascendente (richiede un salto a metà)
    [
        { x: 0, y: 0 },
        { x: 40, y: 30 },
        { x: 80, y: 60 }, // Il punto più alto
        { x: 120, y: 30 },
    ],
    // Pattern 3: Cluster in aria
    [
        { x: 0, y: 90 },
        { x: 30, y: 90 },
        { x: 15, y: 120 }, // Moneta centrale più alta
    ]

    

    
];