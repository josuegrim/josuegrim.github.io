/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unknown-property */
import { Suspense, useRef, useLayoutEffect, useEffect, useMemo, isValidElement } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useFBX, useProgress, Html, Environment, ContactShadows, useTexture, Decal } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader';
import * as THREE from 'three';

const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
const deg2rad = d => (d * Math.PI) / 180;
const DECIDE = 8; const ROTATE_SPEED = 0.005; const INERTIA = 0.925; const PARALLAX_MAG = 0.05; const PARALLAX_EASE = 0.12; const HOVER_MAG = deg2rad(6); const HOVER_EASE = 0.15;

const Loader = ({ placeholderSrc }) => {
  const { progress, active } = useProgress();
  if (!active && placeholderSrc) return null;
  return <Html center>{placeholderSrc ? <img src={placeholderSrc} width={128} height={128} style={{ filter: 'blur(8px)', borderRadius: 8 }} /> : `${Math.round(progress)} %`}</Html>;
};

const DesktopControls = ({ pivot, min, max, zoomEnabled }) => {
  const ref = useRef(null);
  useFrame(() => ref.current?.target.copy(pivot));
  return <OrbitControls ref={ref} makeDefault enablePan={false} enableRotate={false} enableZoom={zoomEnabled} minDistance={min} maxDistance={max} />;
};

