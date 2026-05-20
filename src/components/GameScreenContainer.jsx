import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import PixelatedLogo from './PixelatedLogo';
import './GameScreenContainer.css';

export default function GameScreenContainer({ children, onExit, hideControls = false, initialFullScreen = false }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef(null);
  
  const audioRef = useRef({
    context: null,
    masterGain: null,
    intervalId: null,
  });

  const DEFAULT_VOLUME = 0.18;

  const startAudioOnInteraction = () => {
    if (audioRef.current.context) {
      if (audioRef.current.context.state === 'suspended') {
        audioRef.current.context.resume().catch(() => {});
      }
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const masterGain = context.createGain();
    masterGain.gain.value = DEFAULT_VOLUME;
    masterGain.connect(context.destination);

    const melodyPattern = [220, 196, 174.61, 165, 155.56, 146.83, 138.59, 130.81];
    const bassPattern = [65.41, 73.42, 82.41, 73.42, 65.41, 55, 61.74, 65.41];
    const bellPattern = [329.63, 293.66, 261.63, 233.08];
    const stepLength = 0.8;
    let currentStep = 0;

    const playVoice = ({ frequency, duration, type = 'triangle', attack = 0.05, release = 0.32, filterFreq = 950, volume = 0.12 }) => {
      const now = context.currentTime;
      const osc = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.value = filterFreq;
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.06);
    };

    const playPulse = () => {
      const now = context.currentTime;
      const noiseBuffer = context.createBuffer(1, context.sampleRate * 0.08, context.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / data.length) * 0.5;
      }
      const noise = context.createBufferSource();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.value = 360;
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      noise.buffer = noiseBuffer;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start(now);
      noise.stop(now + 0.2);
    };

    const playDrone = () => {
      const now = context.currentTime;
      const osc = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.value = 320;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.065, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + stepLength * 4 + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + stepLength * 4 + 0.35);
    };

    const playStep = () => {
      const melodyFreq = melodyPattern[currentStep % melodyPattern.length];
      const bassFreq = bassPattern[currentStep % bassPattern.length];
      const bellFreq = bellPattern[currentStep % bellPattern.length];

      if (currentStep % 4 === 0) {
        playDrone();
      }

      playVoice({ frequency: bassFreq, duration: stepLength * 1.6, type: 'sawtooth', attack: 0.08, release: 0.38, filterFreq: 420, volume: 0.095 });
      playVoice({ frequency: melodyFreq * (currentStep % 2 === 0 ? 1.0 : 1.5), duration: stepLength * 0.94, type: 'square', attack: 0.05, release: 0.28, filterFreq: 1020, volume: 0.16 });
      if (currentStep % 3 === 0) {
        playVoice({ frequency: bellFreq * 1.4, duration: stepLength * 0.88, type: 'triangle', attack: 0.03, release: 0.38, filterFreq: 1220, volume: 0.1 });
      }
      playPulse();
      currentStep += 1;
    };

    playStep();
    const intervalId = window.setInterval(playStep, stepLength * 1000);

    audioRef.current = { context, masterGain, intervalId };
  };

  // 1. Control del ciclo de vida de la música de fondo
  useEffect(() => {
    window.addEventListener('click', startAudioOnInteraction);
    window.addEventListener('touchstart', startAudioOnInteraction);
    window.addEventListener('pointerdown', startAudioOnInteraction);
    window.addEventListener('keydown', startAudioOnInteraction);

    return () => {
      if (audioRef.current.intervalId) {
        window.clearInterval(audioRef.current.intervalId);
      }
      if (audioRef.current.context) {
        audioRef.current.context.close().catch(() => {});
      }
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
      window.removeEventListener('pointerdown', startAudioOnInteraction);
      window.removeEventListener('keydown', startAudioOnInteraction);
    };
  }, []);

  // 2. Función para silenciar/activar música
  const toggleMute = () => {
    const masterGain = audioRef.current.masterGain;

    if (!masterGain) {
      setIsMuted(!isMuted);
      return;
    }

    masterGain.gain.value = isMuted ? DEFAULT_VOLUME : 0;
    setIsMuted(!isMuted);
  };

  // 3. Función para alternar Pantalla Completa
  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch((err) => console.error(`Error al activar pantalla completa: ${err.message}`));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Escuchar si el usuario sale de pantalla completa con la tecla ESC
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  useEffect(() => {
    if (!initialFullScreen || !containerRef.current) return;
    if (document.fullscreenElement) {
      setIsFullScreen(true);
      return;
    }

    const requestFullscreen = async () => {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullScreen(true);
      } catch (error) {
        // El navegador puede bloquear fullscreen automático sin interacción.
      }
    };

    requestFullscreen();
  }, [initialFullScreen]);



  return (
    <div ref={containerRef} className="gsc-wrapper">
      {!hideControls && (
        <>
          {/* Esquina Superior Izquierda: Botón de Regresar/Salir */}
          <div className="gsc-top-left" style={{ marginLeft: '80px' }}>
            <button onClick={onExit} className="gsc-btn gsc-btn-text">
              <ArrowLeft size={18} />
              <span>SALIR</span>
            </button>
          </div>

          {/* Esquina Superior Derecha: Controles de Audio y Pantalla */}
          <div className="gsc-top-right">
            {/* Botón de Silencio */}
            <button 
              onClick={toggleMute}
              title={isMuted ? "Activar sonido" : "Silenciar sonido"}
              className="gsc-btn gsc-btn-icon"
            >
              {isMuted ? <VolumeX size={20} color="#f87171" /> : <Volume2 size={20} />}
            </button>

            {/* Botón de Pantalla Completa */}
            <button 
              onClick={toggleFullScreen}
              title={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
              className="gsc-btn gsc-btn-icon"
            >
              {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>

          {/* Logo pixel-art centrado en la parte superior (visible en pantalla completa) */}
          <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '90px', height: '90px', zIndex: 100, pointerEvents: 'none' }}>
            <PixelatedLogo src="/logo.png" size={90} pixelSize={2} />
          </div>
        </>
      )}

      {/* LIENZO DEL JUEGO */}
      <div className="gsc-content" style={{ pointerEvents: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
