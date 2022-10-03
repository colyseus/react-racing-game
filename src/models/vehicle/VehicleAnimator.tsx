import {MathUtils} from 'three'
import {useLayoutEffect} from 'react'
import {useFrame, useThree} from '@react-three/fiber'
import type {RaycastVehicleProps, WheelInfoOptions} from '@react-three/cannon'
import {useRaycastVehicle} from '@react-three/cannon'

import {Dust, Skid} from '../../effects'
import type {WheelInfo} from '../../store'
import {mutation, useStore} from '../../store'
import {Wheel} from './Wheel'
import {getPlayers} from '../../network'
import {ChassisAnimator} from './ChassisAnimator'

type DerivedWheelInfo = WheelInfo & Required<Pick<WheelInfoOptions, 'chassisConnectionPointLocal' | 'isFrontWheel'>>

export function VehicleAnimator(props: any) {
    const defaultCamera = useThree((state) => state.camera)
    const {playerId, angularVelocity, children, position, rotation} = props
    const [chassisBody, vehicleConfig, wheelInfo, wheels] = useStore((s) => [s.chassisBody, s.vehicleConfig, s.wheelInfo, s.wheels])
    const {back, front, height, maxBrake, maxSpeed, width} = vehicleConfig

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

    const [, api] = useRaycastVehicle(() => raycast, null, [wheelInfo])

    useLayoutEffect(() => api.sliding.subscribe((sliding) => (mutation.sliding = sliding)), [api])

    let player = getPlayers().get(playerId)

    let engineValue = player.movement.engineValue
    let i = 0
    let speed = player.movement.speed
    let steeringValue = player.movement.steeringValue

    useFrame((state, delta) => {
        player = getPlayers().get(playerId)

        speed = player.movement.speed

        engineValue = player.movement.engineValue
        steeringValue = player.movement.steeringValue
        for (i = 2; i < 4; i++) api.applyEngineForce(speed < maxSpeed ? engineValue : 0, i)
        for (i = 0; i < 2; i++) api.setSteeringValue(steeringValue, i)
        for (i = 2; i < 4; i++) api.setBrake(player.movement.brake ? (player.movement.forward ? maxBrake / 1.5 : maxBrake) : 0, i)

        // lean chassis
        chassisBody.current!.children[0].rotation.z = MathUtils.lerp(chassisBody.current!.children[0].rotation.z, (-steeringValue * speed) / 200, delta * 4)

        // Set position from the player state
        chassisBody.current!.position.set(player.position.x, player.position.y, player.position.z)

        // Vibrations
        chassisBody.current!.children[0].rotation.x = (Math.sin(state.clock.getElapsedTime() * 20) * (speed / maxSpeed)) / 100
        chassisBody.current!.children[0].rotation.z = (Math.cos(state.clock.getElapsedTime() * 20) * (speed / maxSpeed)) / 100
    })

    return (
        <group>
            <ChassisAnimator ref={chassisBody} {...{angularVelocity, position, rotation}}>
                {children}
            </ChassisAnimator>
            <>
                {wheels.map((wheel, index) => (
                    <Wheel ref={wheel} leftSide={!(index % 2)} key={index}/>
                ))}
            </>
            <Dust/>
            <Skid/>
        </group>
    )
}
