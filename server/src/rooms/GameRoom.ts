import { Room, Client } from "colyseus";
import { GameRoomState, Player } from "./schema/GameRoomState";

export class GameRoom extends Room<GameRoomState> {

  maxClients = 2;

  onCreate (options: any) {
    this.setState(new GameRoomState());
    this.state.nextSpawnPosition.setValues(-110, 0.75, 210);

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

    // this.onMessage('positioning', (client, data) => {
    //   const player = this.state.players.get(client.sessionId);
    //   player.angularVelocity.setValues(data['angularVelocity']['x'], data['angularVelocity']['y'], data['angularVelocity']['z']);
    //   player.position.setValues(data['position']['x'], data['position']['y'], data['position']['z']);
    //   player.rotation.setValues(data['rotation']['x'], data['rotation']['y'], data['rotation']['z']);
    //
    //   console.log(player.position.toJSON())
    // })
  }

  onJoin (client: Client, options: any) {
    const newPlayer = new Player();
    newPlayer.angularVelocity.setValues(0, 0, 0);
    newPlayer.spawnPosition.setObject(this.state.nextSpawnPosition);
    newPlayer.position.setObject(this.state.nextSpawnPosition);
    newPlayer.rotation.setValues(0, Math.PI / 2 + 0.35, 0);
    this.state.players.set(client.sessionId, newPlayer);
    console.log(client.sessionId, "joined!");

    if(newPlayer.position.x == -110) {
      this.state.nextSpawnPosition.setValues(-110, 0.75, 220)
    }
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
