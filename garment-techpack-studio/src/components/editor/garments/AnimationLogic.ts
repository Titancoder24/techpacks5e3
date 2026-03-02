import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

export interface AnimationTransform {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export function getAnimationTransform(type: string, elapsed: number): AnimationTransform {
  const t = elapsed
  switch (type) {
    case 'float':
      return {
        position: [0, Math.sin(t * 1.5) * 0.15, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      }
    case 'spin':
      return {
        position: [0, 0, 0],
        rotation: [0, t * 0.8, 0],
        scale: [1, 1, 1],
      }
    case 'tilt':
      return {
        position: [0, 0, 0],
        rotation: [Math.sin(t) * 0.1, Math.sin(t * 0.5) * 0.2, 0],
        scale: [1, 1, 1],
      }
    case 'hero-reveal':
      const reveal = Math.min(t * 0.3, 1)
      return {
        position: [0, (1 - reveal) * 2, 0],
        rotation: [0, t * 0.3, 0],
        scale: [reveal, reveal, reveal],
      }
    case 'orbit-slow':
      return {
        position: [Math.sin(t * 0.3) * 0.3, 0, Math.cos(t * 0.3) * 0.3],
        rotation: [0, t * 0.2, 0],
        scale: [1, 1, 1],
      }
    case 'hover-card':
      return {
        position: [0, Math.sin(t * 2) * 0.05, 0],
        rotation: [Math.sin(t * 1.5) * 0.03, Math.sin(t) * 0.05, 0],
        scale: [1, 1, 1],
      }
    case 'bounce-entry': {
      const bounce = Math.abs(Math.sin(t * 3)) * Math.max(0, 1 - t * 0.15)
      return {
        position: [0, bounce * 0.5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      }
    }
    case 'wobble':
      return {
        position: [0, 0, 0],
        rotation: [Math.sin(t * 3) * 0.05, 0, Math.sin(t * 2.5) * 0.08],
        scale: [1, 1, 1],
      }
    case 'jelly': {
      const jx = 1 + Math.sin(t * 4) * 0.03
      const jy = 1 + Math.cos(t * 4) * 0.03
      return {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [jx, jy, 1],
      }
    }
    case 'swing':
      return {
        position: [0, 0, 0],
        rotation: [0, 0, Math.sin(t * 2) * 0.15],
        scale: [1, 1, 1],
      }
    case 'heartbeat': {
      const beat = 1 + Math.pow(Math.sin(t * 3), 2) * 0.08
      return {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [beat, beat, beat],
      }
    }
    case 'iso-float':
      return {
        position: [Math.sin(t * 0.5) * 0.1, Math.sin(t * 0.7) * 0.15, 0],
        rotation: [0.3, -0.5, 0],
        scale: [1, 1, 1],
      }
    case 'figure-8':
      return {
        position: [Math.sin(t * 0.8) * 0.3, Math.sin(t * 1.6) * 0.15, 0],
        rotation: [0, t * 0.2, 0],
        scale: [1, 1, 1],
      }
    case 'pendulum':
      return {
        position: [Math.sin(t * 1.5) * 0.4, 0, 0],
        rotation: [0, 0, Math.sin(t * 1.5) * 0.1],
        scale: [1, 1, 1],
      }
    case 'wave':
      return {
        position: [0, Math.sin(t * 2) * 0.1, 0],
        rotation: [Math.sin(t * 2) * 0.05, 0, Math.cos(t * 2) * 0.05],
        scale: [1, 1, 1],
      }
    case 'expand': {
      const s = 1 + Math.sin(t * 1.5) * 0.1
      return {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [s, s, s],
      }
    }
    case 'saas-orbiter':
      return {
        position: [Math.sin(t * 0.5) * 0.2, Math.sin(t * 0.8) * 0.1, Math.cos(t * 0.5) * 0.2],
        rotation: [0, t * 0.4, Math.sin(t * 0.3) * 0.05],
        scale: [1, 1, 1],
      }
    case 'hero-float-pro':
      return {
        position: [0, Math.sin(t * 1.2) * 0.12, 0],
        rotation: [Math.sin(t * 0.8) * 0.04, t * 0.15, 0],
        scale: [1, 1, 1],
      }
    case 'liquid-metal': {
      const lx = 1 + Math.sin(t * 3) * 0.04
      const ly = 1 + Math.sin(t * 3 + 1) * 0.04
      const lz = 1 + Math.sin(t * 3 + 2) * 0.04
      return {
        position: [0, Math.sin(t) * 0.05, 0],
        rotation: [0, t * 0.3, 0],
        scale: [lx, ly, lz],
      }
    }
    default:
      return {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      }
  }
}

export function useMockupAnimation(
  ref: React.RefObject<THREE.Group | null>,
  animationType: string,
  isMoving: boolean
) {
  const startTime = useRef(Date.now())

  useFrame(() => {
    if (!ref.current || !isMoving || animationType === 'none') return
    const elapsed = (Date.now() - startTime.current) / 1000
    const transform = getAnimationTransform(animationType, elapsed)

    ref.current.position.set(...transform.position)
    ref.current.rotation.set(...transform.rotation)
    ref.current.scale.set(...transform.scale)
  })
}
