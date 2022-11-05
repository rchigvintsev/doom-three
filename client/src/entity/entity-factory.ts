import {Object3D} from 'three';

import {Entity} from './entity';
import {GameConfig} from '../game-config';
import {GameAssets} from '../game-assets';

export interface EntityFactory<T extends (Entity | Object3D | Object3D[])> {
    create(entityDef: any): T;
}

export class EntityFactoryParameters {
    config!: GameConfig;
    assets?: GameAssets;
}
