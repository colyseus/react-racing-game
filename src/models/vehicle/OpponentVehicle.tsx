import type { RaycastVehicleProps, WheelInfoOptions } from '@react-three/cannon'
import { useRaycastVehicle } from '@react-three/cannon'

import type { WheelInfo } from '../../store'
import { useStore } from '../../store'
import { Wheel } from './Wheel'
import { OpponentChassis } from './OpponentChassis'

type DerivedWheelInfo = WheelInfo & Required<Pick<WheelInfoOptions, 'chassisConnectionPointLocal' | 'isFrontWheel'>>

export function OpponentVehicle(props: any) {
  const { player, angularVelocity, children, position, rotation } = props
  const [chassisBody, vehicleConfig, wheelInfo, wheels] = useStore((s) => [s.opponentChassisBody, s.vehicleConfig, s.wheelInfo, s.wheels])
  const { back, front, height, width } = vehicleConfig

  const wheelInfos = wheels.map((_, index): DerivedWheelInfo => {
    const length = index < 2 ? front : back
    const sideMulti = index % 2 ? 0.5 : -0.5
    return {
      ...wheelInfo,
      chassisConnectionPointLocal: [width * sideMulti, height, length],
      isFrontWheel: Boolean(index % 2),
    }
  })

  const raycast: RaycastVehicleProps = {
    chassisBody,
    wheels,
    wheelInfos,
  }

  const [,] = useRaycastVehicle(() => raycast, null, [wheelInfo])

  return (
    <group>
      <OpponentChassis ref={chassisBody} {...{ angularVelocity, position, rotation, player }}>
        {children}
      </OpponentChassis>
      <>
        {wheels.map((wheel, index) => (
          <Wheel ref={wheel} leftSide={!(index % 2)} key={index} />
        ))}
      </>
    </group>
  )
}
