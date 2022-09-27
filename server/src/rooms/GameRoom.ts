import { Room, Client } from "colyseus";
import { GameRoomState, Player } from "./schema/GameRoomState";

const MAX_PLAYER_COUNT = 20;

const generateRandomInteger = (min, max) => {
  return Math.floor(min + Math.random()*(max - min + 1))
}

export class GameRoom extends Room<GameRoomState> {

  maxClients = MAX_PLAYER_COUNT;

  onCreate (options: any) {
    this.setState(new GameRoomState());

    this.onMessage('frameData', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      player.movement.isBoosting = data['isBoosting'];
      player.movement.boostValue = data['boostValue'];
      player.movement.brake = data['brake'];
      player.movement.engineValue = data['engineValue'];
      player.movement.forward = data['forward'];
      player.movement.speed = data['speed'];
      player.movement.steeringValue = data['steeringValue'];
      player.movement.swaySpeed = data['swaySpeed'];
      player.movement.swayTarget = data['swayTarget'];
      player.movement.swayValue = data['swayValue'];

      player.position.setValues(data['position']['x'], data['position']['y'], data['position']['z']);
    })
  }

  onJoin (client: Client, options: any) {
    const newPlayer = new Player();
    newPlayer.angularVelocity.setValues(0, 0, 0);
    newPlayer.position.setValues(-generateRandomInteger(109, 115), 0.75, generateRandomInteger(215, 220));
    newPlayer.rotation.setValues(0, Math.PI / 2 + 0.35, 0);
    this.state.players.set(client.sessionId, newPlayer);
    console.log(client.sessionId, "joined!");

    client.send("config", { maxPlayerCount: MAX_PLAYER_COUNT })
  }

  onLeave (client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    this.state.nextSpawnPosition.setObject(player.spawnPosition);
    this.state.players.delete(client.sessionId);
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
