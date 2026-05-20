import React, { useState, useEffect } from 'react';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Game from './pages/Game';
import './App.css';
import MetallicPaint from './components/MetallicPaint';
import TargetCursor from './components/TargetCursor';

class ScrollAudioEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Generador de Ruido Blanco para el Viento
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;
    
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.value = 100;
    
    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0;
    
    this.noiseSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.ctx.destination);
    this.noiseSource.start();
    
    this.lastScroll = window.scrollY;
    this.velocity = 0;
    
    // Bucle continuo para calcular inercia
    this.interval = setInterval(() => this.update(), 50);
  }

  update() {
    if (this.ctx.state === 'suspended') return;
    
    const currentScroll = window.scrollY;
    const rawVelocity = Math.abs(currentScroll - this.lastScroll);
    this.lastScroll = currentScroll;
    
    // Suavizado (inercia)
    this.velocity = this.velocity * 0.9 + rawVelocity * 0.1;
    
    // Volumen basado en velocidad (más bajo y sutil)
    let vol = Math.min(this.velocity * 0.003, 0.15);
    if (this.velocity < 0.5) vol = 0;
    
    // Frecuencia (filtro más bajo para que suene como un viento profundo)
    let freq = 100 + (this.velocity * 10);
    if (freq > 800) freq = 800;
    
    this.windGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    this.windFilter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
  }

  resume() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  destroy() {
    clearInterval(this.interval);
    try {
      this.noiseSource.stop();
      this.ctx.close();
    } catch(e) {}
  }
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('home');

  useEffect(() => {
    let scrollEngine = null;

    const initAudio = () => {
      if (!scrollEngine) {
        scrollEngine = new ScrollAudioEngine();
      }
      scrollEngine.resume();
    };

    // Inicializar audio de viento al primer clic (seguridad de navegadores)
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
      if (scrollEngine) scrollEngine.destroy();
    };
  }, []);

  return (
    <div className="app-container">
      <Preloader />
      <TargetCursor spinDuration={1.8} hideDefaultCursor parallaxOn hoverDuration={0.18} />

      {currentRoute !== 'game' && (
        <div className="persistent-logo-card">
          <MetallicPaint
            imageSrc="/logo.png"
            mouseAnimation={false}
            tintColor="#00ebc7"
            speed={0.22}
            brightness={1.8}
            contrast={0.8}
            angle={25}
            refraction={0.01}
            blur={0.02}
            liquid={0.92}
            waveAmplitude={0.95}
            noiseScale={0.35}
            distortion={0.9}
            contour={0.22}
          />
        </div>
      )}
      
      {/* --- NAVBAR CYBERPUNK --- */}
      {currentRoute !== 'game' && <Navbar currentRoute={currentRoute} setRoute={setCurrentRoute} />}

      {/* --- EL FONDO UNIVERSAL LIGERO --- */}
      <div className="universal-bg" style={{ display: currentRoute === 'game' ? 'none' : 'block' }}>
        <div className="bg-layer simple-bg" style={{ opacity: 1, zIndex: 1 }} />
        <div className="bg-vignette"></div>
      </div>

      {/* --- ROUTER SIMPLE SPA --- */}
      <div className="content-layer" style={{ paddingTop: 0 }}>
        {currentRoute === 'home' && <Home />}
        {currentRoute === 'quiz' && <Quiz setRoute={setCurrentRoute} />}
        {currentRoute === 'game' && <Game setRoute={setCurrentRoute} />}
      </div>
    </div>
  );
}
