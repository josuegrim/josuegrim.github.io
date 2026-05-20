import React from 'react';

export default function Game() {
  return (
    <div style={{
      color: 'white',
      backgroundColor: '#111',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'sans-serif',
      padding: '24px',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#00ffcc', marginBottom: '20px' }}>Misión: Aguachica Eco-Sim</h1>
      <p style={{ maxWidth: '540px', lineHeight: '1.6', opacity: 0.9 }}>
        El simulador ecológico se está preparando. Si llegaste hasta aquí, la parte de juego está funcionando y pronto verás la experiencia completa.
      </p>
    </div>
  );
}
