import {Intersection, Scene, Vector3} from 'three';

import {GameEntity} from './game-entity';
import {Weapon} from './model/md5/weapon/weapon';
import {PhysicsSystem} from '../physics/physics-system';

export interface TangibleEntity extends GameEntity {
    registerCollisionModels(physicsSystem: PhysicsSystem, scene: Scene): void;

    unregisterCollisionModels(physicsSystem: PhysicsSystem, scene: Scene): void;

    /**
     * Called when someone attacks this entity with the given weapon.
     *
     * @param intersection intersection of ray cast from weapon with this entity
     * @param forceVector force vector
     * @param weapon weapon
     */
    onAttack(intersection: Intersection, forceVector: Vector3, weapon: Weapon): void;
}

export function isTangibleEntity(entity: any): entity is TangibleEntity {
    return entity && entity.tangibleEntity;
}