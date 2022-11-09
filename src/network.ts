import type { Room } from 'colyseus.js'
import { Client } from 'colyseus.js'

const COLYSEUS_HOST = 'ws://localhost:2567'
// const COLYSEUS_HOST = 'wss://kpdkye.api-colyseus.com'
const GAME_ROOM  =  'game_room'

export const client: Client = new Client(COLYSEUS_HOST)
export let gameRoom: Room
export let mainPlayerId: string
export let maxPlayerCount = 10

export const joinGame = async (): Promise<Room> => {
    gameRoom = await client.joinOrCreate(GAME_ROOM)
    mainPlayerId = gameRoom.state.indexes.get(gameRoom.sessionId)

    gameRoom.onMessage('config', data => {
        maxPlayerCount = data['maxPlayerCount']
    })

    return gameRoom
}

export const initializeNetwork = async (): Promise<Room> => {
    if(!gameRoom) {
        gameRoom = await joinGame()
    }

    return gameRoom
}

export const getGameRoom = () => {
    return gameRoom
}

export const getPlayers = () => {
    return gameRoom.state.players
}

export const setMainPlayerId = (id: string) => {
    mainPlayerId = id
}
