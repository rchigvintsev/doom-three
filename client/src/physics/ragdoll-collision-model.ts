import {CollisionModel} from './collision-model';
import {PhysicsBody} from './physics-body';

export interface RagdollCollisionModel extends CollisionModel {
    get deadStateBodies(): PhysicsBody[];

    kill(): void;
}

export function isRagdollCollisionModel(collisionModel: any): collisionModel is RagdollCollisionModel {
    return collisionModel && collisionModel.ragdollCollisionModel;
}