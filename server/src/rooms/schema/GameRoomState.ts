import { MapSchema, Schema, type } from '@colyseus/schema'

export class AxisData extends Schema {
  @type('number')
  w: number = 0

  @type('number')
  x: number = 0

  @type('number')
  y: number = 0

  @type('number')
  z: number = 0
}

export class Player extends Schema {
  @type('number')
  timeSpent = 0

  @type('number')
  timeCompleted = Infinity

  @type('string')
  sessionId = ''

  @type(AxisData)
  position: AxisData = new AxisData()

  @type(AxisData)
  rotation: AxisData = new AxisData()
}

export class GameRoomState extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>()

  @type({ map: 'string' })
  indexes = new MapSchema<string>()
}
