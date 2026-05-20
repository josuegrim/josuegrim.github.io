import React, { useRef, useEffect, useState } from 'react';
import { useFrame, Canvas } from '@react-three/fiber';
import { useTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Motor de Audio Procedural (Web Audio API) - Forzado
class AudioEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Sub-bass drone (45Hz)
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.value = 45;
    this.subGain = this.ctx.createGain();
    this.subGain.gain.value = 0;
    this.subOsc.connect(this.subGain);
    this.subGain.connect(this.ctx.destination);
    this.subOsc.start();

    // Generador de Ruido Blanco para el Whoosh
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;
    
    this.whooshFilter = this.ctx.createBiquadFilter();
    this.whooshFilter.type = 'bandpass';
    this.whooshFilter.Q.value = 1.0;
    
    this.whooshGain = this.ctx.createGain();
    this.whooshGain.gain.value = 0;
    
    this.noiseSource.connect(this.whooshFilter);
    this.whooshFilter.connect(this.whooshGain);
    this.whooshGain.connect(this.ctx.destination);
    this.noiseSource.start();
  }

  update(angle) {
    if (this.ctx.state === 'suspended') return;
    const normalizedAngle = angle % Math.PI; 
    const distToSide = Math.abs(normalizedAngle - (Math.PI / 2));
    
    let intensity = Math.max(0, 1 - (distToSide / 0.6));
    intensity = intensity * intensity;
    
    this.whooshGain.gain.setTargetAtTime(intensity * 0.15, this.ctx.currentTime, 0.05);
    this.whooshFilter.frequency.setTargetAtTime(200 + (intensity * 2500), this.ctx.currentTime, 0.05);

    const droneIntensity = 1 - intensity;
    this.subGain.gain.setTargetAtTime(droneIntensity * 0.4, this.ctx.currentTime, 0.1);
  }

  async forceResume() {
    try {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
    } catch(e) {
      console.warn("Navegador bloqueó el autoplay del sonido cinemático inicial.", e);
    }
  }

  destroy() {
    try {
      this.subOsc.stop();
      this.noiseSource.stop();
      this.ctx.close();
    } catch(e){}
  }
}

const LogoMesh = ({ logoUrl, audioEngine, isActive }) => {
  const meshGroup = useRef();
  const sweepLight = useRef();
  
  const texture = useTexture(logoUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    // Si no está activo (esperando el clic), rota muy lentamente de fondo
    const speed = isActive ? 1.5 : 0.2;
    timeRef.current += delta * speed; 
    const t = timeRef.current;
    
    // Ease-in/out en la rotación (solo si está activo)
    const angle = isActive ? t + Math.sin(t * 2) * -0.45 : t;
    
    if (meshGroup.current) {
      meshGroup.current.rotation.y = angle;
    }

    if (sweepLight.current) {
      const sweepX = Math.sin(t * 2 + Math.PI) * 6;
      sweepLight.current.position.x = sweepX;
      // La luz es débil hasta que inicia
      sweepLight.current.intensity = isActive ? 50 : 5;
    }

    if (audioEngine && isActive) {
      audioEngine.update(angle);
    }
  });

  return (
    <group ref={meshGroup}>
      <spotLight 
        ref={sweepLight}
        position={[0, 0, 4]} 
        intensity={5} 
        color="#ffffff" 
        angle={0.6} 
        penumbra={0.5} 
        distance={10}
      />
      
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[4, 4]} />
        <meshPhysicalMaterial 
          map={texture} 
          transparent={true} 
          alphaTest={0.05}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          color="#c0c0c0"
          side={THREE.FrontSide}
        />
      </mesh>

      <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshPhysicalMaterial 
          map={texture} 
          transparent={true} 
          alphaTest={0.05}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          color="#c0c0c0"
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
};

export default function AnimatedLogo({ logoUrl, isActive }) {
  const [audioEngine, setAudioEngine] = useState(null);

  useEffect(() => {
    // Intento forzado de reproducir audio automáticamente
    if (isActive && !audioEngine) {
      const engine = new AudioEngine();
      engine.forceResume();
      setAudioEngine(engine);
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (audioEngine) audioEngine.destroy();
    };
  }, [audioEngine]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'transparent' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={isActive ? 0.2 : 0.05} />
        <spotLight position={[-5, 5, -5]} intensity={15} color="#ffffff" />
        
        <React.Suspense fallback={null}>
          <LogoMesh logoUrl={logoUrl} audioEngine={audioEngine} isActive={isActive} />
          <Environment preset="studio" />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
