import React, { useState, useEffect } from 'react';
import logoUrl from '../../logo.png';
import AnimatedLogo from './AnimatedLogo';
import './Preloader.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color:'red', padding:'50px', zIndex:99999, position:'relative'}}>
        <h1>Error en Preloader:</h1>
        <pre>{this.state.error?.toString()}</pre>
        <pre>{this.state.error?.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

function PreloaderContent() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasClicked, setHasClicked] = useState(false);

  useEffect(() => {
    if (!hasClicked) return;

    // Simular carga del 0% al 100% en 4 segundos
    const duration = 4000;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress(Math.min((currentStep / steps) * 100, 100));

      if (currentStep >= steps) {
        clearInterval(timer);
        // Cuando llega al 100%, inicia el fundido para entrar
        setIsFading(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 1000);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [hasClicked]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !hasClicked) return;
    const fallback = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setIsVisible(false), 500);
    }, 7000);
    return () => clearTimeout(fallback);
  }, [isVisible, hasClicked]);

  if (!isVisible) return null;

  return (
    <div className={`preloader-container ${isFading ? 'fade-out' : ''}`}>
      {/* Nuevo Logo Animado 3D */}
      <div className="animated-logo-wrapper" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <AnimatedLogo logoUrl={logoUrl} isActive={hasClicked} />
      </div>

      {!hasClicked && (
        <div 
          onClick={() => setHasClicked(true)}
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
            zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            cursor: 'pointer', background: 'rgba(0, 0, 0, 0.72)'
          }}
        >
          {/* Un toque muy elegante para invitar al clic, posicionado abajo para no tapar el logo */}
          <div style={{ position: 'absolute', bottom: '20%' }}>
            <h2 style={{ 
              color: '#ffffff', fontFamily: 'Inter', fontSize: '1rem', letterSpacing: '6px', 
              textTransform: 'uppercase', animation: 'pulseText 2s infinite', opacity: 0.7,
              textShadow: '0 2px 10px rgba(0,0,0,0.8)'
            }}>
              — Haz clic en la pantalla para entrar —
            </h2>
          </div>
        </div>
      )}

      {/* Barra de carga blanca brillante */}
      <div className="loading-bar-wrapper" style={{ opacity: hasClicked ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        <div className="loading-bar-fill" style={{ width: `${progress}%` }}></div>
        <div className="loading-bar-text">Iniciando Experiencia... {Math.round(progress)}%</div>
      </div>
    </div>
  );
}

export default function Preloader() {
  return (
    <ErrorBoundary>
      <PreloaderContent />
    </ErrorBoundary>
  );
}
