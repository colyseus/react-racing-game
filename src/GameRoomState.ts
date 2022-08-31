import { MapSchema, Schema, type } from '@colyseus/schema'

export class Racer extends Schema {
  @type('number')
  x = 0
  @type('number')
  y = 0
  @type('number')
  z = 0
}

export class GameRoomState extends Schema {

  @type({map: Racer})
  racers = new MapSchema<Racer>()
}
