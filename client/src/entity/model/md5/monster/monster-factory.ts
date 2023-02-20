import {BufferGeometry} from 'three';

import {Md5ModelFactory, Md5ModelFactoryParameters} from '../md5-model-factory';
import {Md5Model, Md5ModelParameters} from '../md5-model';
import {ZombieFat} from './zombie-fat';

export class MonsterFactory extends Md5ModelFactory {
    constructor(parameters: Md5ModelFactoryParameters) {
        super(parameters);
    }

    protected createModel(modelDef: any, geometry: BufferGeometry): Md5Model {
        if (modelDef.type === 'monster_zombie_fat') {
            return this.createZombieFat(modelDef, geometry);
        }
        return super.createModel(modelDef, geometry);
    }

    private createZombieFat(modelDef: any, geometry: BufferGeometry): ZombieFat {
        const zombieParams = {...modelDef} as Md5ModelParameters;
        zombieParams.config = this.parameters.config;
        zombieParams.geometry = geometry;
        zombieParams.materials = this.createMaterials(modelDef);
        zombieParams.sounds = this.createSounds(modelDef);
        return new ZombieFat(zombieParams);
    }
}
