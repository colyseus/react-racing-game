import React, {useEffect, useLayoutEffect, useState} from 'react'
import * as ReactDOM from 'react-dom'
import {Layers} from 'three'
import {Canvas, events, render} from '@react-three/fiber'
import { Physics, Debug } from '@react-three/cannon'
import { Sky, Environment, PerspectiveCamera, OrbitControls, Stats } from '@react-three/drei'

import type { DirectionalLight } from 'three'

import { HideMouse, Keyboard } from './controls'
import { Cameras } from './effects'
import { BoundingBox, Ramp, Track, Vehicle, Goal, Train, Heightmap } from './models'
import { levelLayer, useStore } from './store'
import { Checkpoint, Clock, Speed, Minimap, Intro, Help, Editor, LeaderBoard, Finished, PickColor } from './ui'
import { useToggle } from './useToggle'
import {gameRoom, getPlayers, mainPlayerId, maxPlayerCount} from './network'
import {VehicleAnimator} from './models/vehicle/VehicleAnimator'
import type {Player} from './GameRoomState'
import {createRoot} from "react-dom/client";

const layers = new Layers()
layers.enable(levelLayer)

export function App(): JSX.Element {
  const [light, setLight] = useState<DirectionalLight | null>(null)
  const [actions, dpr, editor, shadows] = useStore((s) => [s.actions, s.dpr, s.editor, s.shadows])
  const { onCheckpoint, onFinish, onStart } = actions

  const ToggledCheckpoint = useToggle(Checkpoint, 'checkpoint')
  const ToggledDebug = useToggle(Debug, 'debug')
  const ToggledEditor = useToggle(Editor, 'editor')
  const ToggledFinished = useToggle(Finished, 'finished')
  const ToggledMap = useToggle(Minimap, 'map')
  const ToggledOrbitControls = useToggle(OrbitControls, 'editor')
  const ToggledStats = useToggle(Stats, 'stats')

    const [mainPlayer, setMainPlayer] = useState(getPlayers().get(mainPlayerId))
    const [mainPlayerReady, setMainPlayerReady] = useState(false)
    const [otherPlayersReady, setOtherPlayersReady] = useState(false)
    //console.log(getPlayers().get(mainPlayerId))

    const [otherPlayers, setOtherPlayers] = useState([] as any[])

    useLayoutEffect(()=> {
        // Place players in an available empty slot upon joining
        getPlayers().onAdd = (player: Player, playerId: string) => {
            if(playerId === mainPlayerId) {
                setMainPlayer(player)
                setMainPlayerReady(true)
            } else {
                setOtherPlayers([...otherPlayers, {data: player, playerId}])
            }
        }

        // Remove player and empty the player slot
        getPlayers().onRemove = (player: Player, playerId: string) => {
            const tmp = [...otherPlayers]
            const removableIndex = tmp.findIndex((slot=> slot.playerId === playerId))
            tmp.splice(removableIndex, 1)
            setOtherPlayers(tmp)
        }
    }, [mainPlayer, otherPlayers])

  return (
    <Intro>
      <Canvas key={`${dpr}${shadows}`} dpr={[1, dpr]} shadows={shadows} camera={{ position: [0, 5, 15], fov: 50 }}>
        <fog attach="fog" args={['white', 0, 500]} />
        <Sky sunPosition={[100, 10, 100]} distance={1000} />
        <ambientLight layers={layers} intensity={0.1} />
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
        <PerspectiveCamera makeDefault={editor} fov={75} position={[0, 20, 20]} />
        <Physics allowSleep broadphase="SAP" defaultContactMaterial={{ contactEquationRelaxation: 4, friction: 1e-3 }}>
            <ToggledDebug scale={1.0001} color="white">
                {
                    mainPlayerReady? (<Vehicle
                        key={mainPlayerId}
                        angularVelocity={[mainPlayer.angularVelocity.x, mainPlayer.angularVelocity.y, mainPlayer.angularVelocity.z]}
                        position={[mainPlayer.position.x, mainPlayer.position.y, mainPlayer.position.z]}
                        rotation={[mainPlayer.rotation.x, mainPlayer.rotation.y, mainPlayer.rotation.z]}>
                        {light && <primitive object={light.target} />}
                        <Cameras />
                    </Vehicle>): ''
                }
                {
                    otherPlayers.map((element) => {
                        const player = getPlayers().get(element.playerId)
                        return <VehicleAnimator
                            key={element.playerId}
                            playerId={element.playerId}
                            angularVelocity={[player.angularVelocity.x, player.angularVelocity.y, player.angularVelocity.z]}
                            position={[player.position.x, player.position.y, player.position.z]}
                            rotation={[player.rotation.x, player.rotation.y, player.rotation.z]}>
                            {light && <primitive object={light.target} />}
                        </VehicleAnimator>
                    })
                }
                {/*{*/}
                {/*    gameRoom.state.players.onAdd = (player, playerId) => {*/}
                {/*    }*/}
                {/*}*/}
                {/*{players.map(playerId => {*/}
                {/*    return <Vehicle*/}
                {/*        key={playerId}*/}
                {/*        angularVelocity={[0,0,0]}*/}
                {/*        position={[-110, 0.75, 220]}*/}
                {/*        rotation={[0, 0, 0]}>*/}
                {/*        {light && <primitive object={light.target} />}*/}
                {/*        <Cameras />*/}
                {/*    </Vehicle>*/}
                {/*})}*/}
                {/*{*/}
                {/*    (Array.from(players().keys()) as string []).map((playerId) => {*/}
                {/*        const player: Player = players().get(playerId)*/}
                {/*        if(playerId === mainPlayerId) {*/}
                {/*            return <Vehicle*/}
                {/*                key={playerId}*/}
                {/*                angularVelocity={[player.angularVelocity.x, player.angularVelocity.y, player.angularVelocity.z]}*/}
                {/*                position={[player.spawnPosition.x, player.spawnPosition.y, player.spawnPosition.z]}*/}
                {/*                rotation={[player.rotation.x, player.rotation.y, player.rotation.z]}>*/}
                {/*                {light && <primitive object={light.target} />}*/}
                {/*                <Cameras />*/}
                {/*            </Vehicle>*/}
                {/*        }*/}
                {/*        return <VehicleAnimator*/}
                {/*            key={playerId}*/}
                {/*            playerId={playerId}*/}
                {/*            angularVelocity={[player.angularVelocity.x, player.angularVelocity.y, player.angularVelocity.z]}*/}
                {/*            position={[player.spawnPosition.x, player.spawnPosition.y, player.spawnPosition.z]}*/}
                {/*            // position={[-110, 0.75, 218]}*/}
                {/*            rotation={[player.rotation.x, player.rotation.y, player.rotation.z]}>*/}
                {/*            {light && <primitive object={light.target} />}*/}
                {/*        </VehicleAnimator>*/}
                {/*    })*/}
                {/*}*/}
            <Train />
            <Ramp args={[30, 6, 8]} position={[2, -1, 168.55]} rotation={[0, 0.49, Math.PI / 15]} />
            <Heightmap elementSize={0.5085} position={[327 - 66.5, -3.3, -473 + 213]} rotation={[-Math.PI / 2, 0, -Math.PI]} />
            <Goal args={[0.001, 10, 18]} onCollideBegin={onStart} rotation={[0, 0.55, 0]} position={[-27, 1, 180]} />
            <Goal args={[0.001, 10, 18]} onCollideBegin={onFinish} rotation={[0, -1.2, 0]} position={[-104, 1, -189]} />
            <Goal args={[0.001, 10, 18]} onCollideBegin={onCheckpoint} rotation={[0, -0.5, 0]} position={[-50, 1, -5]} />
            <BoundingBox {...{ depth: 512, height: 100, position: [0, 40, 0], width: 512 }} />
          </ToggledDebug>
        </Physics>
        <Track />
        <Environment files="textures/dikhololo_night_1k.hdr" />
        <ToggledMap />
        <ToggledOrbitControls />
      </Canvas>
      <Clock />
      <ToggledEditor />
      <ToggledFinished />
      <Help />
      <Speed />
      <ToggledStats />
      <ToggledCheckpoint />
      <LeaderBoard />
      <PickColor />
      <HideMouse />
      <Keyboard />
    </Intro>
  )
}
