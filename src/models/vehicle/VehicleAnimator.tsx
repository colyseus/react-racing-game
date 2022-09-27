import { MathUtils, Vector3 } from 'three'
import { useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useRaycastVehicle } from '@react-three/cannon'

import type { PropsWithChildren } from 'react'
import type { BoxProps, RaycastVehicleProps, WheelInfoOptions } from '@react-three/cannon'

import { AccelerateAudio, BoostAudio, Boost, BrakeAudio, Dust, EngineAudio, HonkAudio, Skid } from '../../effects'
import { getState, mutation, useStore } from '../../store'
import { Wheel } from './Wheel'

import type { Camera, Controls, WheelInfo } from '../../store'
import {getPlayers} from "../../network";
import {ChassisAnimator} from "./ChassisAnimator";

const { lerp } = MathUtils
const v = new Vector3()

type DerivedWheelInfo = WheelInfo & Required<Pick<WheelInfoOptions, 'chassisConnectionPointLocal' | 'isFrontWheel'>>

export function VehicleAnimator(props: any) {
    const defaultCamera = useThree((state) => state.camera)
    const { playerId, angularVelocity, children, position, rotation } = props
    const [chassisBody, vehicleConfig, wheelInfo, wheels] = useStore((s) => [s.chassisBody, s.vehicleConfig, s.wheelInfo, s.wheels])
    const { back, force, front, height, maxBrake, steer, maxSpeed, width } = vehicleConfig

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

    const player = getPlayers().get(playerId)

    let camera: Camera
    let editor: boolean = false
    let engineValue = player.movement.engineValue
    let i = 0
    let isBoosting = player.movement.isBoosting
    let speed = player.movement.speed
    let steeringValue = player.movement.steeringValue
    let swaySpeed = player.movement.swaySpeed
    let swayTarget = player.movement.swayTarget
    let swayValue = player.movement.swayValue

    useFrame((state, delta) => {
        camera = getState().camera
        speed = player.movement.speed

        // isBoosting = player.movement.isBoosting

        // if (isBoosting) {
        //     mutation.boost = Math.max(mutation.boost - 1, 0)
        // }

        engineValue = player.movement.engineValue
        steeringValue = player.movement.steeringValue
        for (i = 2; i < 4; i++) api.applyEngineForce(speed < maxSpeed ? engineValue : 0, i)
        for (i = 0; i < 2; i++) api.setSteeringValue(steeringValue, i)
        for (i = 2; i < 4; i++) api.setBrake(player.movement.brake ? (player.movement.forward ? maxBrake / 1.5 : maxBrake) : 0, i)

        // if (!editor) {
        //     if (camera === 'FIRST_PERSON') {
        //         v.set(0.3 + (Math.sin(-steeringValue) * speed) / 30, 0.4, -0.1)
        //     } else if (camera === 'DEFAULT') {
        //         v.set((Math.sin(steeringValue) * speed) / 2.5, 1.25 + (engineValue / 1000) * -0.5, -5 - speed / 15 + (player.movement.brake ? 1 : 0))
        //     }

            // ctrl.left-ctrl.right, up-down, near-far
            // defaultCamera.position.lerp(v, delta)

            // ctrl.left-ctrl.right swivel
            // defaultCamera.rotation.z = lerp(
            //     defaultCamera.rotation.z,
            //     (camera !== 'BIRD_EYE' ? 0 : Math.PI) + (-steeringValue * speed) / (camera === 'DEFAULT' ? 40 : 60),
            //     delta,
            // )
        // }

        // lean chassis
        chassisBody.current!.children[0].rotation.z = MathUtils.lerp(chassisBody.current!.children[0].rotation.z, (-steeringValue * speed) / 200, delta * 4)
        chassisBody.current!.position.set(player.position.x, player.position.y, player.position.z)
        chassisBody.current!.children[0].position.set(player.position.x, player.position.y, player.position.z)

        // Camera sway
        swaySpeed = player.movement.swaySpeed
        // swayTarget = player.movement.swayTarget
        swayValue = player.movement.swayValue
        defaultCamera.rotation.z += (Math.sin(state.clock.elapsedTime * swaySpeed * 0.9) / 1000) * swayValue
        defaultCamera.rotation.x += (Math.sin(state.clock.elapsedTime * swaySpeed) / 1000) * swayValue

        // Vibrations
        chassisBody.current!.children[0].rotation.x = (Math.sin(state.clock.getElapsedTime() * 20) * (speed / maxSpeed)) / 100
        chassisBody.current!.children[0].rotation.z = (Math.cos(state.clock.getElapsedTime() * 20) * (speed / maxSpeed)) / 100
    })

    // const ToggledAccelerateAudio = useToggle(AccelerateAudio, ['ready', 'sound'])
    // const ToggledEngineAudio = useToggle(EngineAudio, ['ready', 'sound'])

    return (
        <group>
            <ChassisAnimator ref={chassisBody} {...{ angularVelocity, position, rotation }}>
                {/*<ToggledAccelerateAudio />*/}
                <BoostAudio />
                <BrakeAudio />
                {/*<ToggledEngineAudio />*/}
                <HonkAudio />
                <Boost />
                {children}
            </ChassisAnimator>
            <>
                {wheels.map((wheel, index) => (
                    <Wheel ref={wheel} leftSide={!(index % 2)} key={index} />
                ))}
            </>
            <Dust />
            <Skid />
        </group>
    )
}
