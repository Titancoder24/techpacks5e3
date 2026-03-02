import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { getGarmentComponent } from './garments/GarmentModels'

interface SceneProps {
  garmentType: string
  color: string
  backgroundColor: string
  isMoving: boolean
  animationType: string
  isClay: boolean
  zoom: number
  environmentPreset: string
}

function CameraController(_props: { zoom: number }) {
  return null
}

export default function Scene({
  garmentType,
  color,
  backgroundColor,
  isMoving,
  animationType,
  isClay,
  zoom,
  environmentPreset,
}: SceneProps) {
  const GarmentComponent = getGarmentComponent(garmentType)

  return (
    <div className="w-full h-full rounded-[24px] overflow-hidden" style={{ backgroundColor }}>
      <Canvas
        camera={{ position: [0, 0, zoom], fov: 50 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        dpr={[1, 2]}
      >
        <CameraController zoom={zoom} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />

        <Suspense fallback={null}>
          <GarmentComponent
            color={color}
            isMoving={isMoving}
            animationType={animationType}
            isClay={isClay}
          />
          <Environment preset={environmentPreset as any} />
          <ContactShadows
            position={[0, -2.2, 0]}
            opacity={0.4}
            scale={8}
            blur={2}
            far={4}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={15}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}
