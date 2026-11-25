import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export function CakeKnife3D({ visible, cutting }) {
  const groupRef = useRef(null)
  const progressRef = useRef(0)

  const materials = useMemo(() => {
    const steel = new THREE.MeshPhysicalMaterial({
      color: '#EAEFF5',
      metalness: 0.95,
      roughness: 0.12,
      clearcoat: 0.6,
    })
    const brass = new THREE.MeshStandardMaterial({
      color: '#D9A74A',
      metalness: 0.9,
      roughness: 0.2,
    })
    const walnut = new THREE.MeshStandardMaterial({
      color: '#4A2B18',
      roughness: 0.55,
      metalness: 0.08,
    })
    return { steel, brass, walnut }
  }, [])

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((m) => m.dispose())
    }
  }, [materials])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const dt = Math.min(delta, 0.1)
    const target = cutting ? 1 : 0
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, 1 - Math.exp(-5.5 * dt))

    const p = progressRef.current
    const hoverY = Math.sin(state.clock.elapsedTime * 3) * 0.04
    // Plunge smoothly from poised top-right into the cake center
    groupRef.current.position.set(
      THREE.MathUtils.lerp(1.45, 0.62, p),
      THREE.MathUtils.lerp(2.25 + hoverY, 0.72, p),
      THREE.MathUtils.lerp(1.25, 0.45, p),
    )
    groupRef.current.rotation.set(
      THREE.MathUtils.lerp(-0.18, 0.04, p),
      THREE.MathUtils.lerp(-0.55, -0.48, p),
      THREE.MathUtils.lerp(0.55, 0.08, p),
    )
  })

  if (!visible) return null

  return (
    <group ref={groupRef} position={[1.45, 2.25, 1.25]}>
      {/* Mirror-polished stainless steel blade */}
      <mesh material={materials.steel} castShadow position={[-0.75, 0, 0]}>
        <boxGeometry args={[1.65, 0.22, 0.024]} />
      </mesh>
      {/* Tapered tip */}
      <mesh material={materials.steel} position={[-1.62, 0.02, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.24, 0.16, 0.022]} />
      </mesh>
      {/* Brass bolster */}
      <mesh material={materials.brass} position={[0.12, 0, 0]}>
        <boxGeometry args={[0.14, 0.25, 0.07]} />
      </mesh>
      {/* Ergonomic walnut handle */}
      <mesh material={materials.walnut} castShadow position={[0.68, 0.01, 0]}>
        <boxGeometry args={[1.02, 0.21, 0.11]} />
      </mesh>
      {/* 3 Golden rivets */}
      {[0.38, 0.68, 0.96].map((rx, idx) => (
        <mesh key={idx} material={materials.brass} position={[rx, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.12, 12]} />
        </mesh>
      ))}
    </group>
  )
}
