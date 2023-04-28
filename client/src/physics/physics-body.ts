import {Object3D, Quaternion, Vector3} from 'three';

export interface PhysicsBody {
    get name(): string | undefined;

    get helper(): Object3D | undefined;

    reset(): void;

    setPosition(position: Vector3): void;

    setQuaternion(quaternion: Quaternion): void;
}