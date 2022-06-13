import {BufferGeometry, Material, Mesh, Scene} from 'three';

import {Entity} from '../entity';
import {CollisionModel} from '../../physics/collision-model';
import {PhysicsWorld} from '../../physics/physics-world';

export class Surface extends Mesh implements Entity {
    constructor(geometry: BufferGeometry,
                materials: Material | Material[],
                private readonly collisionModel: CollisionModel) {
        super(geometry, materials);
    }

    registerCollisionModels(physicsWorld: PhysicsWorld, scene: Scene) {
        this.collisionModel.register(physicsWorld, scene);
    }

    update(deltaTime: number) {
        this.collisionModel.update(deltaTime);
    }
}