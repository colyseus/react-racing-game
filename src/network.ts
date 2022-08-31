import type { Room } from 'colyseus.js'
import { Client } from 'colyseus.js'
import {MapSchema} from "@colyseus/schema";
import {Racer} from "./GameRoomState";

const COLYSEUS_HOST = 'ws://localhost:2567'
const GAME_ROOM  =  'game_room'

export const client: Client = new Client(COLYSEUS_HOST)
export let gameRoom: Room

export const joinGame = async () => {
    gameRoom = await client.joinOrCreate(GAME_ROOM)
}

export const initializeNetwork = async () => {
    if(!gameRoom) {
        await joinGame()
    }
}

export const gameReady = (): boolean => {
    return (gameRoom.state.racers as MapSchema<Racer>).size == 2
}

export const players = () => {
    return gameRoom.state.racers
}

export const sendPlayerPosition = async (targetPosition: any) => {
    gameRoom.send('positionUpdate', targetPosition)
}
