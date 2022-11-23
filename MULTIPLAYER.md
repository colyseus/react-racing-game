## Turning the single player game multiplayer ready with Colyseus

### Step 1: Understanding the single player game
As the first step, let's learn how the single player has been created. In this game 
`Chassis`, `Vehicle` and `Wheel` are the main components act as a group. The group 
will respond to key presses by changing its movements. The initialization point of the 
`Vehicle` is in `App.tsx`.

```typescript
<Vehicle
    angularVelocity={...} 
    position={...} 
    rotation={...}
>
```

Looking into the variables position and rotation they behave as a Vector which
includes x, y and z 3d axis data and as a quaternion respectively. These are the variables which defines the positioning
of the player. For making the game multiplayer capable, we will be using replications
of this Vehicle component and other child components used by it.

### Step 2: Making the server
We will be making a Colyseus server to synchronize player's positioning across connected players.
To initialize the server,
```sh
npm init colyseus-app
```
This will make a Colyseus boilerplate server. In this tutorial we will be using the Colyseus Typescript
template.

#### Schema definition
For both 3 axis vector and quaternion let's make a common model.
```typescript
// {ROOT_DIR}/src/rooms/schema/GameRoomState.ts
import { Schema, type } from '@colyseus/schema'


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
```

And let's use this structure in a player object for position
and rotation.

```typescript
// {SERVER_ROOT}/src/rooms/schema/GameRoomState.ts
export class Player extends Schema {
  @type('number')
  etc = Infinity

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
}
```

Now we can write our logics for player joining, player leaving,
and receiving/sending messages events in `{ROOT_DIR}/src/rooms/GameRoom.ts`.

### Step 3: Integrating Colyseus client into the game
This is barely simple. Please do,
```sh
npm install --save colyseus.js
```
And now let's create a separate directory in the game root as `network`
to keep the networking related functionalities.

In the network directory we write the function to initialize the 
connection with the Colyseus server.

```typescript
// api.ts
import type { Room } from 'colyseus.js'
import { Client } from 'colyseus.js'
import type { GameRoomState, Player } from '{PATH_TO_COLYSEUS_SERVER}/src/rooms/schema/GameRoomState'

// re-export room state types
export type { GameRoomState, Player }

const COLYSEUS_HOST = 'ws://localhost:2567'
const GAME_ROOM = 'game_room'

export const client: Client = new Client(COLYSEUS_HOST)
export let gameRoom: Room<GameRoomState>

export const joinGame = async (): Promise<Room> => {
  gameRoom = await client.joinOrCreate<GameRoomState>(GAME_ROOM)
  return gameRoom
}

export const initializeNetwork = function () {
  return new Promise<void>((resolve, reject) => {
    joinGame()
      .then((room) => {
        gameRoom = room
        gameRoom.state.players.onAdd = (player, sessionId) => {
          if (sessionId === gameRoom.sessionId) {
            gameRoom.state.players.onAdd = undefined
            resolve()
          }
        }
      })
      .catch((err) => reject(err))
  })
}
```

We will be considering using the `sessionId` from the Colyseus connection
to determine the current player.

After that before the game is getting rendered, we will patch the 
game to initialize the server connection.

Therefor in the entrypoint script `main.tsx` let's resolve the network
connection and conditionally render the game if the connection has been
initialized successfully.

```typescript
import { createRoot } from 'react-dom/client'
import { useGLTF, useTexture } from '@react-three/drei'
import 'inter-ui'
import './styles.css'
import App from './App'
import { initializeNetwork } from './network/api'

...

const defaultStyle = { color: 'green', paddingLeft: '2%' }
const errorStyle = { color: 'red', paddingLeft: '2%' }

const root = createRoot(document.getElementById('root')!)

root.render(
  <div style={defaultStyle}>
    <h2>Establishing connection with server...</h2>
  </div>,
)

initializeNetwork()
  .then(() => {
    root.render(<App />)
  })
  .catch((e) => {
    console.error(e)
    root.render(
      <div style={errorStyle}>
        <h2>Network failure!</h2>
        <h3>Is your server running?</h3>
      </div>,
    )
  })
```

Great! Now we have the Connected `gameRoom` object on game start that we can use later
for data synchronization.

### Step 4: Controlling player spawning position from the server
Since the player spawning should be visible to all the players, on player joining
event we will be setting a randomized positioning values from the server.
I will be synchronized with all the joined players.
```typescript
// {SERVER_ROOT}/src/rooms/GameRoom.ts

...

onJoin(client: Client, options: any) {
    // Initialize dummy player positions
    const newPlayer = new Player()
    newPlayer.sessionId = client.sessionId

    newPlayer.position.x = -generateRandomInteger(109, 115)
    newPlayer.position.y = 0.75
    newPlayer.position.z = generateRandomInteger(215, 220)

    newPlayer.rotation.w = 0 //0.5731936903702084;
    newPlayer.rotation.x = 0
    newPlayer.rotation.y = Math.PI / 2 + 0.35
    newPlayer.rotation.z = 0

    this.state.players.set(client.sessionId, newPlayer)
}

...
```

