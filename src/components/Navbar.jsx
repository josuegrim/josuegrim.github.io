import React from 'react';
import './Navbar.css';

export default function Navbar({ currentRoute, setRoute }) {
  return (
    <nav className="cyber-navbar">
      {/* El lado izquierdo está intencionalmente vacío para dar espacio al logo metálico */}
      <div className="nav-left"></div>
      
      <div className="nav-right">
        <button 
          className={`nav-btn cursor-target ${currentRoute === 'home' ? 'active' : ''}`}
          onClick={() => setRoute('home')}
        >
          Inicio
        </button>
        <button 
          className={`nav-btn cursor-target ${currentRoute === 'quiz' ? 'active' : ''}`}
          onClick={() => setRoute('quiz')}
        >
          Cuestionario
        </button>
      </div>
    </nav>
  );
}
