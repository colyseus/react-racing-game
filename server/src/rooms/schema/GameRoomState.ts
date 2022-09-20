import { MapSchema, Schema, Context, type } from "@colyseus/schema";

export class Vector3 extends Schema {
  @type("number")
  x = 0;

  @type("number")
  y = 0;

  @type("number")
  z = 0;

  getValues = () => {
    return [this.x, this.y, this.z];
  }

  setValues = (x_:number, y_:number, z_:number) => {
    this.x = x_;
    this.y = y_;
    this.z = z_;
  }

  setObject = (instance: Vector3) => {
    this.x = instance.x;
    this.y = instance.y;
    this.z = instance.z;
  }

  equal = (x:number, y:number, z:number) => {
    return this.x == x && this.y == y && this.z == z;
  }
}

export class Movement extends Schema {
  @type("boolean")
  brake = false;

  @type("boolean")
  isBoosting = false;

  @type("number")
  boostValue = 100;

  @type("number")
  engineValue = 0;

  @type("boolean")
  forward = false;

  @type("number")
  steeringValue = 0;

  @type("number")
  speed = 0;

  @type("number")
  swaySpeed = 0;

  @type("number")
  swayTarget = 0;

  @type("number")
  swayValue = 0;
}


export class Player extends Schema {
  @type(Vector3)
  angularVelocity: Vector3 = new Vector3();

  @type(Movement)
  movement: Movement = new Movement();

  @type(Vector3)
  position: Vector3 = new Vector3();

  @type(Vector3)
  rotation: Vector3 = new Vector3();

  @type(Vector3)
  spawnPosition: Vector3 = new Vector3();

}

export class GameRoomState extends Schema {

  @type({map: Player})
  players = new MapSchema<Player>();

  @type(Vector3)
  nextSpawnPosition = new Vector3();
}
