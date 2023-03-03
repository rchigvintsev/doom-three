import {BufferGeometry, Intersection, Material, Mesh, Quaternion, Scene, Vector3} from 'three';

import {MeshBasedEntity, updateMaterials} from '../mesh-based-entity';
import {TangibleEntity} from '../tangible-entity';
import {CollisionModel} from '../../physics/collision-model';
import {Weapon} from '../model/md5/weapon/weapon';
import {PhysicsManager} from '../../physics/physics-manager';

export class Surface extends Mesh implements MeshBasedEntity, TangibleEntity {
    readonly tangibleEntity = true;

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

    registerCollisionModels(physicsManager: PhysicsManager, scene: Scene) {
        this.collisionModel.register(physicsManager, scene);
    }

    unregisterCollisionModels(physicsManager: PhysicsManager, scene: Scene) {
        this.collisionModel.unregister(physicsManager, scene);
    }

    update(deltaTime: number) {
        updateMaterials(this, deltaTime);
        this.collisionModel.update(deltaTime);
    }

    onAttack(intersection: Intersection, forceVector: Vector3, weapon: Weapon) {
        this.collisionModel.onAttack(intersection.point, forceVector, weapon);
        weapon.onHit(this, intersection);
    }

    private onCollisionModelUpdate(position: Vector3, quaternion: Quaternion) {
        this.position.copy(position);
        this.quaternion.copy(quaternion);
    }
}
