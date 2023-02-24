import {isUpdatableMaterial} from '../material/updatable-material';
import {GameEntity} from './game-entity';
import {Material, Quaternion, Vector3} from 'three';

export interface MeshBasedEntity extends GameEntity {
    get position(): Vector3;

    get quaternion(): Quaternion;

    get material(): Material | Material[];
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
