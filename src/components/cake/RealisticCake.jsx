import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'

const SLICE_ANGLE = Math.PI / 3.4 // ~53 deg generous slice
const MAIN_ANGLE = Math.PI * 2 - SLICE_ANGLE
const CAKE_RADIUS = 1.62
const CAKE_HEIGHT = 1.26

function buildWedgeGeometry(radius, height, thetaStart, thetaLength) {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  const segs = 40
  for (let i = 0; i <= segs; i++) {
    const a = thetaStart + (thetaLength * i) / segs
    shape.lineTo(Math.cos(a) * radius, Math.sin(a) * radius)
  }
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.025,
  })
  geo.rotateX(-Math.PI / 2)
  return geo
}

export function RealisticCake({ cake, candleLit, sliced }) {
  const sliceGroupRef = useRef(null)
  const flameOuterRef = useRef(null)
  const flameInnerRef = useRef(null)
  const smokeRef = useRef(null)
  const sliceProgress = useRef(0)
  const smokeAlpha = useRef(0)

  // Sculpted porcelain pedestal lathe profile
  const pedestalGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.0, -1.0),
      new THREE.Vector2(1.18, -1.0),
      new THREE.Vector2(1.12, -0.88),
      new THREE.Vector2(0.42, -0.76),
      new THREE.Vector2(0.28, -0.35),
      new THREE.Vector2(0.44, -0.14),
      new THREE.Vector2(2.08, -0.08),
      new THREE.Vector2(2.12, 0.0),
      new THREE.Vector2(0.0, 0.0),
    ]
    return new THREE.LatheGeometry(pts, 48)
  }, [])

  // Outer frosting shell + 5 alternating interior sponge & cream layers
  const geometries = useMemo(() => {
    const mainShell = buildWedgeGeometry(CAKE_RADIUS, CAKE_HEIGHT, SLICE_ANGLE, MAIN_ANGLE)
    const sliceShell = buildWedgeGeometry(CAKE_RADIUS, CAKE_HEIGHT, 0, SLICE_ANGLE)

    // 5 interior layers inside the cut radius so cross-section looks hyper-realistic
    const layerSpecs = [
      { y: 0.04, h: 0.24, type: 'sponge' },
      { y: 0.28, h: 0.14, type: 'cream' },
      { y: 0.42, h: 0.26, type: 'sponge' },
      { y: 0.68, h: 0.14, type: 'cream' },
      { y: 0.82, h: 0.36, type: 'sponge' },
    ]
    const interiorLayers = layerSpecs.map((spec) => ({
      ...spec,
      mainGeo: buildWedgeGeometry(CAKE_RADIUS - 0.035, spec.h, SLICE_ANGLE + 0.01, MAIN_ANGLE - 0.02),
      sliceGeo: buildWedgeGeometry(CAKE_RADIUS - 0.035, spec.h, 0.01, SLICE_ANGLE - 0.02),
    }))

    const rosetteGeo = new THREE.TorusKnotGeometry(0.11, 0.042, 36, 8, 2, 3)
    const berryGeo = new THREE.SphereGeometry(0.095, 16, 16)
    const dripGeo = new THREE.CapsuleGeometry(0.048, 0.24, 6, 10)

    return { mainShell, sliceShell, interiorLayers, rosetteGeo, berryGeo, dripGeo }
  }, [])

  const materials = useMemo(() => {
    const porcelain = new THREE.MeshPhysicalMaterial({
      color: '#FAF6EF',
      roughness: 0.18,
      metalness: 0.04,
      clearcoat: 0.75,
    })
    const goldRim = new THREE.MeshStandardMaterial({
      color: '#E8B84B',
      metalness: 0.92,
      roughness: 0.18,
    })
    const frosting = new THREE.MeshPhysicalMaterial({
      color: cake.frosting,
      roughness: 0.38,
      metalness: 0.02,
      clearcoat: 0.18,
    })
    const sponge = new THREE.MeshStandardMaterial({
      color: cake.sponge,
      roughness: 0.85,
      metalness: 0.0,
    })
    const cream = new THREE.MeshStandardMaterial({
      color: cake.cream,
      roughness: 0.35,
      metalness: 0.02,
    })
    const drip = new THREE.MeshPhysicalMaterial({
      color: cake.drip,
      roughness: 0.16,
      metalness: 0.05,
      clearcoat: 0.85,
    })
    const berry = new THREE.MeshPhysicalMaterial({
      color: cake.berry,
      roughness: 0.24,
      clearcoat: 0.6,
    })
    return { porcelain, goldRim, frosting, sponge, cream, drip, berry }
  }, [cake])

  useEffect(() => {
    return () => {
      pedestalGeo.dispose()
      geometries.mainShell.dispose()
      geometries.sliceShell.dispose()
      geometries.interiorLayers.forEach((l) => {
        l.mainGeo.dispose()
        l.sliceGeo.dispose()
      })
      geometries.rosetteGeo.dispose()
      geometries.berryGeo.dispose()
      geometries.dripGeo.dispose()
      Object.values(materials).forEach((m) => m.dispose())
    }
  }, [pedestalGeo, geometries, materials])

  // Precomputed positions for drips & piped rosettes
  const drips = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2
      const isSlice = a < SLICE_ANGLE
      const lenScale = 0.75 + ((i * 7) % 5) * 0.22
      return { a, isSlice, lenScale }
    })
  }, [])

  const rosettes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + 0.15
      const isSlice = a < SLICE_ANGLE
      return { a, isSlice }
    })
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const t = state.clock.elapsedTime

    // Animate slice separation cleanly along bisector angle
    const targetSlice = sliced ? 1 : 0
    sliceProgress.current = THREE.MathUtils.lerp(sliceProgress.current, targetSlice, 1 - Math.exp(-4.5 * dt))
    if (sliceGroupRef.current) {
      const midA = SLICE_ANGLE * 0.5
      const dist = sliceProgress.current * 0.82
      sliceGroupRef.current.position.set(
        Math.cos(midA) * dist,
        sliceProgress.current * 0.04,
        -Math.sin(midA) * dist,
      )
      sliceGroupRef.current.rotation.y = sliceProgress.current * 0.06
    }

    // Flickering candle flame
    if (candleLit && flameOuterRef.current && flameInnerRef.current) {
      const flickerX = 1 + Math.sin(t * 15) * 0.08
      const flickerY = 1 + Math.cos(t * 19) * 0.13
      flameOuterRef.current.scale.set(flickerX, flickerY, flickerX)
      flameInnerRef.current.scale.set(flickerX * 0.9, flickerY * 0.95, flickerX * 0.9)
      flameOuterRef.current.rotation.z = Math.sin(t * 11) * 0.09
    }

    // Rising smoke after candle blown
    if (!candleLit) {
      smokeAlpha.current = Math.min(1, smokeAlpha.current + dt * 1.6)
    } else {
      smokeAlpha.current = 0
    }
    if (smokeRef.current) {
      smokeRef.current.position.y = 2.25 + ((t * 0.45) % 0.85)
      smokeRef.current.position.x = Math.sin(t * 3.2) * 0.07
      const fade = candleLit ? 0 : Math.max(0, 1 - ((t * 0.45) % 0.85) / 0.85) * 0.45
      smokeRef.current.material.opacity = fade
    }
  })

  return (
    <Float speed={1.1} rotationIntensity={0.04} floatIntensity={0.08}>
      <group position={[0, -0.05, 0]}>
        {/* Porcelain Pedestal Platter + 24K Gold Rim Inlay */}
        <mesh geometry={pedestalGeo} material={materials.porcelain} receiveShadow castShadow />
        <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.goldRim}>
          <torusGeometry args={[2.09, 0.022, 12, 64]} />
        </mesh>

        {/* MAIN CAKE BODY (270+ deg) */}
        <group>
          <mesh geometry={geometries.mainShell} material={materials.frosting} castShadow receiveShadow />
          {/* 5 Interior Sponge & Ganache Layers visible when slice pulls away */}
          {geometries.interiorLayers.map((layer, idx) => (
            <mesh
              key={idx}
              position={[0, layer.y, 0]}
              geometry={layer.mainGeo}
              material={layer.type === 'sponge' ? materials.sponge : materials.cream}
            />
          ))}
          {/* Ganache Drips on Main Body */}
          {drips
            .filter((d) => !d.isSlice)
            .map((d, idx) => (
              <mesh
                key={idx}
                geometry={geometries.dripGeo}
                material={materials.drip}
                position={[
                  Math.cos(d.a) * (CAKE_RADIUS + 0.015),
                  CAKE_HEIGHT - 0.14 * d.lenScale,
                  -Math.sin(d.a) * (CAKE_RADIUS + 0.015),
                ]}
                scale={[1, d.lenScale, 1]}
              />
            ))}
          {/* Piped Rosettes + Berries on Main Body */}
          {rosettes
            .filter((r) => !r.isSlice)
            .map((r, idx) => (
              <group
                key={idx}
                position={[
                  Math.cos(r.a) * (CAKE_RADIUS - 0.24),
                  CAKE_HEIGHT + 0.08,
                  -Math.sin(r.a) * (CAKE_RADIUS - 0.24),
                ]}
              >
                <mesh
                  geometry={geometries.rosetteGeo}
                  material={materials.cream}
                  rotation={[Math.PI / 2, 0, r.a]}
                  castShadow
                />
                <mesh
                  geometry={geometries.berryGeo}
                  material={materials.berry}
                  position={[0, 0.09, 0]}
                />
              </group>
            ))}
        </group>

        {/* SEVERED CAKE WEDGE SLICE (Separates with physics on cut!) */}
        <group ref={sliceGroupRef}>
          <mesh geometry={geometries.sliceShell} material={materials.frosting} castShadow receiveShadow />
          {geometries.interiorLayers.map((layer, idx) => (
            <mesh
              key={idx}
              position={[0, layer.y, 0]}
              geometry={layer.sliceGeo}
              material={layer.type === 'sponge' ? materials.sponge : materials.cream}
            />
          ))}
          {drips
            .filter((d) => d.isSlice)
            .map((d, idx) => (
              <mesh
                key={idx}
                geometry={geometries.dripGeo}
                material={materials.drip}
                position={[
                  Math.cos(d.a) * (CAKE_RADIUS + 0.015),
                  CAKE_HEIGHT - 0.14 * d.lenScale,
                  -Math.sin(d.a) * (CAKE_RADIUS + 0.015),
                ]}
                scale={[1, d.lenScale, 1]}
              />
            ))}
          {rosettes
            .filter((r) => r.isSlice)
            .map((r, idx) => (
              <group
                key={idx}
                position={[
                  Math.cos(r.a) * (CAKE_RADIUS - 0.24),
                  CAKE_HEIGHT + 0.08,
                  -Math.sin(r.a) * (CAKE_RADIUS - 0.24),
                ]}
              >
                <mesh
                  geometry={geometries.rosetteGeo}
                  material={materials.cream}
                  rotation={[Math.PI / 2, 0, r.a]}
                />
                <mesh
                  geometry={geometries.berryGeo}
                  material={materials.berry}
                  position={[0, 0.09, 0]}
                />
              </group>
            ))}
        </group>

        {/* Gold "BESTIE" Cake Topper Plaque */}
        <group position={[-0.45, CAKE_HEIGHT + 0.36, -0.35]} rotation={[0, 0.45, 0]}>
          <mesh material={materials.goldRim} position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.44, 8]} />
          </mesh>
          <Text
            fontSize={0.22}
            color="#E8B84B"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.012}
            outlineColor="#2A1A08"
          >
            BESTIE ✦
          </Text>
        </group>

        {/* Realistic Birthday Candle + Flickering Flame + Rising Smoke */}
        <group position={[0, CAKE_HEIGHT + 0.02, 0]}>
          {/* Candle wax body */}
          <mesh position={[0, 0.34, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.06, 0.68, 20]} />
            <meshPhysicalMaterial color="#FFFDF7" roughness={0.28} clearcoat={0.4} />
          </mesh>
          {/* Gold spiral band */}
          <mesh position={[0, 0.34, 0]} material={materials.goldRim}>
            <torusGeometry args={[0.058, 0.012, 8, 24]} />
          </mesh>
          {/* Wick */}
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.09, 8]} />
            <meshStandardMaterial color="#1C1917" />
          </mesh>

          {/* Animated Multi-Layer Flame */}
          {candleLit && (
            <group position={[0, 0.86, 0]}>
              <mesh ref={flameOuterRef}>
                <coneGeometry args={[0.068, 0.22, 16]} />
                <meshBasicMaterial color="#FF9800" transparent opacity={0.88} />
              </mesh>
              <mesh ref={flameInnerRef} position={[0, -0.02, 0]}>
                <coneGeometry args={[0.036, 0.14, 16]} />
                <meshBasicMaterial color="#FFF9C4" />
              </mesh>
            </group>
          )}

          {/* Rising Smoke Wisp after blow-out */}
          <mesh ref={smokeRef} position={[0, 0.95, 0]}>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshBasicMaterial color="#D6D3D1" transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </Float>
  )
}
