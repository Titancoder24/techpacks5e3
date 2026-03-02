import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useMockupAnimation } from './AnimationLogic'

interface GarmentProps {
  color: string
  isMoving: boolean
  animationType: string
  isClay: boolean
}

function useMaterial(color: string, isClay: boolean) {
  return useMemo(() => {
    if (isClay) {
      return new THREE.MeshStandardMaterial({
        color: '#d4d0c8',
        roughness: 0.9,
        metalness: 0.0,
      })
    }
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide,
    })
  }, [color, isClay])
}

function createRoundedRectShape(w: number, h: number, r: number) {
  const shape = new THREE.Shape()
  shape.moveTo(-w / 2 + r, -h / 2)
  shape.lineTo(w / 2 - r, -h / 2)
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
  shape.lineTo(w / 2, h / 2 - r)
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
  shape.lineTo(-w / 2 + r, h / 2)
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
  shape.lineTo(-w / 2, -h / 2 + r)
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2)
  return shape
}

export function TShirtMockup({ color, isMoving, animationType, isClay }: GarmentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mat = useMaterial(color, isClay)
  useMockupAnimation(groupRef, animationType, isMoving)

  const bodyGeo = useMemo(() => {
    const shape = createRoundedRectShape(2.2, 2.8, 0.2)
    return new THREE.ExtrudeGeometry(shape, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 })
  }, [])

  return (
    <group ref={groupRef}>
      <mesh geometry={bodyGeo} material={mat} position={[0, 0, -0.35]} />
      <mesh position={[-1.5, 0.6, 0]} rotation={[0, 0, Math.PI / 6]} material={mat}>
        <cylinderGeometry args={[0.28, 0.35, 1.2, 16]} />
      </mesh>
      <mesh position={[1.5, 0.6, 0]} rotation={[0, 0, -Math.PI / 6]} material={mat}>
        <cylinderGeometry args={[0.28, 0.35, 1.2, 16]} />
      </mesh>
      <mesh position={[0, 1.55, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat}>
        <torusGeometry args={[0.4, 0.08, 12, 32]} />
      </mesh>
    </group>
  )
}

export function HoodieMockup({ color, isMoving, animationType, isClay }: GarmentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mat = useMaterial(color, isClay)
  useMockupAnimation(groupRef, animationType, isMoving)

  const bodyGeo = useMemo(() => {
    const shape = createRoundedRectShape(2.4, 3.2, 0.2)
    return new THREE.ExtrudeGeometry(shape, { depth: 0.8, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 })
  }, [])

  return (
    <group ref={groupRef}>
      <mesh geometry={bodyGeo} material={mat} position={[0, 0, -0.4]} />
      <mesh position={[-1.6, 0.8, 0]} rotation={[0, 0, Math.PI / 6]} material={mat}>
        <cylinderGeometry args={[0.3, 0.38, 1.4, 16]} />
      </mesh>
      <mesh position={[1.6, 0.8, 0]} rotation={[0, 0, -Math.PI / 6]} material={mat}>
        <cylinderGeometry args={[0.3, 0.38, 1.4, 16]} />
      </mesh>
      <mesh position={[0, 2.0, -0.3]} material={mat}>
        <sphereGeometry args={[0.55, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, -0.2, 0.42]} material={mat}>
        <boxGeometry args={[1.0, 0.7, 0.08]} />
      </mesh>
      <mesh position={[-0.1, 1.6, 0.42]} material={mat}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
      </mesh>
      <mesh position={[0.1, 1.6, 0.42]} material={mat}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
      </mesh>
    </group>
  )
}

export function PantsMockup({ color, isMoving, animationType, isClay }: GarmentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mat = useMaterial(color, isClay)
  useMockupAnimation(groupRef, animationType, isMoving)

  return (
    <group ref={groupRef}>
      <mesh position={[0, 1.2, 0]} material={mat}>
        <cylinderGeometry args={[0.9, 0.85, 0.5, 24]} />
      </mesh>
      <mesh position={[-0.4, -0.2, 0]} material={mat}>
        <cylinderGeometry args={[0.38, 0.3, 2.4, 16]} />
      </mesh>
      <mesh position={[0.4, -0.2, 0]} material={mat}>
        <cylinderGeometry args={[0.38, 0.3, 2.4, 16]} />
      </mesh>
    </group>
  )
}

