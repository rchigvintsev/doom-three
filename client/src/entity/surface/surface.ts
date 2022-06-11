import {BufferGeometry, Material, Mesh} from 'three';
import {Entity} from '../entity';
import {CollisionModel} from '../../physics/collision-model';
import {PhysicsWorld} from '../../physics/physics-world';

export class Surface extends Mesh implements Entity {
    constructor(geometry: BufferGeometry, materials: Material | Material[], readonly collisionModel: CollisionModel) {
        super(geometry, materials);
        for (const body of this.collisionModel.bodies) {
            if (body.helper) {
                this.add(body.helper);
            }
        }
    }

    registerCollisionModels(physicsWorld: PhysicsWorld): void {
        for (const body of this.collisionModel.bodies) {
            physicsWorld.addBody(body);
        }
    }

    update(_deltaTime: number): void {
        // Do nothing
    }
}