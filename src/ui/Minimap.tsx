import { OrthographicCamera as OrthographicCameraComponent, useFBO, useTexture } from '@react-three/drei'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import type { RefObject } from 'react'
import React, { createRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Box3, Matrix4, Scene, Vector2, Vector3 } from 'three'

import type { OrthographicCamera, WebGLRenderTarget, Sprite } from 'three'

import { useStore, levelLayer } from '../store'
import type { Room } from 'colyseus.js'
import { gameRoom } from '../network/api'
import type { Player } from '../network/api'

interface OpponentCursor {
  id: string
  mat: Matrix4
  player: RefObject<Sprite>
  rot: Vector2
  vec: Vector3
}

const m = new Matrix4()
const playerPosition = new Vector3()
const playerRotation = new Vector3()
const spriteRotation = new Vector2()
const v = new Vector3()

function useLevelGeometricProperties(): [Box3, Vector3, Vector3] {
  const [box] = useState(() => new Box3())
  const [center] = useState(() => new Vector3())
  const [dimensions] = useState(() => new Vector3())
  const level = useStore((state) => state.level)

  useLayoutEffect(() => {
    if (!level.current?.parent) return
    level.current.parent.updateWorldMatrix(false, false)
    box.setFromObject(level.current)
    box.getCenter(center)
    box.getSize(dimensions)
  }, [])

  return [box, center, dimensions]
}

function MinimapTexture({ buffer }: { buffer: WebGLRenderTarget }): JSX.Element {
  const camera = useRef<OrthographicCamera>(null)
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const [levelBox, levelCenter] = useLevelGeometricProperties()

  useEffect(() => {
    if (!camera.current) return
    gl.setRenderTarget(buffer)
    camera.current.bottom = levelBox.min.z - levelCenter.z
    camera.current.top = levelBox.max.z - levelCenter.z
    camera.current.left = levelBox.min.x - levelCenter.x
    camera.current.right = levelBox.max.x - levelCenter.x
    camera.current.position.set(levelCenter.x, levelCenter.y + levelBox.max.y, levelCenter.z)
    camera.current.updateProjectionMatrix()
    gl.render(scene, camera.current)
    gl.setRenderTarget(null)
  }, [levelBox, levelCenter])

  useLayoutEffect(() => {
    if (!camera.current) return
    camera.current.layers.disableAll()
    camera.current.layers.enable(levelLayer)
  }, [levelLayer])

  return <OrthographicCameraComponent ref={camera} makeDefault={false} rotation={[-Math.PI / 2, 0, 0]} near={20} far={500} />
}

export function Minimap({ size = 200 }): JSX.Element {
  const player = useRef<Sprite>(null)
  const miniMap = useRef<Sprite>(null)
  const miniMapCamera = useRef<OrthographicCamera>(null)
  const [virtualScene] = useState(() => new Scene())
  const mask = useTexture('textures/mask.svg')
  const cursorTexture = useTexture('textures/cursor.svg')
  const buffer = useFBO(size * 2, size * 2)
  const {
    gl,
    camera,
    scene,
    size: { height, width },
  } = useThree()
  const [, levelCenter, levelDimensions] = useLevelGeometricProperties()
  const chassisBody = useStore((state) => state.chassisBody)
  const screenPosition = useMemo(() => new Vector3(width / -2 - size / -2 + 30, height / -2 - size / -2 + 30, 0), [height, width, size])

  const room: Room = gameRoom
  const [opponentCursors, setOpponentCursors] = useState(useGetOpponentCursors())

  function useGetOpponentCursors() {
    const cursors = [] as OpponentCursor[]

    room.state.players.forEach((element: Player, id: string) => {
      if (id !== room.sessionId) {
        const player = createRef<Sprite>()
        const mat = new Matrix4()
        const rot = new Vector2()
        const vec = new Vector3()
        cursors.push({ id, mat, player, rot, vec })
      }
    })
    return cursors
  }

  useEffect(() => {
    let timeout: number
    room.state.players.onAdd = (_: Player, key: string) => {
      // use timeout to prevent re-rendering multiple times
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        // skip if current/local player
        if (key === room.sessionId) {
          return
        }

        setOpponentCursors(useGetOpponentCursors())
      }, 50)
    }

    room.state.players.onRemove = (element: Player) => setOpponentCursors(opponentCursors.filter((p) => p.id !== element.sessionId))
  }, [room])

  useFrame(() => {
    if (!miniMap.current || !miniMapCamera.current) return
    gl.autoClear = true
    gl.render(scene, camera)
    gl.autoClear = false
    gl.clearDepth()

    m.copy(camera.matrix).invert()
    miniMap.current.quaternion.setFromRotationMatrix(m)

    for (const cursor of opponentCursors) {
      if (cursor.player.current) {
        const player = room.state.players.get(cursor.id)
        cursor.mat.copy(camera.matrix).invert()
        cursor.vec.subVectors(new Vector3(player?.position.x, player?.position.y, player?.position.z), levelCenter)
        cursor.player.current.quaternion.setFromRotationMatrix(cursor.mat)
        cursor.player.current.position.set(
          screenPosition.x + (cursor.vec.x / levelDimensions.x) * size,
          screenPosition.y - (cursor.vec.z / levelDimensions.z) * size,
          0,
        )
        cursor.rot.set(player.direction.x, player.direction.z)
        cursor.player.current.material.rotation = Math.PI / 2 - cursor.rot.angle()
      }
    }

    if (chassisBody.current && player.current) {
      v.subVectors(chassisBody.current.getWorldPosition(playerPosition), levelCenter)
      player.current.quaternion.setFromRotationMatrix(m)
      player.current.position.set(screenPosition.x + (v.x / levelDimensions.x) * size, screenPosition.y - (v.z / levelDimensions.z) * size, 0)
      chassisBody.current.getWorldDirection(playerRotation)
      spriteRotation.set(playerRotation.x, playerRotation.z)
      player.current.material.rotation = Math.PI / 2 - spriteRotation.angle()
    }

    gl.render(virtualScene, miniMapCamera.current)
  }, 1)

  return (
    <>
      {createPortal(
        <>
          <ambientLight intensity={1} />
          <sprite ref={miniMap} position={screenPosition} scale={[size, size, 1]}>
            <spriteMaterial map={buffer.texture} alphaMap={mask} />
          </sprite>
          {opponentCursors.map((cursor) => {
            return (
              <sprite key={cursor.id} ref={cursor.player} position={screenPosition} scale={[size / 20, size / 20, 1]}>
                <spriteMaterial color="red" alphaMap={cursorTexture} />
              </sprite>
            )
          })}
          <sprite ref={player} position={screenPosition} scale={[size / 20, size / 20, 1]}>
            <spriteMaterial color="white" alphaMap={cursorTexture} />
          </sprite>
        </>,
        virtualScene,
      )}
      <OrthographicCameraComponent ref={miniMapCamera} position={[0, 0, 0.1]} />
      <MinimapTexture buffer={buffer} />
    </>
  )
}
