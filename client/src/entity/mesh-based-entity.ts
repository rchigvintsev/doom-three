import {isUpdatableMaterial} from '../material/updatable-material';
import {CollisionModel} from '../physics/collision-model';
import {Entity} from './entity';
import {Material, Quaternion, Vector3} from 'three';

export interface MeshBasedEntity extends Entity {
    get position(): Vector3;

    get quaternion(): Quaternion;

    get material(): Material | Material[];

    get collisionModel(): CollisionModel | undefined;
}

export function updateMaterials(entity: MeshBasedEntity, deltaTime: number) {
    if (Array.isArray(entity.material)) {
        for (const material of entity.material) {
            if (isUpdatableMaterial(material)) {
                material.update(deltaTime);
            }
        }
    } else if (isUpdatableMaterial(entity.material)) {
        entity.material.update(deltaTime);
    }
}

export function updateCollisionModel(entity: MeshBasedEntity, deltaTime: number) {
    if (entity.collisionModel) {
        entity.collisionModel.update(deltaTime);
        if (entity.collisionModel.hasMass()) {
            entity.position.copy(entity.collisionModel.position);
            entity.quaternion.copy(entity.collisionModel.quaternion);
        }
    }
}
