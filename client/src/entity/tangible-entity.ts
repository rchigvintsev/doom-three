import {Intersection, Ray, Scene, Vector3} from 'three';

import {GameEntity} from './game-entity';
import {Weapon} from './model/md5/weapon/weapon';
import {PhysicsManager} from '../physics/physics-manager';
import {CollisionModel} from '../physics/collision-model';

export interface TangibleEntity extends GameEntity {
    get collisionModels(): CollisionModel[];

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