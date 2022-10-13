"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const colyseus_1 = require("colyseus");
const GameRoomState_1 = require("./schema/GameRoomState");
const MAX_PLAYER_COUNT = 20;
const generateRandomInteger = (min, max) => {
    return Math.floor(min + Math.random() * (max - min + 1));
};
class GameRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = MAX_PLAYER_COUNT;
    }
    onCreate(options) {
        this.setState(new GameRoomState_1.GameRoomState());
        this.onMessage('movementData', (client, data) => {
            const player = this.state.players.get(client.sessionId);
            player.position.x = data['position']['x'];
            player.position.y = data['position']['y'];
            player.position.z = data['position']['z'];
            player.rotation.w = data['rotation']['w'];
            player.rotation.x = data['rotation']['x'];
            player.rotation.y = data['rotation']['y'];
            player.rotation.z = data['rotation']['z'];
        });
    }
    onJoin(client, options) {
        const newPlayer = new GameRoomState_1.Player();
        newPlayer.position.x = -generateRandomInteger(109, 115);
        newPlayer.position.y = 0.75;
        newPlayer.position.z = generateRandomInteger(215, 220);
        newPlayer.rotation.w = 0.5731936903702084;
        newPlayer.rotation.x = 0;
        newPlayer.rotation.y = Math.PI / 2 + 0.35;
        newPlayer.rotation.z = 0;
        this.state.players.set(client.sessionId, newPlayer);
        console.log(client.sessionId, "joined!");
        client.send("config", { maxPlayerCount: MAX_PLAYER_COUNT });
    }
    onLeave(client, consented) {
        this.state.players.delete(client.sessionId);
        console.log(client.sessionId, "left!");
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
exports.GameRoom = GameRoom;
