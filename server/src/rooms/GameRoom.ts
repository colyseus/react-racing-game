import { Room, Client } from "colyseus";
import { GameRoomState, Player } from "./schema/GameRoomState";

const MAX_PLAYER_COUNT = 10;

type AxisData = {
  w: number
  x: number;
  y: number;
  z: number;
}

type MovementData = {
  position: AxisData;
  rotation: AxisData;
}

const generateRandomInteger = (min: number, max: number) => {
  return Math.floor(min + Math.random()*(max - min + 1))
}

export class GameRoom extends Room<GameRoomState> {

  maxClients = MAX_PLAYER_COUNT;

  onCreate (options: any) {
    this.setState(new GameRoomState());

    // Initialize dummy player positions
    for(let index = 0; index < MAX_PLAYER_COUNT; index++) {
      const newPlayer = new Player();

      newPlayer.position.x = -generateRandomInteger(109, 115);
      newPlayer.position.y = 0.75;
      newPlayer.position.z = generateRandomInteger(215, 220);

      newPlayer.rotation.w = 0.5731936903702084;
      newPlayer.rotation.x = 0;
      newPlayer.rotation.y = Math.PI / 2 + 0.35;
      newPlayer.rotation.z = 0;

      this.state.players.set(`player${index}`, newPlayer);
    }

    this.onMessage('movementData', (client, data: MovementData) => {
      const index = this.state.indexes.get(client.sessionId);
      const player = this.state.players.get(index);
      player.position.x = data.position.x;
      player.position.y = data.position.y;
      player.position.z = data.position.z;

      player.rotation.w = data.rotation.w;
      player.rotation.x = data.rotation.x;
      player.rotation.y = data.rotation.y;
      player.rotation.z = data.rotation.z;
    })
  }

  onJoin (client: Client, options: any) {
    for(const key of this.state.players.keys()) {
      const cursor = this.state.players.get(key);
      if(!cursor.playerPresent) {
        this.state.indexes.set(client.sessionId, key);
        cursor.sessionId = client.sessionId;
        cursor.playerPresent = true;
        break;
      }
    }
    console.log(client.sessionId, "joined!");

    client.send("config", { maxPlayerCount: MAX_PLAYER_COUNT })
  }

  onLeave (client: Client, consented: boolean) {
    const index = this.state.indexes.get(client.sessionId);
    const player = this.state.players.get(index);

    // Reset dummy player properties
    player.position.x = -generateRandomInteger(109, 115);
    player.position.y = 0.75;
    player.position.z = generateRandomInteger(215, 220);

    player.rotation.w = 0.5731936903702084;
    player.rotation.x = 0;
    player.rotation.y = Math.PI / 2 + 0.35;
    player.rotation.z = 0;

    player.playerPresent = false;

    this.state.indexes.delete(client.sessionId);
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
