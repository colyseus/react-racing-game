import { createRoot } from 'react-dom/client'
import { useGLTF, useTexture } from '@react-three/drei'
import 'inter-ui'
import './styles.css'
import { App } from './App'
import { initializeNetwork } from './network'

useTexture.preload('/textures/heightmap_1024.png')
useGLTF.preload('/models/track-draco.glb')
useGLTF.preload('/models/chassis-draco.glb')
useGLTF.preload('/models/wheel-draco.glb')


const root = createRoot(document.getElementById('root')!)

root.render(<h3>Initializing network...</h3>)

initializeNetwork()
    .then(() => {
        root.render(<App />)
    })
    .catch(e => {
        console.error(e)
    })
