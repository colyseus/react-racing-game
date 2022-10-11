import { MapSchema, Schema, type } from "@colyseus/schema";

export class AxisData extends Schema {
  @type("number")
  w = 0;
  
  @type("number")
  x = 0;

  @type("number")
  y = 0;

  @type("number")
  z = 0;
}

export class Player extends Schema {
  @type("string")
  color = "yellow";

  @type(AxisData)
  position: AxisData = new AxisData();

  @type(AxisData)
  rotation: AxisData = new AxisData();
}

export class GameRoomState extends Schema {

  @type({map: Player})
  players = new MapSchema<Player>();
}
