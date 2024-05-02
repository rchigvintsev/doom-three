import {BufferGeometry} from 'three';

import {inject, injectable} from 'inversify';

import {Md5ModelFactory} from '../md5-model-factory';
import {Md5Model} from '../md5-model';
import {ZombieFat} from './zombie-fat';
import {MaterialFactory} from '../../../../material/material-factory';
import {SoundFactory} from '../../../sound/sound-factory';
import {TYPES} from '../../../../types';
import {Monster, MonsterParameters} from './monster';
import {CollisionModelFactory} from '../../../../physics/collision-model-factory';
import {Game} from '../../../../game';

@injectable()
export class MonsterFactory extends Md5ModelFactory {
    constructor(@inject(TYPES.MaterialFactory) materialFactory: MaterialFactory,
                @inject(TYPES.SoundFactory) soundFactory: SoundFactory,
                @inject(TYPES.CollisionModelFactory) private readonly collisionModelFactory: CollisionModelFactory) {
        super(materialFactory, soundFactory);
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
        zombieParams.geometry = geometry;
        zombieParams.materials = this.createMaterials(modelDef, geometry);
        zombieParams.sounds = this.createSounds(modelDef);
        zombieParams.collisionModel = this.collisionModelFactory.create(modelDef.collisionModel);
        zombieParams.scene = Game.getContext().scene;
        return new ZombieFat(zombieParams);
    }
}
