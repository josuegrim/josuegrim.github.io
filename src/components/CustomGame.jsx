import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Play, RefreshCcw } from 'lucide-react';
import './CustomGame.css';

const GRID_WIDTH = 7;
const GRID_HEIGHT = 8;
const TICK_INTERVAL = 220;
const SPAWN_INTERVAL = 850;

const createNewItem = (id, score) => {
  const x = Math.floor(Math.random() * GRID_WIDTH);
  const dangerFactor = Math.min(0.5, 0.35 + score * 0.002);
  const kind = Math.random() > dangerFactor ? 'good' : 'bad';
  return { id, x, y: 0, kind };
};

export default function CustomGame() {
  const [playerX, setPlayerX] = useState(Math.floor(GRID_WIDTH / 2));
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [highscore, setHighscore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState('idle');
  const [gameKey, setGameKey] = useState(0);

  const nextItemId = useRef(0);
  const intervalRef = useRef(null);
  const spawnRef = useRef(null);
  const audioEffectsRef = useRef({ context: null });
  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const playerXRef = useRef(playerX);

  const playEffect = (type) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioEffectsRef.current.context) {
      audioEffectsRef.current.context = new AudioContext();
    }

    const context = audioEffectsRef.current.context;
    if (context.state === 'suspended') {
      context.resume().catch(() => {});
    }

    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.connect(context.destination);

    const startOscillator = (type, freqStart, freqEnd, duration, wave = 'triangle') => {
      const osc = context.createOscillator();
      osc.type = wave;
      osc.frequency.setValueAtTime(freqStart, now);
      if (freqEnd && freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);
      }
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + duration);
      return osc;
    };

    switch (type) {
      case 'collect': {
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        startOscillator('collect', 520, 880, 0.16, 'triangle');
        break;
      }
      case 'hit': {
        gain.gain.linearRampToValueAtTime(0.16, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        startOscillator('hit', 250, 120, 0.18, 'sawtooth');
        break;
      }
      case 'miss': {
        const bufferSize = context.sampleRate * 0.12;
        const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i += 1) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const noise = context.createBufferSource();
        noise.buffer = buffer;
        noise.connect(gain);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        noise.start(now);
        noise.stop(now + 0.12);
        break;
      }
      case 'gameover': {
        gain.gain.linearRampToValueAtTime(0.22, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        startOscillator('gameover', 180, 70, 0.4, 'square');
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    scoreRef.current = score;
    if (score > highscore) {
      setHighscore(score);
      localStorage.setItem('customGameHighscore', String(score));
    }
  }, [score, highscore]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  useEffect(() => {
    const saved = Number(localStorage.getItem('customGameHighscore') ?? 0);
    if (!Number.isNaN(saved) && saved > 0) {
      setHighscore(saved);
    }
  }, []);

  const clearTimers = () => {
    window.clearInterval(intervalRef.current);
    window.clearInterval(spawnRef.current);
    intervalRef.current = null;
    spawnRef.current = null;
  };

  const startGame = () => {
    clearTimers();
    setPlayerX(Math.floor(GRID_WIDTH / 2));
    setItems([]);
    setScore(0);
    setLives(3);
    setGameState('playing');
    setGameKey((value) => value + 1);
    nextItemId.current = 0;
  };

  const endGame = () => {
    clearTimers();
    setGameState('over');
  };

  const movePlayer = (direction) => {
    setPlayerX((current) => {
      const next = current + direction;
      return Math.max(0, Math.min(GRID_WIDTH - 1, next));
    });
  };

  const getTickInterval = () => Math.max(120, TICK_INTERVAL - Math.floor(score / 40) * 20);
  const getSpawnInterval = () => Math.max(520, SPAWN_INTERVAL - Math.floor(score / 50) * 40);

  useEffect(() => {
    if (gameState !== 'playing') return undefined;

    intervalRef.current = window.setInterval(() => {
      setItems((oldItems) => {
        const nextItems = [];

        oldItems.forEach((item) => {
          const nextY = item.y + 1;

          if (nextY >= GRID_HEIGHT) {
            const hit = item.x === playerXRef.current;
            if (hit) {
              if (item.kind === 'good') {
                setScore(scoreRef.current + 10);
                playEffect('collect');
              } else {
                setLives(Math.max(0, livesRef.current - 1));
                playEffect('hit');
              }
            } else if (item.kind === 'good') {
              setLives(Math.max(0, livesRef.current - 1));
              playEffect('miss');
            }
          } else {
            nextItems.push({ ...item, y: nextY });
          }
        });

        return nextItems;
      });
    }, getTickInterval());

    spawnRef.current = window.setInterval(() => {
      setItems((oldItems) => [...oldItems, createNewItem(nextItemId.current++, score)]);
    }, getSpawnInterval());

    return () => {
      clearTimers();
    };
  }, [gameState, gameKey, score]);

  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      playEffect('gameover');
      endGame();
    }
  }, [lives, gameState]);

  useEffect(() => {
    return () => {
      const context = audioEffectsRef.current.context;
      if (context) {
        context.close().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameState !== 'playing') return;
      if (event.key === 'ArrowLeft') movePlayer(-1);
      if (event.key === 'ArrowRight') movePlayer(1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const getCellContent = (row, col) => {
    const item = items.find((entry) => entry.x === col && entry.y === row);
    if (row === GRID_HEIGHT - 1 && col === playerX) {
      return <span className="custom-game-player">🚀</span>;
    }
    if (!item) return null;
    return item.kind === 'good' ? <span>♻️</span> : <span>💥</span>;
  };

  return (
    <div className="custom-game-root">
      <div className="custom-game-header">
<div>
        <div className="custom-game-title">Mi juego</div>
        <div className="custom-game-subtitle">Mueve el cohete y recoge las esferas verdes. Evita los meteoritos.</div>
      </div>
      <div className="custom-game-status">
        <span>Puntaje: {score}</span>
        <span>Vidas: {lives}</span>
        <span>Récord: {highscore}</span>
        </div>
      </div>

      <div className="custom-game-board" role="grid" aria-label="Tablero de juego">
        {Array.from({ length: GRID_HEIGHT }).map((_, row) => (
          <div key={row} className="custom-game-row">
            {Array.from({ length: GRID_WIDTH }).map((_, col) => (
              <div key={col} className="custom-game-cell">
                {getCellContent(row, col)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="custom-game-controls">
        <button onClick={() => movePlayer(-1)} className="custom-game-button" type="button">
          <ArrowLeft size={20} />
        </button>

        <button onClick={startGame} className="custom-game-action" type="button">
          {gameState === 'playing' ? 'Reiniciar' : gameState === 'over' ? 'Jugar otra vez' : 'Jugar'}
          {gameState === 'playing' ? <RefreshCcw size={18} /> : <Play size={18} />}
        </button>

        <button onClick={() => movePlayer(1)} className="custom-game-button" type="button">
          <ArrowRight size={20} />
        </button>
      </div>

      {(gameState === 'idle' || gameState === 'over') && (
        <div className="custom-game-overlay">
          {gameState === 'idle' ? (
            <>
              Presiona Jugar para comenzar
              <span className="custom-game-small">Flechas izquierda/derecha o botones táctiles</span>
            </>
          ) : (
            <>
              Juego terminado · Puntaje final: {score}
              <span className="custom-game-small">Mejor puntaje: {highscore}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
