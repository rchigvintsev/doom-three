import {BufferGeometry, Material, Mesh, Scene, Vector3} from 'three';

import {Entity} from '../entity';
import {CollisionModel} from '../../physics/collision-model';
import {PhysicsSystem} from '../../physics/physics-system';
import {Weapon} from '../model/md5/weapon/weapon';
import {MeshBasedEntity, MeshBasedEntityMixin} from '../mesh-based-entity';
import {applyMixins} from '../../util/mixins';

export class Surface extends Mesh implements Entity, MeshBasedEntity {
    constructor(geometry: BufferGeometry,
                materials: Material | Material[],
                private readonly collisionModel: CollisionModel) {
        super(geometry, materials);
    }

    registerCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        this.collisionModel.register(physicsSystem, scene);
    }

    update(deltaTime: number) {
        this.updateMaterials(this, deltaTime);
        this.updateCollisionModel(this, this.collisionModel, deltaTime);
    }

    onAttack(hitPoint: Vector3, forceVector: Vector3, weapon: Weapon): void {
        this.collisionModel.onAttack(this.worldToLocal(hitPoint), forceVector, weapon);
        weapon.onHit(this);
    }

    updateMaterials(_mesh: Mesh, _deltaTime: number) {
        // Implemented in MeshBasedEntityMixin
    }

    updateCollisionModel(_mesh: Mesh, _collisionModel: CollisionModel | undefined, _deltaTime: number) {
        // Implemented in MeshBasedEntityMixin
    }
}

applyMixins(Surface, MeshBasedEntityMixin);