import {Object3D, Quaternion, Vector3} from 'three';

export interface PhysicsBody {
    get name(): string | undefined;

    get helper(): Object3D | undefined;

    get damageFactor(): number;

    reset(): void;

    setPosition(position: Vector3): void;

    setQuaternion(quaternion: Quaternion): void;
}