import type { Room } from 'colyseus.js'
import { Client } from 'colyseus.js'

const COLYSEUS_HOST = 'ws://localhost:2567'
const GAME_ROOM  =  'game_room'

export const client: Client = new Client(COLYSEUS_HOST)
export let gameRoom: Room
export let mainPlayerId: string


export const joinGame = async () => {
    gameRoom = await client.joinOrCreate(GAME_ROOM)
    mainPlayerId = gameRoom.sessionId
}

export const initializeNetwork = async () => {
    if(!gameRoom) {
        await joinGame()
    }
}

export const players = () => {
    return gameRoom.state.players
}

