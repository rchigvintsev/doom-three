import {Quaternion, Vector3} from 'three';
import {PhysicsBodyHelper} from './physics-body-helper';

export interface PhysicsBody {
    get name(): string | undefined;

    get helper(): PhysicsBodyHelper | undefined;

    get damageFactor(): number;

    get height(): number;

    /**
     * Returns true if this physics body is a bounding box.
     */
    get boundingBox(): boolean;

    reset(): void;

    getPosition(): Vector3;

    setPosition(position: Vector3): void;

    getQuaternion(): Quaternion;

    setQuaternion(quaternion: Quaternion): void;
}