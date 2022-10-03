"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoomState = exports.Player = exports.Movement = exports.Vector3 = void 0;
const schema_1 = require("@colyseus/schema");
class Vector3 extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}
__decorate([
    (0, schema_1.type)("number")
], Vector3.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("number")
], Vector3.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)("number")
], Vector3.prototype, "z", void 0);
exports.Vector3 = Vector3;
class Movement extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.brake = false;
        this.isBoosting = false;
        this.boostValue = 100;
        this.engineValue = 0;
        this.forward = false;
        this.steeringValue = 0;
        this.speed = 0;
        this.swaySpeed = 0;
        this.swayTarget = 0;
        this.swayValue = 0;
    }
}
__decorate([
    (0, schema_1.type)("boolean")
], Movement.prototype, "brake", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], Movement.prototype, "isBoosting", void 0);
__decorate([
    (0, schema_1.type)("number")
], Movement.prototype, "boostValue", void 0);
__decorate([
    (0, schema_1.type)("number")
], Movement.prototype, "engineValue", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], Movement.prototype, "forward", void 0);
__decorate([
    (0, schema_1.type)("number")
], Movement.prototype, "steeringValue", void 0);
__decorate([
    (0, schema_1.type)("number")
], Movement.prototype, "speed", void 0);
__decorate([
    (0, schema_1.type)("number")
], Movement.prototype, "swaySpeed", void 0);
__decorate([
    (0, schema_1.type)("number")
], Movement.prototype, "swayTarget", void 0);
__decorate([
    (0, schema_1.type)("number")
], Movement.prototype, "swayValue", void 0);
exports.Movement = Movement;
class Player extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.angularVelocity = new Vector3();
        this.movement = new Movement();
        this.position = new Vector3();
        this.rotation = new Vector3();
    }
}
__decorate([
    (0, schema_1.type)(Vector3)
], Player.prototype, "angularVelocity", void 0);
__decorate([
    (0, schema_1.type)(Movement)
], Player.prototype, "movement", void 0);
__decorate([
    (0, schema_1.type)(Vector3)
], Player.prototype, "position", void 0);
__decorate([
    (0, schema_1.type)(Vector3)
], Player.prototype, "rotation", void 0);
exports.Player = Player;
class GameRoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.MapSchema();
    }
}
__decorate([
    (0, schema_1.type)({ map: Player })
], GameRoomState.prototype, "players", void 0);
exports.GameRoomState = GameRoomState;
