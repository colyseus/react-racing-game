import type { PropsWithChildren } from 'react'
import { forwardRef, useEffect, useRef } from 'react'
import type { BoxProps } from '@react-three/cannon'
import { useBox } from '@react-three/cannon'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { BoxBufferGeometry, Group, Mesh, MeshStandardMaterial } from 'three'

import { setState } from '../../store'
import { getPlayers } from '../../network'
import type { Player } from '../../GameRoomState'
import type { ChassisGLTF } from './Chassis'

/*
Initially generated by: https://github.com/pmndrs/gltfjsx
author: Alexus16 (https://sketchfab.com/Alexus16)
license: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
source: https://sketchfab.com/3d-models/classic-muscle-car-641efc889e5f4543bae51d0922e6f4b3
title: Classic Muscle car
*/

type MaterialMesh = Mesh<BoxBufferGeometry, MeshStandardMaterial>

export const ChassisAnimator = forwardRef<Group, PropsWithChildren<BoxProps>>(({
                                                                                   args = [2, 1.1, 4.7],
                                                                                   mass = 500,
                                                                                   children,
                                                                                   ...props
                                                                               }, ref) => {
    const glass = useRef<MaterialMesh>(null!)
    const brake = useRef<MaterialMesh>(null!)
    const wheel = useRef<Group>(null)
    const needle = useRef<MaterialMesh>(null!)
    
    const chassis_1 = useRef<MaterialMesh>(null!)

    const { nodes: n, materials: m } = useGLTF('/models/chassis-animator-draco.glb') as ChassisGLTF

    const [, api] = useBox(() => ({mass, args, allowSleep: false, collisionResponse: false, ...props}), ref)

    useEffect(() => {
        setState({api})
        return () => setState({api: null})
    }, [api])

    const player: Player = getPlayers().get((children as any[])[1])

    useFrame((_, delta) => {
        chassis_1.current.material.color.set('maroon')

        // Set synchronized player movement for the frame
        api.position.set(player.position.x, player.position.y, player.position.z)
        api.quaternion.set(player.rotation.x, player.rotation.y, player.rotation.z, player.rotation.w)
        // chassis_1.current.parent!.position.set(player.position.x, player.position.y, player.position.z)
        // ref_.current!.position.lerp(new Vector3(player.position.x, player.position.y, player.position.z), 0.1)
    })

    return (
        <group ref={ref} dispose={null}>
            <group position={[0, -0.2, -0.2]}>
                <mesh ref={chassis_1} castShadow receiveShadow geometry={n.Chassis_1.geometry} material={m.BodyPaint}
                      material-color="#f0c050"/>
                <mesh castShadow geometry={n.Chassis_2.geometry} material={n.Chassis_2.material}
                      material-color="#353535"/>
                <mesh castShadow ref={glass} geometry={n.Glass.geometry} material={m.Glass} material-transparent/>
                <mesh ref={brake} geometry={n.BrakeLights.geometry} material={m.BrakeLight} material-transparent/>
                <mesh geometry={n.HeadLights.geometry} material={m.HeadLight}/>
                <mesh geometry={n.Cabin_Grilles.geometry} material={m.Black}/>
                <mesh geometry={n.Undercarriage.geometry} material={m.Undercarriage}/>
                <mesh geometry={n.TurnSignals.geometry} material={m.TurnSignal}/>
                <mesh geometry={n.Chrome.geometry} material={n.Chrome.material}/>
                <group ref={wheel} position={[0.37, 0.25, 0.46]}>
                    <mesh geometry={n.Wheel_1.geometry} material={n.Wheel_1.material}/>
                    <mesh geometry={n.Wheel_2.geometry} material={n.Wheel_2.material}/>
                </group>
                <group position={[0, 0, 0]}>
                    <mesh geometry={n.License_1.geometry} material={m.License}/>
                    <mesh geometry={n.License_2.geometry} material={n.License_2.material}/>
                </group>
                <group position={[0.2245, 0.3045, 0.6806]} scale={[0.0594, 0.0594, 0.0594]}>
                    <mesh geometry={n.Cube013.geometry} material={n.Cube013.material}/>
                    <mesh geometry={n.Cube013_1.geometry} material={n.Cube013_1.material}/>
                    <mesh geometry={n.Cube013_2.geometry} material={n.Cube013_2.material}/>
                </group>
                <mesh
                    geometry={n['pointer-left'].geometry}
                    material={n['pointer-left'].material}
                    position={[0.5107, 0.3045, 0.6536]}
                    rotation={[Math.PI / 2, -1.1954, 0]}
                    scale={[0.0209, 0.0209, 0.0209]}
                />
                <mesh
                    ref={needle}
                    geometry={n['pointer-right'].geometry}
                    material={n['pointer-right'].material}
                    position={[0.2245, 0.3045, 0.6536]}
                    rotation={[-Math.PI / 2, -0.9187, Math.PI]}
                    scale={[0.0209, 0.0209, 0.0209]}
                />
            </group>
            {children}
        </group>
    )
})