In the game, we will be setting the value for the main player.
```typescript
// {GAME_ROOT}/src/App.tsx

...

const room = gameRoom
const currentPlayer = room.state.players.get(room.sessionId)!

...

<Vehicle
    key={currentPlayer.sessionId}
    angularVelocity={[0, 0, 0]}
    position={[currentPlayer.position.x, currentPlayer.position.y, currentPlayer.position.z]}
    rotation={[0, Math.PI / 2 + 0.33, 0]}>
    {light && <primitive object={light.target} />}
    <Cameras />
</Vehicle>

...
```

### Step 5: Sending the player positioning to the server continuously

From the `Chassis` model we will send the vehicle's positioning(position and rotation) for
the current frame as a message from Colyseus client to the server.

```typescript
// {GAME_ROOT}/src/models/vehicle/Chassis.tsx

import { gameRoom } from '../../network/api'
...

useFrame((_, delta) => {
    ...
    
    if (chassis_1.current.parent) {
        const _position = new Vector3()
        chassis_1.current.getWorldPosition(_position)

        const _rotation = new Quaternion()
        chassis_1.current.getWorldQuaternion(_rotation)

        gameRoom.send('movementData', {
            position: { x: _position.x, y: _position.y, z: _position.z },
            rotation: { w: _rotation.w, x: _rotation.x, y: _rotation.y, z: _rotation.z }
        })
    }
})
```

From the server we will update the position data for the selected player
in the MapSchema. The MapSchema changes will be broadcast automatically with
other connected players.

```typescript
// {SERVER_ROOT}/src/rooms/GameRoom.ts
  onCreate(options: any) {
    this.setState(new GameRoomState())

    this.onMessage('movementData', (client, data) => {
      const player = this.state.players.get(client.sessionId)
      if (!player) {
        console.warn("trying to move a player that doesn't exist", client.sessionId)
        return
      }

      player.position.x = data.position.x
      player.position.y = data.position.y
      player.position.z = data.position.z

      player.rotation.w = data.rotation.w
      player.rotation.x = data.rotation.x
      player.rotation.y = data.rotation.y
      player.rotation.z = data.rotation.z
    })
  }
```

### Step 6: Opponent player model
For opponent players, we will use stripped down copies of the main player
`Vehicle` and `Chassis` models as `OpponentVehicle` and `OpponentChassis`
respectively. There, let's remove the unnecessary functionalities such as
keyboard controls, keymap editor and camera object positioning.

### Step 7: Spawning opponent players
For this purpose we will be using onAdd and onRemove Colyseus schema callbacks.
And we will be maintaining opponent list spawning as a separate component
to avoid re-rendering the main player.

```typescript
import React, { useLayoutEffect, useState } from 'react'

import type { Player } from './api'
import { gameRoom } from './api'
import { OpponentVehicle } from '../models/vehicle/OpponentVehicle'

export function OpponentListComponent() {
  const room = gameRoom

  function getOpponents() {
    const opponents: Player[] = []

    room.state.players.forEach((opponent, sessionId) => {
      // ignore current/local player
      if (sessionId === room.sessionId) {
        return
      }
      opponents.push(opponent)
    })

    return opponents
  }

  const [otherPlayers, setOtherPlayers] = useState(getOpponents())

  useLayoutEffect(() => {
    let timeout: number

    room.state.players.onAdd = (_, key) => {
      // use timeout to prevent re-rendering multiple times
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        // skip if current/local player
        if (key === room.sessionId) {
          return
        }

        setOtherPlayers(getOpponents())
      }, 50)
    }

    room.state.players.onRemove = (player) => setOtherPlayers(otherPlayers.filter((p) => p !== player))
  }, [])

  return (
    <group>
      {otherPlayers.map((player) => {
        return (
          <OpponentVehicle
            key={player.sessionId}
            player={player}
            playerId={player.sessionId}
            angularVelocity={[0, 0, 0]}
            position={[player.position.x, player.position.y, player.position.z]}
            rotation={[player.rotation.x, player.rotation.y, player.rotation.z]}
          ></OpponentVehicle>
        )
      })}
    </group>
  )
}
```
And then we can include the opponents list component in `App.tsx`.

```typescript
...

          <ToggledDebug scale={1.0001} color="white">
            {
              <Vehicle
                key={currentPlayer.sessionId}
                angularVelocity={[0, 0, 0]}
                position={[currentPlayer.position.x, currentPlayer.position.y, currentPlayer.position.z]}
                rotation={[0, Math.PI / 2 + 0.33, 0]}
              >
                {light && <primitive object={light.target} />}
                <Cameras />
              </Vehicle>
            }
            <OpponentListComponent />
            <Train />

...
```

And now you will be able to see opponent players joining and leaving.

### Step 7: Moving opponent players

To move the opponent players as their main players moving we will be setting opponent player positioning in the `OpponentChassis` model.

```typescript
...

import type { Player } from '../../network/api'

export const OpponentChassis = forwardRef<Group, PropsWithChildren<BoxProps & { player: Player }>>(
    
    ...
    
    const player = props.player

    useFrame((/*_, delta*/) => {
      chassis_1.current.material.color.set('maroon')

      // Set synchronized player movement for the frame
      api.quaternion.set(player.rotation.x, player.rotation.y, player.rotation.z, player.rotation.w)
      api.position.set(player.position.x, player.position.y, player.position.z)
    })
    
  ...
```

