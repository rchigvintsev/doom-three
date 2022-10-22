import {Scene, Vector3} from 'three';

import {PhysicsSystem} from '../physics/physics-system';
import {Weapon} from './md5model/weapon/weapon';

export interface Entity {
    registerCollisionModels(physicsSystem: PhysicsSystem, scene: Scene): void;

    update(deltaTime: number): void;

    /**
     * Called when someone attacks this entity with the given weapon.
     *
     * @param hitPoint hit point
     * @param forceVector force vector
     * @param weapon weapon
     */
    onAttack(hitPoint: Vector3, forceVector: Vector3, weapon: Weapon): void;
}
