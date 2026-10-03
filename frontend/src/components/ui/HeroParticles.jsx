import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Partículas flotantes — puntos en el espacio 3D
function Particles({ count = 120 }) {
  const mesh = useRef();

  // Posiciones aleatorias fijas
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 14;  // x
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;   // y
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;   // z
    }
    return arr;
  }, [count]);

  // Velocidades aleatorias para movimiento flotante
  const velocities = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 0.003,
      y: (Math.random() - 0.5) * 0.002,
    }));
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    const pos = mesh.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3]     += velocities[i].x;
      pos.array[i * 3 + 1] += velocities[i].y;
      // Rebote en los bordes
      if (Math.abs(pos.array[i * 3])     > 7)  velocities[i].x *= -1;
      if (Math.abs(pos.array[i * 3 + 1]) > 4)  velocities[i].y *= -1;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#D2EE42"
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

// Líneas de conexión sutiles — red tecnológica
function Grid() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = -6; i <= 6; i += 3) {
      pts.push(new THREE.Vector3(i, -4, -2));
      pts.push(new THREE.Vector3(i,  4, -2));
    }
    for (let j = -4; j <= 4; j += 2) {
      pts.push(new THREE.Vector3(-6, j, -2));
      pts.push(new THREE.Vector3( 6, j, -2));
    }
    return pts;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#7D1CE2" transparent opacity={0.12} />
    </lineSegments>
  );
}

export default function HeroParticles() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Particles count={140} />
        <Grid />
      </Canvas>
    </div>
  );
}
