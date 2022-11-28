import {BufferGeometry, Material} from 'three';

import {GameConfig} from '../../game-config';
import {CollisionModel} from '../../physics/collision-model';

export interface ModelParameters {
    config: GameConfig;
    geometry: BufferGeometry;
    materials: Material | Material[];
    collisionModel?: CollisionModel;
}