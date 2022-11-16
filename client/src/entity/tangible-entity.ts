import {Scene, Vector3} from 'three';

import {Entity} from './entity';
import {Weapon} from './model/md5/weapon/weapon';
import {PhysicsSystem} from '../physics/physics-system';

export interface TangibleEntity extends Entity {
    registerCollisionModels(physicsSystem: PhysicsSystem, scene: Scene): void;

    unregisterCollisionModels(physicsSystem: PhysicsSystem, scene: Scene): void;

    /**
     * Called when someone attacks this entity with the given weapon.
     *
     * @param hitPoint hit point
     * @param forceVector force vector
     * @param weapon weapon
     */
    onAttack(hitPoint: Vector3, forceVector: Vector3, weapon: Weapon): void;
}

export function isTangibleEntity(entity: any): entity is TangibleEntity {
    return !!entity.registerCollisionModels;
}