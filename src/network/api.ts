import type { Room} from 'colyseus.js'
import { Client } from 'colyseus.js'
import type { MyRoomState, Player } from '../../server/src/rooms/schema/MyRoomState'

// re-export room state types
export type { MyRoomState, Player }

const COLYSEUS_HOST = 'ws://localhost:2567'
// const COLYSEUS_HOST = 'wss://kpdkye.api-colyseus.com'
const GAME_ROOM = 'my_room'

export const client: Client = new Client(COLYSEUS_HOST)
export let gameRoom: Room<MyRoomState>

export const joinGame = async (): Promise<Room> => {
  gameRoom = await client.joinOrCreate<MyRoomState>(GAME_ROOM)
  return gameRoom
}

export const initializeNetwork = function () {
  return new Promise<void>((resolve, reject) => {
    joinGame()
      .then((room) => {
        gameRoom = room
        gameRoom.state.players.onAdd = (player, sessionId) => {
          if (sessionId === gameRoom.sessionId) {
            gameRoom.state.players.onAdd = undefined
            resolve()
          }
        }
      })
      .catch((err) => reject(err))
  })
}
