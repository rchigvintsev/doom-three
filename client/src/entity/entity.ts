import {PhysicsWorld} from '../physics/physics-world';
import {Scene} from 'three';

export interface Entity {
    registerCollisionModels(physicsWorld: PhysicsWorld, scene: Scene): void;

    update(deltaTime: number): void;
}