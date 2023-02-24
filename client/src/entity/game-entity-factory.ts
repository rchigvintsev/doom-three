import {Object3D} from 'three';

import {GameEntity} from './game-entity';
import {GameConfig} from '../game-config';
import {GameAssets} from '../game-assets';

export interface GameEntityFactory<T extends (GameEntity | Object3D | Object3D[])> {
    create(entityDef: any): T;
}

export interface GameEntityFactoryParameters {
    config: GameConfig;
    assets?: GameAssets;
}
