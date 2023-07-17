import {BufferGeometry, Scene} from 'three';

import {inject, injectable} from 'inversify';

import {Md5ModelFactory} from '../md5-model-factory';
import {Md5Model} from '../md5-model';
import {ZombieFat} from './zombie-fat';
import {GameConfig} from '../../../../game-config';
import {GameAssets} from '../../../../game-assets';
import {MaterialFactory} from '../../../../material/material-factory';
import {SoundFactory} from '../../../sound/sound-factory';
import {TYPES} from '../../../../types';
import {Monster, MonsterParameters} from './monster';
import {CollisionModelFactory} from '../../../../physics/collision-model-factory';
import {MonsterWanderBehavior} from '../../../../ai/monster-wander-behavior';

@injectable()
export class MonsterFactory extends Md5ModelFactory {
    constructor(@inject(TYPES.Config) config: GameConfig,
                @inject(TYPES.Assets) assets: GameAssets,
                @inject(TYPES.MaterialFactory) materialFactory: MaterialFactory,
                @inject(TYPES.SoundFactory) soundFactory: SoundFactory,
                @inject(TYPES.Scene) private readonly scene: Scene,
                @inject(TYPES.CollisionModelFactory) private readonly collisionModelFactory: CollisionModelFactory) {
        super(config, assets, materialFactory, soundFactory);
    }
    create(modelDef: any): Monster {
        const monster = <Monster>super.create(modelDef);
        monster.behaviors.push(new MonsterWanderBehavior(monster));
        return monster;
    }

    protected createModel(modelDef: any, geometry: BufferGeometry): Md5Model {
        if (modelDef.type === 'monster_zombie_fat') {
            return this.createZombieFat(modelDef, geometry);
        }
        return super.createModel(modelDef, geometry);
    }

    private createZombieFat(modelDef: any, geometry: BufferGeometry): ZombieFat {
        const zombieParams = {...modelDef} as MonsterParameters;
        zombieParams.config = this.config;
        zombieParams.geometry = geometry;
        zombieParams.materials = this.createMaterials(modelDef, geometry);
        zombieParams.sounds = this.createSounds(modelDef);
        zombieParams.collisionModel = this.collisionModelFactory.create(modelDef.collisionModel);
        zombieParams.scene = this.scene;
        return new ZombieFat(zombieParams);
    }
}
