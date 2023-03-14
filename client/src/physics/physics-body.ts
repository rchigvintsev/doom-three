import {Object3D} from 'three';

export interface PhysicsBody {
    reset(): void;

    get helper(): Object3D | undefined;
}