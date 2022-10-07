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
        });
        this.onMessage('positionData', (client, data) => {
            const player = this.state.players.get(client.sessionId);
            player.position.x = data['position']['x'];
            player.position.y = data['position']['y'];
            player.position.z = data['position']['z'];
        });
    }
    onJoin(client, options) {
        const newPlayer = new GameRoomState_1.Player();
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
