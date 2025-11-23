// constants.js

// Costanti Globali di Proporzione (per il calcolo delle collisioni)
export const GAME_AREA_WIDTH = 1000; 
export const GAME_AREA_HEIGHT = 700;
export const ORIGINAL_GROUND_HEIGHT = 50; 
export const ORIGINAL_OBSTACLE_HEIGHT = 60;
export const ORIGINAL_TOLERANCE_PX = 10;

// Dimensioni base degli elementi (per calcolo collisioni)
export const CHARACTER_WIDTH = 60;
export const CHARACTER_START_LEFT = 50;

// Animazione e Gioco
export const OBSTACLE_ANIMATION_NAME = 'slide';

// Configurazione Velocità/Difficoltà
export const INITIAL_GAME_SPEED = 3.0; // Durata iniziale in secondi (più basso = più veloce)
export const MIN_SPEED = 1.0; 
export const SPEED_DECREMENT = 0.4; 
export const SPEED_UPDATE_THRESHOLD = 25; 
export const COLLISION_CHECK_INTERVAL_MS = 100; // Intervallo di controllo collisione