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

    getBody(name: string): PhysicsBody | undefined;

    hasMass(): boolean;

    register(physicsManager: PhysicsManager, scene: Scene): void;

    unregister(physicsManager: PhysicsManager, scene: Scene): void;

    update(deltaTime: number): void;

    get onUpdate(): (position: Position, quaternion: Quaternion) => void;

    set onUpdate(callback: (position: Position, quaternion: Quaternion) => void);

    onAttack(ray: Ray, hitPoint: Vector3, forceVector: Vector3, weapon: Weapon): void;

    applyImpulse(impulse: Vector3, relativePoint?: Vector3): void;

    addCollideEventListener(listener: (e: CollideEvent) => void): void;
}
