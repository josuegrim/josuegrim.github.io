import React, { useRef, useEffect } from 'react';

export default function PixelatedLogo({ src, size = 80, pixelSize = 4 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = new Image();
    img.src = src;
    img.onload = () => {
      // Calculamos la resolución interna reducida
      const internalSize = size / pixelSize;
      
      // Ajustar el canvas interno al tamaño en baja resolución
      canvas.width = internalSize;
      canvas.height = internalSize;

      // Desactivar el suavizado (anti-aliasing) en el canvas
      ctx.imageSmoothingEnabled = false;

      // Dibujar la imagen original comprimida en el canvas pequeño
      ctx.drawImage(img, 0, 0, internalSize, internalSize);
    };
  }, [src, size, pixelSize]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: size, 
        height: size, 
        imageRendering: 'pixelated', // Fuerza a escalar la imagen sin suavizar (bloques)
        filter: 'drop-shadow(4px 4px 0 rgba(0,0,0,0.5))'
      }} 
    />
  );
}
