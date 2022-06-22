import {BufferGeometry, Material, Mesh, Scene, Vector3} from 'three';

import {Entity} from '../entity';
import {CollisionModel} from '../../physics/collision-model';
import {PhysicsWorld} from '../../physics/physics-world';
import {Weapon} from '../md5model/weapon/weapon';
import {Fists} from '../md5model/weapon/fists';

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

    onHit(hitPoint: Vector3, weapon: Weapon): void {
        if (weapon instanceof Fists) {
            weapon.playImpactSound();
        }
    }
}