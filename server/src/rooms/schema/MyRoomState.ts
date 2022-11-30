import { MapSchema, Schema, type } from '@colyseus/schema'

export class AxisData extends Schema {
  @type('number')
  x: number = 0

  @type('number')
  y: number = 0

  @type('number')
  z: number = 0

  @type('number')
  w: number = 0 // 'w' is only used for rotation
}

export class Player extends Schema {
  @type('number')
  etc = Infinity

  @type('string')
  sessionId = ''

  @type(AxisData)
  position: AxisData = new AxisData()

  @type(AxisData)
  rotation: AxisData = new AxisData()

  @type(AxisData)
  direction: AxisData = new AxisData()
}

export class MyRoomState extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>()
}
