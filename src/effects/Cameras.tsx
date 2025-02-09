import { PerspectiveCamera, OrthographicCamera } from '@react-three/drei'
import { useStore } from '../store'

export function Cameras() {
  const [camera, editor] = useStore((state) => [state.camera, state.editor])
  return (
    <>
      <PerspectiveCamera frustumCulled={false} makeDefault={!editor && camera !== 'BIRD_EYE'} rotation={[0, Math.PI, 0]} position={[0, 10, -20]} />
      <OrthographicCamera frustumCulled={false} makeDefault={!editor && camera === 'BIRD_EYE'} position={[0, 100, 0]} rotation={[(-1 * Math.PI) / 2, 0, Math.PI]} zoom={15} />
    </>
  )
}
