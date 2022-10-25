import React, {useEffect, useLayoutEffect, useState} from 'react'
import type { DirectionalLight } from 'three'
import { Layers } from 'three'
import { Canvas } from '@react-three/fiber'
import { Debug, Physics } from '@react-three/cannon'
import { Environment, OrbitControls, PerspectiveCamera, Sky, Stats } from '@react-three/drei'

import { HideMouse, Keyboard } from './controls'
import { Cameras } from './effects'
import { BoundingBox, Goal, Heightmap, Ramp, Track, Train, Vehicle } from './models'
import { levelLayer, useStore } from './store'
import { Checkpoint, Clock, Editor, Finished, Help, Intro, LeaderBoard, Minimap, PickColor, Speed } from './ui'
import { useToggle } from './useToggle'
import {getPlayers, mainPlayerId, maxPlayerCount} from './network'
import { VehicleAnimator } from './models/vehicle/VehicleAnimator'
import type { Player } from './GameRoomState'

const layers = new Layers()
layers.enable(levelLayer)

function App(): JSX.Element {
    const [light, setLight] = useState<DirectionalLight | null>(null)
    const [actions, dpr, editor, shadows] = useStore((s) => [s.actions, s.dpr, s.editor, s.shadows])
    const {onCheckpoint, onFinish, onStart} = actions

    const ToggledCheckpoint = useToggle(Checkpoint, 'checkpoint')
    const ToggledDebug = useToggle(Debug, 'debug')
    const ToggledEditor = useToggle(Editor, 'editor')
    const ToggledFinished = useToggle(Finished, 'finished')
    const ToggledMap = useToggle(Minimap, 'map')
    const ToggledOrbitControls = useToggle(OrbitControls, 'editor')
    const ToggledStats = useToggle(Stats, 'stats')

    const [mainPlayer, setMainPlayer] = useState(getPlayers().get(mainPlayerId))
    const [mainPlayerReady, setMainPlayerReady] = useState(false)

    const [otherPlayers, setOtherPlayers] = useState([] as any[])

    useLayoutEffect(() => {
        getPlayers().forEach((player: Player, index: string)  => {
            if (index === mainPlayerId) {
                setMainPlayer(player)
                setMainPlayerReady(true)
            } else if(otherPlayers.length < getPlayers().size - 1) {
                otherPlayers.push({data: player, playerId: index})
                setOtherPlayers(otherPlayers)
            }
        })

    }, [mainPlayer, otherPlayers])

    return (
        <Intro>
            <Canvas key={`${dpr}${shadows}`} dpr={[1, dpr]} shadows={shadows}>
                <fog attach="fog" args={['white', 0, 500]}/>
                <Sky sunPosition={[100, 10, 100]} distance={1000}/>
                <ambientLight layers={layers} intensity={0.1}/>
                <directionalLight
                    ref={setLight}
                    layers={layers}
                    position={[0, 50, 150]}
                    intensity={1}
                    shadow-bias={-0.001}
                    shadow-mapSize={[4096, 4096]}
                    shadow-camera-left={-150}
                    shadow-camera-right={150}
                    shadow-camera-top={150}
                    shadow-camera-bottom={-150}
                    castShadow
                />
                <PerspectiveCamera makeDefault={editor} fov={75} position={[0, 20, 20]}/>
                <Physics allowSleep broadphase="SAP"
                         defaultContactMaterial={{contactEquationRelaxation: 4, friction: 1e-3}}>
                    <ToggledDebug scale={1.0001} color="white">
                        {
                            mainPlayerReady? (
                                <Vehicle
                                    key={mainPlayerId}
                                    angularVelocity={[0, 0, 0]}
                                    position={[mainPlayer.position.x, mainPlayer.position.y, mainPlayer.position.z]}
                                    rotation={[0, Math.PI / 2 + 0.33, 0]}>
                                    {light && <primitive object={light.target}/>}
                                    <Cameras/>
                                </Vehicle>
                            ): ''
                        }
                        {
                            otherPlayers.map((element) => {
                                const player = getPlayers().get(element.playerId)
                                return <VehicleAnimator
                                    key={element.playerId}
                                    playerId={element.playerId}
                                    angularVelocity={[0, 0, 0]}
                                    position={[player.position.x, player.position.y, player.position.z]}
                                    rotation={[0, Math.PI / 2 + 0.33, 0]}>
                                </VehicleAnimator>
                            })
                        }
                        <Train/>
                        <Ramp args={[30, 6, 8]} position={[2, -1, 168.55]} rotation={[0, 0.49, Math.PI / 15]}/>
                        <Heightmap elementSize={0.5085} position={[327 - 66.5, -3.3, -473 + 213]}
                                   rotation={[-Math.PI / 2, 0, -Math.PI]}/>
                        <Goal args={[0.001, 10, 18]} onCollideBegin={onStart} rotation={[0, 0.55, 0]}
                              position={[-27, 1, 180]}/>
                        <Goal args={[0.001, 10, 18]} onCollideBegin={onFinish} rotation={[0, -1.2, 0]}
                              position={[-104, 1, -189]}/>
                        <Goal args={[0.001, 10, 18]} onCollideBegin={onCheckpoint} rotation={[0, -0.5, 0]}
                              position={[-50, 1, -5]}/>
                        <BoundingBox {...{depth: 512, height: 100, position: [0, 40, 0], width: 512}} />
                    </ToggledDebug>
                </Physics>
                <Track/>
                <Environment files="textures/dikhololo_night_1k.hdr"/>
                <ToggledMap/>
                <ToggledOrbitControls/>
            </Canvas>
            <Clock/>
            <ToggledEditor/>
            <ToggledFinished/>
            <Help/>
            <Speed/>
            <ToggledStats/>
            <ToggledCheckpoint/>
            <LeaderBoard/>
            <PickColor/>
            <HideMouse/>
            <Keyboard/>
        </Intro>
    )
}

export default React.memo(App)
