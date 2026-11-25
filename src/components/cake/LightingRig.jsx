import { Environment, ContactShadows } from '@react-three/drei'

export function LightingRig({ candleLit }) {
  return (
    <>
      <ambientLight intensity={0.48} color="#fff4e4" />
      <directionalLight
        position={[4.5, 7.5, 5.2]}
        intensity={1.55}
        color="#fff6ea"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-4.2, 4.0, -3.5]} intensity={0.55} color="#ffd6a5" />

      {/* Warm dynamic candlelight glow on frosting when candle is lit */}
      {candleLit && (
        <pointLight
          position={[0, 2.35, 0]}
          intensity={1.65}
          distance={5.5}
          decay={2}
          color="#ffb74d"
        />
      )}

      <Environment preset="sunset" environmentIntensity={0.65} />

      <ContactShadows
        position={[0, -1.02, 0]}
        opacity={0.55}
        scale={9}
        blur={2.1}
        far={4}
        frames={1}
        resolution={256}
        color="#090706"
      />
    </>
  )
}
