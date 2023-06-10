import {Intersection, Ray, Scene, Vector3} from 'three';

import {GameEntity} from './game-entity';
import {Weapon} from './model/md5/weapon/weapon';
import {PhysicsManager} from '../physics/physics-manager';

export interface TangibleEntity extends GameEntity {
    registerCollisionModels(physicsManager: PhysicsManager, scene: Scene): void;

    unregisterCollisionModels(physicsManager: PhysicsManager, scene: Scene): void;

    /**
     * Called when someone attacks this entity.
     */
    onAttack?: (weapon: Weapon, force: Vector3, ray: Ray, intersection: Intersection) => void;
}

export function isTangibleEntity(entity: any): entity is TangibleEntity {
    return entity && entity.tangibleEntity;
}