const ModelInner = ({ url, xOff, yOff, pivot, initYaw, initPitch, minZoom, maxZoom, enableMouseParallax, enableManualRotation, enableHoverRotation, enableManualZoom, autoFrame, fadeIn, autoRotate, autoRotateSpeed, onLoaded, makePlastic, logoDecal }) => {
  const outer = useRef(null); const inner = useRef(null); const { camera, gl, invalidate } = useThree();
  const vel = useRef({ x: 0, y: 0 }); const tPar = useRef({ x: 0, y: 0 }); const cPar = useRef({ x: 0, y: 0 }); const tHov = useRef({ x: 0, y: 0 }); const cHov = useRef({ x: 0, y: 0 });
  const ext = useMemo(() => url.split('.').pop().toLowerCase(), [url]);
  const decalTex = useTexture(logoDecal || '/logo.png');
  
  const content = useMemo(() => {
    if (ext === 'glb' || ext === 'gltf') {
      const gltf = useGLTF(url);
      if (makePlastic && gltf.nodes && gltf.nodes.WaterBottle) {
        // Calcular dimensiones del volumen interior usando bounding box de la geometría
        const bottleGeom = gltf.nodes.WaterBottle.geometry;
        bottleGeom.computeBoundingBox();
        const box = bottleGeom.boundingBox; const size = new THREE.Vector3(); box.getSize(size);
        const center = new THREE.Vector3(); box.getCenter(center);

        // Parametrizar el cilindro para que quepa dentro: radio ligeramente menor que el ancho
        const cylRadius = Math.min(size.x, size.z) * 0.45; // 45% del ancho
        const cylHeight = size.y * 0.85; // 85% de la altura interior

        // Posicionar el cilindro en el centro del bounding box, con un leve offset hacia abajo
        const cylPos = [center.x, center.y - (size.y - cylHeight) / 2 - 0.02, center.z];

        return (
          <group rotation={[-Math.PI, 0, -Math.PI]}>
            <mesh geometry={bottleGeom}>
              <meshPhysicalMaterial
                color="#dbeafe"
                transmission={0.95}
                metalness={0.1}
                roughness={0.15}
                ior={1.5}
                thickness={0.5}
                transparent={true}
                opacity={1}
              />
              {logoDecal && (
                <Decal
                  position={[0, 0.15, 0.08]}
                  rotation={[0, 0, 0]}
                  scale={[0.1, 0.1, 0.1]}
                  map={decalTex}
                  depthTest={true}
                />
              )}
            </mesh>

            {/* Agua: cilindro adaptado a la geometría de la botella */}
            <mesh position={cylPos}>
              <cylinderGeometry args={[cylRadius, cylRadius, cylHeight, 32]} />
              <meshPhysicalMaterial
                color="#66d9ff"
                transmission={0.9}
                roughness={0.05}
                metalness={0}
                ior={1.33}
                thickness={0.4}
                transparent={true}
                opacity={0.7}
              />
            </mesh>
          </group>
        );
      }
      return gltf.scene.clone();
    }
    if (ext === 'fbx') return useFBX(url).clone();
    if (ext === 'obj') {
      const obj = useLoader(OBJLoader, url).clone();
      if (makePlastic) {
        const mat = new THREE.MeshPhysicalMaterial({ color: "#dbeafe", transmission: 0.95, metalness: 0.1, roughness: 0.15, ior: 1.5, thickness: 0.5, transparent: true, opacity: 1 });
        obj.traverse(child => { if (child.isMesh) child.material = mat; });
      }
      return obj;
    }
    if (ext === '3ds') {
      const obj = useLoader(TDSLoader, url).clone();
      if (makePlastic) {
        const mat = new THREE.MeshPhysicalMaterial({ color: "#dbeafe", transmission: 0.95, metalness: 0.1, roughness: 0.15, ior: 1.5, thickness: 0.5, transparent: true, opacity: 1 });
        // The .3ds file likely has multiple meshes. The backdrop is huge, the bottle is small.
        obj.traverse(child => {
          if (child.isMesh) {
            child.geometry.computeBoundingBox();
            const box = child.geometry.boundingBox;
            const size = new THREE.Vector3();
            box.getSize(size);
            
            // If the mesh is huge (e.g., width > 50), it's probably the backdrop. Hide it.
            if (size.x > 50 || size.z > 50) {
              child.visible = false;
            } else {
              child.material = mat;
            }
          }
        });
      }
      return obj;
    }
    return null;
  }, [url, ext, makePlastic, logoDecal, decalTex]);

  const pivotW = useRef(new THREE.Vector3());
  useLayoutEffect(() => {
    if (!content) return;
    const g = inner.current; g.updateWorldMatrix(true, true);
    const sphere = new THREE.Box3().setFromObject(g).getBoundingSphere(new THREE.Sphere());
    const s = 1 / (sphere.radius * 2);
    g.scale.setScalar(s);
    g.position.set(-sphere.center.x * s, -sphere.center.y * s, -sphere.center.z * s);
    g.traverse(o => { 
      if (o.isMesh) { 
        o.castShadow = true; 
        o.receiveShadow = true; 
        if (fadeIn && !makePlastic) { 
          o.material.transparent = true; 
          o.material.opacity = 0; 
        } 
      } 
    });
    g.getWorldPosition(pivotW.current); pivot.copy(pivotW.current);
    outer.current.rotation.set(initPitch, initYaw, 0);
    if (autoFrame && camera.isPerspectiveCamera) {
      const persp = camera; const fitR = sphere.radius * s; const d = (fitR * 1.2) / Math.sin((persp.fov * Math.PI) / 180 / 2);
      persp.position.set(pivotW.current.x, pivotW.current.y, pivotW.current.z + d); persp.near = d / 10; persp.far = d * 10; persp.updateProjectionMatrix();
    }
    if (fadeIn) {
      let t = 0; const id = setInterval(() => { t += 0.05; const v = Math.min(t, 1); g.traverse(o => { if (o.isMesh) o.material.opacity = v; }); invalidate(); if (v === 1) { clearInterval(id); onLoaded?.(); } }, 16);
      return () => clearInterval(id);
    } else onLoaded?.();
  }, [content]);

  useEffect(() => {
    if (!enableManualRotation || isTouch) return;
    const el = gl.domElement; let drag = false; let lx = 0, ly = 0;
    const down = e => { if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return; drag = true; lx = e.clientX; ly = e.clientY; window.addEventListener('pointerup', up); };
    const move = e => { if (!drag) return; const dx = e.clientX - lx; const dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; outer.current.rotation.y += dx * ROTATE_SPEED; outer.current.rotation.x += dy * ROTATE_SPEED; vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED }; invalidate(); };
    const up = () => (drag = false);
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [gl, enableManualRotation]);

  useEffect(() => {
    if (isTouch) return;
    const mm = e => { if (e.pointerType !== 'mouse') return; const nx = (e.clientX / window.innerWidth) * 2 - 1; const ny = (e.clientY / window.innerHeight) * 2 - 1; if (enableMouseParallax) tPar.current = { x: -nx * PARALLAX_MAG, y: -ny * PARALLAX_MAG }; if (enableHoverRotation) tHov.current = { x: ny * HOVER_MAG, y: nx * HOVER_MAG }; invalidate(); };
    window.addEventListener('pointermove', mm); return () => window.removeEventListener('pointermove', mm);
  }, [enableMouseParallax, enableHoverRotation]);

  useFrame((_, dt) => {
    let need = false;
    cPar.current.x += (tPar.current.x - cPar.current.x) * PARALLAX_EASE; cPar.current.y += (tPar.current.y - cPar.current.y) * PARALLAX_EASE;
    const phx = cHov.current.x, phy = cHov.current.y;
    cHov.current.x += (tHov.current.x - cHov.current.x) * HOVER_EASE; cHov.current.y += (tHov.current.y - cHov.current.y) * HOVER_EASE;
    const ndc = pivotW.current.clone().project(camera); ndc.x += xOff + cPar.current.x; ndc.y += yOff + cPar.current.y;
    outer.current.position.copy(ndc.unproject(camera));
    outer.current.rotation.x += cHov.current.x - phx; outer.current.rotation.y += cHov.current.y - phy;
    if (autoRotate) { outer.current.rotation.y += autoRotateSpeed * dt; need = true; }
    outer.current.rotation.y += vel.current.x; outer.current.rotation.x += vel.current.y;
    vel.current.x *= INERTIA; vel.current.y *= INERTIA;
    if (Math.abs(vel.current.x) > 1e-4 || Math.abs(vel.current.y) > 1e-4) need = true;
    if (Math.abs(cPar.current.x - tPar.current.x) > 1e-4 || Math.abs(cPar.current.y - tPar.current.y) > 1e-4 || Math.abs(cHov.current.x - tHov.current.x) > 1e-4 || Math.abs(cHov.current.y - tHov.current.y) > 1e-4) need = true;
    if (need) invalidate();
  });

  if (!content) return null;
  return (
    <group ref={outer}>
      <group ref={inner}>
        {isValidElement(content) ? content : <primitive object={content} />}
      </group>
    </group>
  );
};

