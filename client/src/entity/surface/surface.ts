import {BufferGeometry, Material, Mesh, Scene, Vector3} from 'three';

import {CollisionModel} from '../../physics/collision-model';
import {PhysicsSystem} from '../../physics/physics-system';
import {Weapon} from '../model/md5/weapon/weapon';
import {MeshBasedEntity, updateCollisionModel, updateMaterials} from '../mesh-based-entity';

export class Surface extends Mesh implements MeshBasedEntity {
    constructor(geometry: BufferGeometry,
                materials: Material | Material[],
                private readonly _collisionModel: CollisionModel) {
        super(geometry, materials);
    }

    registerCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        this.collisionModel?.register(physicsSystem, scene);
    }

    update(deltaTime: number) {
        updateMaterials(this, deltaTime);
        updateCollisionModel(this, deltaTime);
    }

    onAttacked(hitPoint: Vector3, forceVector: Vector3, weapon: Weapon): void {
        this.collisionModel?.onAttack(this.worldToLocal(hitPoint), forceVector, weapon);
        weapon.onHit(this);
    }

    get collisionModel(): CollisionModel | undefined {
        return this._collisionModel;
    }
}
