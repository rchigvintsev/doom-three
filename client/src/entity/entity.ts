import {Scene, Vector3} from 'three';

import {PhysicsWorld} from '../physics/physics-world';
import {Weapon} from './md5model/weapon/weapon';

export interface Entity {
    registerCollisionModels(physicsWorld: PhysicsWorld, scene: Scene): void;

    update(deltaTime: number): void;

    onHit(hitPoint: Vector3, weapon: Weapon): void;
}

export function isHittableEntity(obj: any): boolean {
    return obj && obj.onHit;
}