And now opponent players will move for Player schema positioning attribute changes in the server.

### Step 8: Opponent players in Minimap
It is nice to see opponent player's position in the minimap. Therefor
As in the single player game's minimap we need another positioning called 
`world direction`(direction of the vehicle against the plane). Because of
that let's pass the world direction from main player to the server from
`Chalssis.tsx`. To keep the direction in the server let's introduce a new property
as `direction` in the `Player` schema.

```typescript
// {SERVER_ROOT}/src/rooms/schema/GameRoomState.ts

...

export class Player extends Schema {
    ...

  @type(AxisData)
  direction: AxisData = new AxisData()
}

...
```

```typescript
// {SERVER_ROOT}/src/rooms/GameRoom.ts
...

this.onMessage('movementData', (client, data: MovementData) => {
    const player = this.state.players.get(client.sessionId)

    ...

    player.direction.x = data.direction.x
    player.direction.y = data.direction.y
    player.direction.z = data.direction.z
})

...
```

```typescript
// {GAME_ROOT}/src/models/vehicle/Chassis.tsx
...

const _worldDirection = new Vector3()
chassis_1.current.getWorldDirection(_worldDirection)

gameRoom.send('movementData', {
    position: { x: _position.x, y: _position.y, z: _position.z },
    rotation: { w: _rotation.w, x: _rotation.x, y: _rotation.y, z: _rotation.z },
    direction: { x: _worldDirection.x, y: _worldDirection.y, z: _worldDirection.z },
})

...
```

After that on `{GAME_ROOT}/src/ui/minimap.tsx` we can use `onAdd` and `onRemove` Colyseus schema callbacks to display opponent cursors.

```typescript
// {GAME_ROOT}/src/ui/minimap.tsx
...

import { Box3, Matrix4, Scene, Vector2, Vector3 } from 'three'

import type { OrthographicCamera, WebGLRenderTarget, Sprite } from 'three'

import { useStore, levelLayer } from '../store'
import type { Room } from 'colyseus.js'
import { gameRoom } from '../network/api'
import type { Player } from '../network/api'

interface OpponentCursor {
    id: string
    mat: Matrix4
    player: RefObject<Sprite>
    rot: Vector2
    vec: Vector3
}

const m = new Matrix4()
const playerPosition = new Vector3()
const playerRotation = new Vector3()
const spriteRotation = new Vector2()
const v = new Vector3()
    
...

export function Minimap({ size = 200 }): JSX.Element {
    
    ...
    
    const room: Room = gameRoom
    const [opponentCursors, setOpponentCursors] = useState(useGetOpponentCursors())

    function useGetOpponentCursors() {
        const cursors = [] as OpponentCursor[]

        room.state.players.forEach((element: Player, id: string) => {
            if (id !== room.sessionId) {
                const player = createRef<Sprite>()
                const mat = new Matrix4()
                const rot = new Vector2()
                const vec = new Vector3()
                cursors.push({ id, mat, player, rot, vec })
            }
        })
        return cursors
    }

    useEffect(() => {
        let timeout: number
        room.state.players.onAdd = (_: Player, key: string) => {
            // use timeout to prevent re-rendering multiple times
            window.clearTimeout(timeout)
            timeout = window.setTimeout(() => {
                // skip if current/local player
                if (key === room.sessionId) {
                    return
                }

                setOpponentCursors(useGetOpponentCursors())
            }, 50)
        }

        room.state.players.onRemove = (element: Player) => setOpponentCursors(opponentCursors.filter((p) => p.id !== element.sessionId))
    }, [room])

    useFrame(() => {
        
        ...

        for (const cursor of opponentCursors) {
            if (cursor.player.current) {
                const player = room.state.players.get(cursor.id)
                cursor.mat.copy(camera.matrix).invert()
                cursor.vec.subVectors(new Vector3(player?.position.x, player?.position.y, player?.position.z), levelCenter)
                cursor.player.current.quaternion.setFromRotationMatrix(cursor.mat)
                cursor.player.current.position.set(
                    screenPosition.x + (cursor.vec.x / levelDimensions.x) * size,
                    screenPosition.y - (cursor.vec.z / levelDimensions.z) * size,
                    0,
                )
                cursor.rot.set(player.direction.x, player.direction.z)
                cursor.player.current.material.rotation = Math.PI / 2 - cursor.rot.angle()
            }
        }

        ...
        
   return (
    ...
    
    {opponentCursors.map((cursor) => {
        return (
            <sprite key={cursor.id} ref={cursor.player} position={screenPosition} scale={[size / 20, size / 20, 1]}>
                <spriteMaterial color="red" alphaMap={cursorTexture} />
            </sprite>
        )
    })}
    <sprite ref={player} position={screenPosition} scale={[size / 20, size / 20, 1]}>
        <spriteMaterial color="white" alphaMap={cursorTexture} />
    </sprite>
    
    ...
    
)
}

```
