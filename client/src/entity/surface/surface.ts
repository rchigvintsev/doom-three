import {BufferGeometry, Material, Mesh, Scene, Vector3} from 'three';

import {Entity} from '../entity';
import {CollisionModel} from '../../physics/collision-model';
import {PhysicsWorld} from '../../physics/physics-world';
import {Weapon} from '../md5model/weapon/weapon';

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
        if (this.collisionModel.hasMass()) {
            this.position.copy(this.collisionModel.position);
            this.quaternion.copy(this.collisionModel.quaternion);
        }
    }

    onAttack(hitPoint: Vector3, forceVector: Vector3, weapon: Weapon): void {
        this.collisionModel.onAttack(this.worldToLocal(hitPoint), forceVector, weapon);
        weapon.onHit(this);
    }
}