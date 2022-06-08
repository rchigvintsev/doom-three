import {Object3D} from 'three';

import {Entity} from './entity';

export interface EntityFactory<T extends (Entity | Object3D | Object3D[])> {
    create(entityDef: any): T;
}