export function JacketMockup({ color, isMoving, animationType, isClay }: GarmentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mat = useMaterial(color, isClay)
  useMockupAnimation(groupRef, animationType, isMoving)

  const bodyGeo = useMemo(() => {
    const shape = createRoundedRectShape(2.6, 3.0, 0.15)
    return new THREE.ExtrudeGeometry(shape, { depth: 0.9, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 })
  }, [])

  return (
    <group ref={groupRef}>
      <mesh geometry={bodyGeo} material={mat} position={[0, 0, -0.45]} />
      <mesh position={[-1.7, 0.7, 0]} rotation={[0, 0, Math.PI / 7]} material={mat}>
        <cylinderGeometry args={[0.32, 0.38, 1.5, 16]} />
      </mesh>
      <mesh position={[1.7, 0.7, 0]} rotation={[0, 0, -Math.PI / 7]} material={mat}>
        <cylinderGeometry args={[0.32, 0.38, 1.5, 16]} />
      </mesh>
      <mesh position={[-0.35, 1.5, 0.5]} rotation={[0.3, 0.3, 0]} material={mat}>
        <boxGeometry args={[0.5, 0.4, 0.06]} />
      </mesh>
      <mesh position={[0.35, 1.5, 0.5]} rotation={[0.3, -0.3, 0]} material={mat}>
        <boxGeometry args={[0.5, 0.4, 0.06]} />
      </mesh>
    </group>
  )
}

export function DressMockup({ color, isMoving, animationType, isClay }: GarmentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mat = useMaterial(color, isClay)
  useMockupAnimation(groupRef, animationType, isMoving)

  const bodiceGeo = useMemo(() => {
    const shape = createRoundedRectShape(1.8, 1.6, 0.15)
    return new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 })
  }, [])

  return (
    <group ref={groupRef}>
      <mesh geometry={bodiceGeo} material={mat} position={[0, 1.0, -0.3]} />
      <mesh position={[0, -0.8, 0]} rotation={[Math.PI, 0, 0]} material={mat}>
        <coneGeometry args={[1.4, 2.8, 24]} />
      </mesh>
      <mesh position={[0, 1.9, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat}>
        <torusGeometry args={[0.3, 0.06, 12, 32]} />
      </mesh>
    </group>
  )
}

export function KurtaMockup({ color, isMoving, animationType, isClay }: GarmentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mat = useMaterial(color, isClay)
  useMockupAnimation(groupRef, animationType, isMoving)

  const bodyGeo = useMemo(() => {
    const shape = createRoundedRectShape(2.0, 4.0, 0.15)
    return new THREE.ExtrudeGeometry(shape, { depth: 0.65, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 })
  }, [])

  return (
    <group ref={groupRef}>
      <mesh geometry={bodyGeo} material={mat} position={[0, 0, -0.32]} />
      <mesh position={[-1.4, 1.0, 0]} rotation={[0, 0, Math.PI / 6]} material={mat}>
        <cylinderGeometry args={[0.25, 0.32, 1.3, 16]} />
      </mesh>
      <mesh position={[1.4, 1.0, 0]} rotation={[0, 0, -Math.PI / 6]} material={mat}>
        <cylinderGeometry args={[0.25, 0.32, 1.3, 16]} />
      </mesh>
      <mesh position={[0, 2.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat}>
        <torusGeometry args={[0.25, 0.06, 8, 24]} />
      </mesh>
    </group>
  )
}

export function getGarmentComponent(garmentType: string) {
  if (garmentType.startsWith('hoodie')) return HoodieMockup
  if (garmentType.startsWith('jacket') || garmentType.startsWith('coat') || garmentType.startsWith('vest')) return JacketMockup
  if (garmentType.startsWith('jeans') || garmentType.startsWith('pants') || garmentType.startsWith('shorts') || garmentType === 'leggings') return PantsMockup
  if (garmentType.startsWith('dress') || garmentType === 'salwar-suit' || garmentType.startsWith('skirt')) return DressMockup
  if (garmentType.startsWith('kurta')) return KurtaMockup
  return TShirtMockup
}
