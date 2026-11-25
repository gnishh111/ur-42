import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

const targetPos = new THREE.Vector3()

export function CameraRig({ stage }) {
  const controlsRef = useRef(null)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    // Subtle mouse-following parallax while keeping cake & porcelain stand centered
    const desiredX = state.pointer.x * 0.55
    const desiredY = (stage === 'cut' || stage === 'done' ? 3.15 : 2.75) + state.pointer.y * 0.25
    const desiredZ = stage === 'cut' || stage === 'done' ? 6.6 : 6.2

    targetPos.set(desiredX, desiredY, desiredZ)
    state.camera.position.lerp(targetPos, 1 - Math.exp(-3.2 * dt))
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={false}
      minPolarAngle={Math.PI / 5}
      maxPolarAngle={Math.PI / 2.25}
      target={[0, 0.35, 0]}
    />
  )
}
