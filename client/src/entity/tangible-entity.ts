import {Intersection, Scene, Vector3, Ray} from 'three';

import {GameEntity} from './game-entity';
import {Weapon} from './model/md5/weapon/weapon';
import {PhysicsManager} from '../physics/physics-manager';

export interface TangibleEntity extends GameEntity {
    registerCollisionModels(physicsManager: PhysicsManager, scene: Scene): void;

    unregisterCollisionModels(physicsManager: PhysicsManager, scene: Scene): void;

    /**
     * Called when someone attacks this entity with the given weapon.
     *
     * @param ray ray cast from weapon to this entity
     * @param intersection intersection of ray cast from weapon with this entity
     * @param forceVector force vector
     * @param weapon weapon
     */
    onAttack(ray: Ray, intersection: Intersection, forceVector: Vector3, weapon: Weapon): void;
}

export function isTangibleEntity(entity: any): entity is TangibleEntity {
    return entity && entity.tangibleEntity;
}