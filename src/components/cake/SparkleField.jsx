import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const dummy = new THREE.Object3D()

export function SparkleField({ active, color = '#E8B84B', count = 64 }) {
  const meshRef = useRef(null)

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
      const radius = 0.6 + Math.random() * 2.4
      return {
        angle,
        radius,
        speed: 0.7 + Math.random() * 1.1,
        yOffset: Math.random() * 2.8,
        scale: 0.025 + Math.random() * 0.035,
      }
    })
  }, [count])

  const geo = useMemo(() => new THREE.OctahedronGeometry(1, 0), [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.8,
      }),
    [color],
  )

  useEffect(() => {
    return () => {
      geo.dispose()
      mat.dispose()
    }
  }, [geo, mat])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const p = particles[i]
      if (!active) {
        dummy.scale.setScalar(0)
      } else {
        const y = ((t * p.speed + p.yOffset) % 3.2) - 0.4
        const r = p.radius + Math.sin(t * 1.5 + i) * 0.18
        dummy.position.set(
          Math.cos(p.angle + t * 0.4) * r,
          y,
          Math.sin(p.angle + t * 0.4) * r,
        )
        dummy.rotation.set(t * 2 + i, t * 1.4, 0)
        const pulse = Math.sin(((y + 0.4) / 3.2) * Math.PI)
        dummy.scale.setScalar(p.scale * Math.max(0.1, pulse))
      }
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} />
}
