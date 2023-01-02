import {BufferGeometry, Intersection, Material, Mesh, Quaternion, Scene, Vector3} from 'three';

import {MeshBasedEntity, updateMaterials} from '../mesh-based-entity';
import {TangibleEntity} from '../tangible-entity';
import {CollisionModel} from '../../physics/collision-model';
import {PhysicsSystem} from '../../physics/physics-system';
import {Weapon} from '../model/md5/weapon/weapon';

export class Surface extends Mesh implements MeshBasedEntity, TangibleEntity {
    constructor(geometry: BufferGeometry,
                materials: Material | Material[],
                private readonly collisionModel: CollisionModel) {
        super(geometry, materials);
        if (collisionModel.hasMass()) {
            collisionModel.onUpdate = (position, quaternion) =>
                this.onCollisionModelUpdate(position, quaternion);
        }
    }

    init() {
        // Do nothing
    }

    registerCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        this.collisionModel.register(physicsSystem, scene);
    }

    unregisterCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        this.collisionModel.unregister(physicsSystem, scene);
    }

    update(deltaTime: number) {
        updateMaterials(this, deltaTime);
        this.collisionModel.update(deltaTime);
    }

    onAttack(intersection: Intersection, forceVector: Vector3, weapon: Weapon) {
        this.collisionModel.onAttack(this.worldToLocal(intersection.point), forceVector, weapon);
        weapon.onHit(this, intersection);
    }

    private onCollisionModelUpdate(position: Vector3, quaternion: Quaternion) {
        this.position.copy(position);
        this.quaternion.copy(quaternion);
    }
}
