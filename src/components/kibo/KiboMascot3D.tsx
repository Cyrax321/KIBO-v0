import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";

interface KiboMascotProps {
  mousePosition: { x: number; y: number };
}

// Cute purple cat-fox creature
const KiboCreature: React.FC<KiboMascotProps> = ({ mousePosition }) => {
  const groupRef = React.useRef<THREE.Group>(null);
  const eyesGroupRef = React.useRef<THREE.Group>(null);
  const tailRef = React.useRef<THREE.Group>(null);
  const [isBlinking, setIsBlinking] = React.useState(false);

  // Blink effect
  React.useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Initial look direction: slightly left and down (toward the Level 12 card)
  const initialLookX = -0.5;
  const initialLookY = 0.2;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Blend from initial position based on whether mouse has moved
      const hasMouseMoved = mousePosition.x !== 0 || mousePosition.y !== 0;
      const blendedX = hasMouseMoved ? mousePosition.x : initialLookX;
      const blendedY = hasMouseMoved ? mousePosition.y : initialLookY;

      const targetRotationY = blendedX * 0.3;
      const targetRotationX = -blendedY * 0.15;
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotationY,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotationX,
        0.05
      );

      // Breathing animation
      const breathe = 1 + Math.sin(time * 2) * 0.015;
      groupRef.current.scale.set(1.1, 1.1 * breathe, 1.1);
    }

    // Eye tracking - also use initial position
    if (eyesGroupRef.current) {
      const hasMouseMoved = mousePosition.x !== 0 || mousePosition.y !== 0;
      const blendedX = hasMouseMoved ? mousePosition.x : initialLookX;
      const blendedY = hasMouseMoved ? mousePosition.y : initialLookY;

      const eyeTargetX = blendedX * 0.03;
      const eyeTargetY = blendedY * 0.02;
      
      eyesGroupRef.current.position.x = THREE.MathUtils.lerp(
        eyesGroupRef.current.position.x,
        eyeTargetX,
        0.08
      );
      eyesGroupRef.current.position.y = THREE.MathUtils.lerp(
        eyesGroupRef.current.position.y,
        eyeTargetY,
        0.08
      );
    }

    // Happy wagging tail
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(time * 4) * 0.4;
      tailRef.current.rotation.x = Math.sin(time * 2.5) * 0.15;
    }
  });

  // Violet color palette
  const primaryColor = "#8b5cf6";
  const lightColor = "#ddd6fe";
  const darkColor = "#5b21b6";
  const creamColor = "#fefbff";
  const pinkBlush = "#f5d0fe";

  const eyeScale = isBlinking ? 0.1 : 1;

  return (
    <group ref={groupRef} position={[0, -0.15, 0]} scale={1.1}>

      {/* === BODY === */}
      <mesh position={[0, -0.55, 0]}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial color={primaryColor} roughness={0.55} />
      </mesh>

      {/* Belly */}
      <mesh position={[0, -0.45, 0.62]}>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshStandardMaterial color={creamColor} roughness={0.6} />
      </mesh>

      {/* === HEAD (back layer) === */}
      <mesh position={[0, 0.38, -0.05]}>
        <sphereGeometry args={[0.78, 32, 32]} />
        <meshStandardMaterial color={primaryColor} roughness={0.55} />
      </mesh>

      {/* Face front (cream) - positioned forward */}
      <mesh position={[0, 0.28, 0.48]}>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshStandardMaterial color={creamColor} roughness={0.6} />
      </mesh>

      {/* === EARS === */}
      <group position={[-0.48, 0.98, -0.05]} rotation={[0.1, 0, -0.3]}>
        <mesh>
          <coneGeometry args={[0.26, 0.52, 32]} />
          <meshStandardMaterial color={primaryColor} roughness={0.55} />
        </mesh>
        <mesh position={[0.02, 0, 0.1]} scale={0.6}>
          <coneGeometry args={[0.2, 0.38, 32]} />
          <meshStandardMaterial color={pinkBlush} roughness={0.65} />
        </mesh>
      </group>

      <group position={[0.48, 0.98, -0.05]} rotation={[0.1, 0, 0.3]}>
        <mesh>
          <coneGeometry args={[0.26, 0.52, 32]} />
          <meshStandardMaterial color={primaryColor} roughness={0.55} />
        </mesh>
        <mesh position={[-0.02, 0, 0.1]} scale={0.6}>
          <coneGeometry args={[0.2, 0.38, 32]} />
          <meshStandardMaterial color={pinkBlush} roughness={0.65} />
        </mesh>
      </group>

      {/* === EYES GROUP (moves together) === */}
      <group ref={eyesGroupRef}>
        {/* Left eye white */}
        <mesh position={[-0.25, 0.42, 0.72]} scale={[1, eyeScale, 1]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        
        {/* Left pupil */}
        <mesh position={[-0.25, 0.42, 0.85]} scale={[1, eyeScale, 1]}>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshBasicMaterial color="#1e1b4b" />
        </mesh>
        
        {/* Left highlight */}
        {!isBlinking && (
          <>
            <mesh position={[-0.2, 0.48, 0.92]}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.29, 0.44, 0.9]}>
              <sphereGeometry args={[0.018, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </>
        )}

        {/* Right eye white */}
        <mesh position={[0.25, 0.42, 0.72]} scale={[1, eyeScale, 1]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        
        {/* Right pupil */}
        <mesh position={[0.25, 0.42, 0.85]} scale={[1, eyeScale, 1]}>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshBasicMaterial color="#1e1b4b" />
        </mesh>
        
        {/* Right highlight */}
        {!isBlinking && (
          <>
            <mesh position={[0.3, 0.48, 0.92]}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.21, 0.44, 0.9]}>
              <sphereGeometry args={[0.018, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </>
        )}
      </group>

      {/* === NOSE === */}
      <mesh position={[0, 0.2, 0.88]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={darkColor} roughness={0.25} />
      </mesh>
      {/* Nose shine */}
      <mesh position={[0.015, 0.23, 0.93]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>

      {/* === BIG CUTE SMILE === */}
      {/* Main smile curve - bigger and cuter */}
      <mesh position={[0, 0.06, 0.84]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.12, 0.022, 8, 24, Math.PI]} />
        <meshBasicMaterial color={darkColor} />
      </mesh>
      
      {/* Smile dimples/ends that curve up */}
      <mesh position={[-0.11, 0.08, 0.82]} rotation={[0.15, 0.4, 0.3]}>
        <torusGeometry args={[0.035, 0.015, 6, 12, Math.PI * 0.6]} />
        <meshBasicMaterial color={darkColor} />
      </mesh>
      <mesh position={[0.11, 0.08, 0.82]} rotation={[0.15, -0.4, -0.3]}>
        <torusGeometry args={[0.035, 0.015, 6, 12, Math.PI * 0.6]} />
        <meshBasicMaterial color={darkColor} />
      </mesh>

      {/* Little tongue peeking out - super cute! */}
      <mesh position={[0, 0.0, 0.86]} rotation={[0.6, 0, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#f472b6" />
      </mesh>

      {/* === ROSY CHEEKS - bigger and more visible === */}
      <mesh position={[-0.4, 0.25, 0.62]} rotation={[0, 0.3, 0]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#fda4af" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.4, 0.25, 0.62]} rotation={[0, -0.3, 0]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#fda4af" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* === ARMS === */}
      <mesh position={[-0.72, -0.38, 0.25]} rotation={[0.45, 0, 0.55]}>
        <capsuleGeometry args={[0.16, 0.32, 8, 16]} />
        <meshStandardMaterial color={primaryColor} roughness={0.55} />
      </mesh>
      <mesh position={[0.72, -0.38, 0.25]} rotation={[0.45, 0, -0.55]}>
        <capsuleGeometry args={[0.16, 0.32, 8, 16]} />
        <meshStandardMaterial color={primaryColor} roughness={0.55} />
      </mesh>

      {/* === FEET === */}
      <mesh position={[-0.32, -1.28, 0.28]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={darkColor} roughness={0.45} />
      </mesh>
      <mesh position={[0.32, -1.28, 0.28]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={darkColor} roughness={0.45} />
      </mesh>
      
      {/* Toe beans */}
      {[-0.32, 0.32].map((x, idx) => (
        <group key={idx} position={[x, -1.25, 0.44]}>
          <mesh position={[0, 0.025, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={pinkBlush} roughness={0.6} />
          </mesh>
          <mesh position={[-0.045, -0.01, 0]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshStandardMaterial color={pinkBlush} roughness={0.6} />
          </mesh>
          <mesh position={[0.045, -0.01, 0]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshStandardMaterial color={pinkBlush} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* === TAIL === */}
      <group ref={tailRef} position={[-0.22, -0.52, -0.65]}>
        <mesh rotation={[0.65, 0.12, -0.12]}>
          <capsuleGeometry args={[0.18, 0.45, 8, 16]} />
          <meshStandardMaterial color={primaryColor} roughness={0.55} />
        </mesh>
        <mesh position={[-0.08, 0.38, -0.04]}>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color={lightColor} roughness={0.55} />
        </mesh>
      </group>

      {/* === SPARKLES === */}
      <mesh position={[-0.75, 1.08, 0.12]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.055, 0]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.8, 0.92, 0.08]} rotation={[0, 0, Math.PI / 6]}>
        <octahedronGeometry args={[0.04, 0]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.52, 1.22, 0]} rotation={[0, 0, Math.PI / 3]}>
        <octahedronGeometry args={[0.032, 0]} />
        <meshBasicMaterial color={lightColor} />
      </mesh>
    </group>
  );
};

// Scene wrapper
const KiboScene: React.FC<KiboMascotProps> = ({ mousePosition }) => {
  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[3, 4, 8]} intensity={1.2} />
      <directionalLight position={[-2, 3, 4]} intensity={0.6} color="#c4b5fd" />
      <pointLight position={[0, 1, 5]} intensity={0.8} color="#a78bfa" />
      
      <Float
        speed={1.5}
        rotationIntensity={0.08}
        floatIntensity={0.25}
        floatingRange={[-0.04, 0.04]}
      >
        <KiboCreature mousePosition={mousePosition} />
      </Float>

      <ContactShadows
        position={[0, -1.65, 0]}
        opacity={0.18}
        scale={4.5}
        blur={2}
        far={2}
        color="#8b5cf6"
      />
      
      <Environment preset="city" />
    </>
  );
};

// Main component
const KiboMascot3D: React.FC<{ className?: string }> = ({ className }) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const x = (event.clientX - centerX) / (rect.width / 2);
        const y = (event.clientY - centerY) / (rect.height / 2);
        
        setMousePosition({ 
          x: Math.max(-1, Math.min(1, x)), 
          y: Math.max(-1, Math.min(1, y)) 
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 38 }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <React.Suspense fallback={null}>
          <KiboScene mousePosition={mousePosition} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export { KiboMascot3D };
