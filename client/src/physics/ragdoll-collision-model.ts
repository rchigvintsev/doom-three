import {CollisionModel} from './collision-model';

export interface RagdollCollisionModel extends CollisionModel {
    kill(): void;
}