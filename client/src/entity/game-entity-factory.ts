import {Object3D} from 'three';

import {GameEntity} from './game-entity';

export interface GameEntityFactory<T extends (GameEntity | Object3D | Object3D[])> {
    create(parameters: any): T;
}
