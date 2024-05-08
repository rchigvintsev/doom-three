import {BufferGeometry, Intersection, Material, Mesh, Quaternion, Ray, Scene, Vector3} from 'three';

import {MeshBasedEntity, updateMaterials} from '../mesh-based-entity';
import {TangibleEntity} from '../tangible-entity';
import {CollisionModel} from '../../physics/collision-model';
import {PhysicsManager} from '../../physics/physics-manager';
import {Position} from '../../util/position';
import {Weapon} from '../model/md5/weapon/weapon';

export class Surface extends Mesh implements MeshBasedEntity, TangibleEntity {
    readonly tangibleEntity = true;

    constructor(geometry: BufferGeometry,
                materials: Material | Material[],
                private readonly collisionModel: CollisionModel) {
        super(geometry, materials);
        if (collisionModel.hasMass()) {
            collisionModel.onUpdateCallback = (position, quaternion) =>
                this.onCollisionModelUpdate(position, quaternion);
        }
    }

    init() {
        // Do nothing
    }

    get collisionModels(): CollisionModel[] {
        return [this.collisionModel];
    }

    registerCollisionModels(physicsManager: PhysicsManager) {
        this.collisionModel.register(physicsManager);
    }

    unregisterCollisionModels(physicsManager: PhysicsManager) {
        this.collisionModel.unregister(physicsManager);
    }

    update(deltaTime: number) {
        updateMaterials(this, deltaTime);
        this.collisionModel.update(deltaTime);
    }

    onAttack(weapon: Weapon, force: Vector3, ray: Ray, intersection: Intersection) {
        this.collisionModel.onAttack(weapon, force, ray, intersection.point);
        weapon.onHit(this, ray, intersection);
    }

    private onCollisionModelUpdate(position: Position, quaternion: Quaternion) {
        this.position.set(position.x, position.y, position.z);
        this.quaternion.copy(quaternion);
    }
}
