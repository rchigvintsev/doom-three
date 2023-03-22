import {Object3D} from 'three';

export interface PhysicsBody {
    get name(): string | undefined;

    get helper(): Object3D | undefined;

    reset(): void;
}