import { Room, Client } from "colyseus";
import {GameRoomState, Racer} from "./schema/GameRoomState";

export class GameRoom extends Room<GameRoomState> {

  maxClients = 2;

  onCreate (options: any) {
    this.setState(new GameRoomState());
  }

  onJoin (client: Client, options: any) {
    const newPlayer = new Racer();
    newPlayer.y = 0.75;

    if(this.state.racers.size == 0) {
      newPlayer.x = -110;
      newPlayer.z = 220;
    } else {
      newPlayer.x = -113;
      newPlayer.z = 215;
    }
    
    this.state.racers.set(client.sessionId, newPlayer);
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
