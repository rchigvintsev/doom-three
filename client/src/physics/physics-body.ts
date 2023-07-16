import {Object3D, Quaternion, Vector3} from 'three';

export interface PhysicsBody {
    get name(): string | undefined;

    get helper(): Object3D | undefined;

    get damageFactor(): number;

    reset(): void;

    getPosition(): Vector3;

    setPosition(position: Vector3): void;

    getQuaternion(): Quaternion;

    setQuaternion(quaternion: Quaternion): void;
}