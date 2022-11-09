import { createRoot } from 'react-dom/client'
import { useGLTF, useTexture } from '@react-three/drei'
import 'inter-ui'
import './styles.css'
import App from './App'
import { initializeNetwork } from './network/api'

useTexture.preload('/textures/heightmap_1024.png')
useGLTF.preload('/models/track-draco.glb')
useGLTF.preload('/models/chassis-draco.glb')
useGLTF.preload('/models/wheel-draco.glb')

const defaultStyle = { color: 'green', paddingLeft: '2%' }
const errorStyle = { color: 'red', paddingLeft: '2%' }

const root = createRoot(document.getElementById('root')!)

root.render(
  <div style={defaultStyle}>
    <h2>Establishing connection with server...</h2>
  </div>,
)

initializeNetwork()
  .then(() => {
    root.render(<App />)
  })
  .catch((e) => {
    console.error(e)
    root.render(
      <div style={errorStyle}>
        <h2>Network failure!</h2>
        <h3>Is your server running?</h3>
      </div>,
    )
  })
