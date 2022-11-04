import React, { useLayoutEffect, useState } from 'react'

import type { Player } from './api'
import { gameRoom } from './api'
import { OpponentVehicle } from '../models/vehicle/OpponentVehicle'

export function OpponentListComponent() {
  const room = gameRoom

  function getOpponents() {
    const opponents: Player[] = []

    room.state.players.forEach((opponent, sessionId) => {
      // ignore current/local player
      if (sessionId === room.sessionId) {
        return
      }
      opponents.push(opponent)
    })

    return opponents
  }

  const [otherPlayers, setOtherPlayers] = useState(getOpponents())

  useLayoutEffect(() => {
    let timeout: number

    room.state.players.onAdd = (_, key) => {
      // use timeout to prevent re-rendering multiple times
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        // skip if current/local player
        if (key === room.sessionId) {
          return
        }

        setOtherPlayers(getOpponents())
      }, 50)
    }

    room.state.players.onRemove = (player) => setOtherPlayers(otherPlayers.filter((p) => p !== player))
  }, [])

  return (
    <group>
      {otherPlayers.map((player) => {
        return (
          <OpponentVehicle
            key={player.sessionId}
            player={player}
            playerId={player.sessionId}
            angularVelocity={[0, 0, 0]}
            position={[player.position.x, player.position.y, player.position.z]}
            rotation={[player.rotation.x, player.rotation.y, player.rotation.z]}
          ></OpponentVehicle>
        )
      })}
    </group>
  )
}
