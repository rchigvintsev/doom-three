import {Quaternion, Ray, Scene, Vector3} from 'three';

import {Weapon} from '../entity/model/md5/weapon/weapon';
import {PhysicsManager} from './physics-manager';
import {Position} from '../util/position';
import {PhysicsBody} from './physics-body';
import {CollideEvent} from '../event/collide-event';

export interface CollisionModel {
    get position(): Position;

    get quaternion(): Quaternion;

    get bodies(): PhysicsBody[];

    bodyByName(name: string): PhysicsBody | undefined;

    hasMass(): boolean;

    register(physicsManager: PhysicsManager): void;

    unregister(physicsManager: PhysicsManager): void;

    update(deltaTime: number): void;

    onAttack(weapon: Weapon, force: Vector3, ray: Ray, hitPoint: Vector3): void;

    onHitCallback?: (body: PhysicsBody, weapon: Weapon) => void;

    onUpdateCallback?: (position: Position, quaternion: Quaternion) => void;

    applyImpulse(body: PhysicsBody, impulse: Vector3, relativePoint?: Vector3): void;

    addCollideEventListener(listener: (e: CollideEvent) => void): void;
}
