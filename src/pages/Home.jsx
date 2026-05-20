import React from 'react';
import SpotlightCard from '../components/SpotlightCard';
import ModelViewer from '../components/ModelViewer';
import './Home.css';

const floodImages = [
  'https://source.unsplash.com/900x600/?flood,river',
  'https://source.unsplash.com/900x600/?flooded,street',
  'https://source.unsplash.com/900x600/?muddy,water'
];

const healthImages = [
  'https://source.unsplash.com/900x600/?public,health',
  'https://source.unsplash.com/900x600/?clinic,doctor',
  'https://source.unsplash.com/900x600/?hospital,patient'
];

const cultureImages = [
  'https://source.unsplash.com/900x600/?community,people',
  'https://source.unsplash.com/900x600/?local,village',
  'https://source.unsplash.com/900x600/?community,meeting'
];

export default function Home() {
  const handleFullscreen = () => {
    const element = document.documentElement;
    
    // Si ya está en pantalla completa, salir
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      return;
    }
    
    // Si no está en pantalla completa, entrar
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  return (
    <div className="home-wrapper">
      <button className="fullscreen-btn" onClick={handleFullscreen} title="Pantalla completa">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
      </button>
      <div className="vertical-scroll-container">
        
          {/* =========================================
              1. HERO SECTION
          ========================================= */}
          <section className="vertical-section hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Crisis Ambiental <br/><span className="text-cyan">en Aguachica</span></h1>
              <p className="hero-subtitle">
                Pensamiento Sistémico aplicado a residuos sólidos, salud pública y sostenibilidad urbana.
              </p>
              <div className="home-author-card">
                <p className="author-card-label">Autores</p>
                <p>Jesue Emanuel Grimaldo León</p>
                <p>Gustavo Alberto Rizo Nieto</p>
              </div>
              <div className="scroll-indicator">
                <div className="mouse"></div>
                <p>Desliza para explorar</p>
              </div>
            </div>
            
            <div className="hero-3d-model">
              <ModelViewer
                url="/models/WaterBottle.glb"
                width="100%"
                height="100%"
                defaultRotationX={-20}
                defaultRotationY={15}
                defaultZoom={1.4}
                minZoomDistance={0.4}
                maxZoomDistance={4}
                enableMouseParallax={true}
                enableManualRotation={true}
                enableHoverRotation={true}
                enableManualZoom={true}
                environmentPreset="city"
                autoFrame={false}
                autoRotate={true}
                autoRotateSpeed={0.06}
                fadeIn={true}
              />
            </div>
          
          {/* Partículas flotantes CSS */}
          <div className="particles-container">
            {[...Array(15)].map((_, i) => (
              <div key={i} className={`particle p-${i}`}></div>
            ))}
          </div>
        </section>

        {/* =========================================
            2. LA ANATOMÍA DEL PROBLEMA
        ========================================= */}
        <section className="horizontal-section cards-section">
          <div className="section-header">
            <h2>La Anatomía del Problema</h2>
            <p>Fallas estructurales que transforman la ciudad en un botadero satélite.</p>
          </div>
          <div className="cards-track">
            <SpotlightCard className="glass-card sys-card" spotlightColor="rgba(239, 68, 68, 0.35)">
              <h3>Deficiencias de Recolección</h3>
              <p>Irregularidades en las rutas de los camiones compactadores generan focos constantes de basura en esquinas y vías principales.</p>
            </SpotlightCard>
            
            <SpotlightCard className="glass-card sys-card" spotlightColor="rgba(239, 68, 68, 0.35)">
              <h3>El Caño El Pital</h3>
              <p>Este pulmón de la ciudad se ha transformado en un vertedero ilegal de escombros y plásticos, asfixiando la flora local.</p>
            </SpotlightCard>

            <SpotlightCard className="glass-card sys-card" spotlightColor="rgba(239, 68, 68, 0.35)">
              <h3>Lotes Baldíos</h3>
              <p>La falta de encerramiento en terrenos privados los convierte en botaderos masivos, filtrando lixiviados tóxicos al suelo.</p>
            </SpotlightCard>
          </div>
        </section>

        {/* =========================================
            3. IMPACTO EN SALUD PÚBLICA
        ========================================= */}
        <section className="horizontal-section cards-section">
          <div className="section-header">
            <h2>Impacto en Salud Pública</h2>
            <p>Una crisis sanitaria originada por el agua estancada y la quema ilegal.</p>
          </div>
          <div className="cards-track">
            <SpotlightCard className="glass-card sys-card" spotlightColor="rgba(239, 68, 68, 0.35)">
              <h3>Dengue y Vectores</h3>
              <p>Las llantas y tapas acumulan agua, creando criaderos perfectos para el mosquito Aedes aegypti, desatando epidemias de Dengue y Zika.</p>
            </SpotlightCard>

            <SpotlightCard className="glass-card sys-card" spotlightColor="rgba(239, 68, 68, 0.35)">
              <h3>Afecciones Respiratorias</h3>
              <p>La quema clandestina de basuras libera dioxinas tóxicas, provocando picos de asma y bronquitis en la población infantil.</p>
            </SpotlightCard>

            <SpotlightCard className="glass-card sys-card" spotlightColor="rgba(239, 68, 68, 0.35)">
              <h3>Infecciones Gastrointestinales</h3>
              <p>Contaminación cruzada por vectores mecánicos (moscas) desde botaderos hacia alimentos en zonas residenciales cercanas.</p>
            </SpotlightCard>
          </div>
        </section>

        {/* =========================================
            4. CAMINOS HACIA LA SOLUCIÓN
        ========================================= */}
        <section className="horizontal-section cards-section">
          <div className="section-header">
            <h2 className="text-cyan">Caminos hacia la Solución</h2>
            <p>Intervención multisectorial, ingeniería logística y compromiso ciudadano.</p>
          </div>
          <div className="cards-track">
            <SpotlightCard className="glass-card sys-card" spotlightColor="rgba(0, 235, 199, 0.4)">
              <h3>Educación Ambiental</h3>
              <p>Cátedras obligatorias en colegios sobre economía circular y separación en la fuente, focalizadas en barrios críticos.</p>
            </SpotlightCard>
            
            <SpotlightCard className="glass-card sys-card" spotlightColor="rgba(0, 235, 199, 0.4)">
              <h3>Plantas de Aprovechamiento</h3>
              <p>Procesamiento de plásticos e insumos orgánicos, generando empleo digno para recicladores y reduciendo volumen en botaderos.</p>
            </SpotlightCard>

            <SpotlightCard className="glass-card sys-card" spotlightColor="rgba(0, 235, 199, 0.4)">
              <h3>Logística Urbana</h3>
              <p>Rediseño de rutas georreferenciadas con GPS y aplicación estricta de comparendos a industrias contaminantes.</p>
            </SpotlightCard>
            
            <SpotlightCard className="glass-card sys-card" spotlightColor="rgba(0, 235, 199, 0.4)">
              <h3>Reforestación del Pital</h3>
              <p>Limpieza de escombros y siembra de especies nativas para recuperar el ecosistema hídrico del Caño El Pital.</p>
            </SpotlightCard>
          </div>
        </section>

        {/* Espacio extra al final para respirar */}
        <div style={{height: '100px'}}></div>
      </div>
    </div>
  );
}
