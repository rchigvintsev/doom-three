import {BufferGeometry, Material, Mesh, Quaternion, Scene, Vector3} from 'three';

import {MeshBasedEntity, updateMaterials} from '../mesh-based-entity';
import {TangibleEntity} from '../tangible-entity';
import {CollisionModel} from '../../physics/collision-model';
import {PhysicsSystem} from '../../physics/physics-system';
import {Weapon} from '../model/md5/weapon/weapon';

export class Surface extends Mesh implements MeshBasedEntity, TangibleEntity {
    constructor(geometry: BufferGeometry,
                materials: Material | Material[],
                private readonly _collisionModel: CollisionModel) {
        super(geometry, materials);
        if (_collisionModel.hasMass()) {
            _collisionModel.onUpdate = (position, quaternion) =>
                this.onCollisionModelUpdate(position, quaternion);
        }
    }

    init() {
        // Do nothing
    }

    registerCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        this._collisionModel.register(physicsSystem, scene);
    }

    unregisterCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        this._collisionModel.unregister(physicsSystem, scene);
    }

    update(deltaTime: number) {
        updateMaterials(this, deltaTime);
        this._collisionModel.update(deltaTime);
    }

    onAttack(hitPoint: Vector3, forceVector: Vector3, weapon: Weapon): void {
        this._collisionModel.onAttack(this.worldToLocal(hitPoint), forceVector, weapon);
        weapon.onHit(this);
    }

    private onCollisionModelUpdate(position: Vector3, quaternion: Quaternion) {
        this.position.copy(position);
        this.quaternion.copy(quaternion);
    }
}
