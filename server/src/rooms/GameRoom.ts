import { Room, Client } from "colyseus";
import {GameRoomState, Racer} from "./schema/GameRoomState";

export class GameRoom extends Room<GameRoomState> {

  maxClients = 2;

  onCreate (options: any) {
    this.setState(new GameRoomState());
  }

  onJoin (client: Client, options: any) {
    this.state.racers.set(client.sessionId, new Racer());
    console.log(client.sessionId, "joined!");
  }

  onLeave (client: Client, consented: boolean) {
    this.state.racers.delete(client.sessionId);
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
