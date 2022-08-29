import {Client, Room} from 'colyseus.js'

const COLYSEUS_HOST = 'ws://localhost:2567'
const GAME_ROOM  =  'game_room'

export const client: Client = new Client(COLYSEUS_HOST)
export let gameRoom: Room

export const joinGame = async () => {
    gameRoom = await client.joinOrCreate(GAME_ROOM)
}

export const getGameRoom = async () => {
    if(!gameRoom) {
        await joinGame()
    }

    return gameRoom;
}

export const sendPlayerPosition = async (targetPosition: any) => {
    gameRoom.send('positionUpdate', targetPosition)
}
