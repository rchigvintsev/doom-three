import {Mesh} from 'three';

import {isUpdatableMaterial} from '../material/updatable-material';
import {CollisionModel} from '../physics/collision-model';

export interface MeshBasedEntity {
    updateMaterials(mesh: Mesh, deltaTime: number): void;

    updateCollisionModel(mesh: Mesh, collisionModel: CollisionModel | undefined, deltaTime: number): void;
}

export class MeshBasedEntityMixin implements MeshBasedEntity {
    updateMaterials(mesh: Mesh, deltaTime: number) {
        if (Array.isArray(mesh.material)) {
            for (const material of mesh.material) {
                if (isUpdatableMaterial(material)) {
                    material.update(deltaTime);
                }
            }
        } else if (isUpdatableMaterial(mesh.material)) {
            mesh.material.update(deltaTime);
        }
    }

    updateCollisionModel(mesh: Mesh, collisionModel: CollisionModel | undefined, deltaTime: number) {
        if (collisionModel) {
            collisionModel.update(deltaTime);
            if (collisionModel.hasMass()) {
                mesh.position.copy(collisionModel.position);
                mesh.quaternion.copy(collisionModel.quaternion);
            }
        }
    }
}
