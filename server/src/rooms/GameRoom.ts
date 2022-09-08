import { Room, Client } from "colyseus";
import { GameRoomState, Player } from "./schema/GameRoomState";

export class GameRoom extends Room<GameRoomState> {

  maxClients = 2;

  onCreate (options: any) {
    this.setState(new GameRoomState());
    this.state.nextSpawnPosition.setValues(-110, 0.75, 220);
  }

  onJoin (client: Client, options: any) {
    const newPlayer = new Player();
    newPlayer.angularVelocity.setValues(0, 0.5, 0);
    newPlayer.spawnPosition.setObject(this.state.nextSpawnPosition);
    newPlayer.position.setObject(this.state.nextSpawnPosition);
    newPlayer.rotation.setValues(0, Math.PI / 2 + 0.35, 0);
    this.state.players.set(client.sessionId, newPlayer);
    console.log(client.sessionId, "joined!");

    if(newPlayer.position.x == -110) {
      this.state.nextSpawnPosition.setValues(-113, 0.75, 210)}
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
