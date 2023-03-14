import {CollisionModel} from './collision-model';

export interface CollisionModelFactory {
    create(entityDef: any): CollisionModel;
}