const ModelViewer = ({ url, width = 400, height = 400, modelXOffset = 0, modelYOffset = 0, defaultRotationX = -50, defaultRotationY = 20, defaultZoom = 0.5, minZoomDistance = 0.5, maxZoomDistance = 10, enableMouseParallax = true, enableManualRotation = true, enableHoverRotation = true, enableManualZoom = true, ambientIntensity = 0.3, keyLightIntensity = 1, fillLightIntensity = 0.5, rimLightIntensity = 0.8, environmentPreset = 'forest', autoFrame = false, placeholderSrc, showScreenshotButton = true, fadeIn = false, autoRotate = false, autoRotateSpeed = 0.35, makePlastic = false, logoDecal = null, onModelLoaded }) => {
  useEffect(() => void useGLTF.preload(url), [url]);
  const pivot = useRef(new THREE.Vector3()).current; const contactRef = useRef(null); const rendererRef = useRef(null); const sceneRef = useRef(null); const cameraRef = useRef(null);
  const initYaw = deg2rad(defaultRotationX); const initPitch = deg2rad(defaultRotationY); const camZ = Math.min(Math.max(defaultZoom, minZoomDistance), maxZoomDistance);

  const capture = () => {
    const g = rendererRef.current, s = sceneRef.current, c = cameraRef.current;
    if (!g || !s || !c) return;
    g.shadowMap.enabled = false; const tmp = [];
    s.traverse(o => { if (o.isLight && 'castShadow' in o) { tmp.push({ l: o, cast: o.castShadow }); o.castShadow = false; } });
    if (contactRef.current) contactRef.current.visible = false;
    g.render(s, c);
    const urlPNG = g.domElement.toDataURL('image/png');
    const a = document.createElement('a'); a.download = 'model.png'; a.href = urlPNG; a.click();
    g.shadowMap.enabled = true; tmp.forEach(({ l, cast }) => (l.castShadow = cast));
    if (contactRef.current) contactRef.current.visible = true;
    const { invalidate } = useThree(); invalidate();
  };

  return (
    <div style={{ width, height, touchAction: 'pan-y pinch-zoom', position: 'relative' }}>
      <Canvas
        shadows
        frameloop="demand"
        gl={{ preserveDrawingBuffer: true, alpha: true }}
        onCreated={({ gl, scene, camera }) => {
          rendererRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.setClearColor(new THREE.Color(0, 0, 0), 0);
        }}
        camera={{ fov: 50, position: [0, 0, camZ], near: 0.01, far: 100 }}
        style={{ touchAction: 'pan-y pinch-zoom', background: 'transparent' }}
      >
        {environmentPreset !== 'none' && <Environment preset={environmentPreset} background={false} />}
        <ambientLight intensity={ambientIntensity} />
        <directionalLight position={[5, 5, 5]} intensity={keyLightIntensity} castShadow />
        <directionalLight position={[-5, 2, 5]} intensity={fillLightIntensity} />
        <directionalLight position={[0, 4, -5]} intensity={rimLightIntensity} />
        <ContactShadows ref={contactRef} position={[0, -0.5, 0]} opacity={0.35} scale={10} blur={2} />
        <Suspense fallback={<Loader placeholderSrc={placeholderSrc} />}>
          <ModelInner url={url} xOff={modelXOffset} yOff={modelYOffset} pivot={pivot} initYaw={initYaw} initPitch={initPitch} minZoom={minZoomDistance} maxZoom={maxZoomDistance} enableMouseParallax={enableMouseParallax} enableManualRotation={enableManualRotation} enableHoverRotation={enableHoverRotation} enableManualZoom={enableManualZoom} autoFrame={autoFrame} fadeIn={fadeIn} autoRotate={autoRotate} autoRotateSpeed={autoRotateSpeed} makePlastic={makePlastic} logoDecal={logoDecal} onLoaded={onModelLoaded} />
        </Suspense>
        {!isTouch && <DesktopControls pivot={pivot} min={minZoomDistance} max={maxZoomDistance} zoomEnabled={enableManualZoom} />}
      </Canvas>
    </div>
  );
};

export default ModelViewer;
