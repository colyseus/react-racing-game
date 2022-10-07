import { MapSchema, Schema, Context, type } from "@colyseus/schema";

export class Vector3 extends Schema {
  @type("number")
  x = 0;

  @type("number")
  y = 0;

  @type("number")
  z = 0;
}

export class Player extends Schema {
  @type(Vector3)
  angularVelocity: Vector3 = new Vector3();

  @type(Vector3)
  position: Vector3 = new Vector3();

  @type(Vector3)
  rotation: Vector3 = new Vector3();
}

export class GameRoomState extends Schema {

  @type({map: Player})
  players = new MapSchema<Player>();
}
