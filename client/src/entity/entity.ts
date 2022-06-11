import {PhysicsWorld} from '../physics/physics-world';

export interface Entity {
    registerCollisionModels(physicsWorld: PhysicsWorld): void;

    update(deltaTime: number): void;
}