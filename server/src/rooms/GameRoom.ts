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
    })

    this.onMessage('positionData', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      player.position.x = data['x'];
      player.position.y = data['y'];
      player.position.z = data['z'];
    })
  }

  onJoin (client: Client, options: any) {
    const newPlayer = new Player();
    newPlayer.angularVelocity.x = 0;
    newPlayer.angularVelocity.y = 0;
    newPlayer.angularVelocity.z = 0;

    newPlayer.position.x = -generateRandomInteger(109, 115);
    newPlayer.position.y = 0.75;
    newPlayer.position.z = generateRandomInteger(215, 220);

    newPlayer.rotation.x = 0;
    newPlayer.rotation.y = Math.PI / 2 + 0.35;
    newPlayer.rotation.z = 0;

    this.state.players.set(client.sessionId, newPlayer);
    console.log(client.sessionId, "joined!");

    client.send("config", { maxPlayerCount: MAX_PLAYER_COUNT })
  }

  onLeave (client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
