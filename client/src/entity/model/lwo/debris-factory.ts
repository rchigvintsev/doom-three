import {BufferGeometry, Material} from 'three';

import {inject, injectable} from 'inversify';

import {LwoModelFactory} from './lwo-model-factory';
import {CollisionModelFactory} from '../../../physics/collision-model-factory';
import {LwoModel} from './lwo-model';
import {Debris} from './debris';
import {SoundFactory} from '../../sound/sound-factory';
import {Sound} from '../../sound/sound';
import {TYPES} from '../../../types';
import {GameConfig} from '../../../game-config';
import {GameAssets} from '../../../game-assets';
import {MaterialFactory} from '../../../material/material-factory';

@injectable()
export class DebrisFactory extends LwoModelFactory {
    constructor(@inject(TYPES.Config) config: GameConfig,
                @inject(TYPES.Assets) assets: GameAssets,
                @inject(TYPES.MaterialFactory) materialFactory: MaterialFactory,
                @inject(TYPES.SoundFactory) private readonly soundFactory: SoundFactory,
                @inject(TYPES.CollisionModelFactory) private readonly collisionModelFactory: CollisionModelFactory) {
        super(config, assets, materialFactory);
    }

    create(debrisName: string): Debris {
        const debrisDef = this.assets.debrisDefs.get(debrisName);
        if (!debrisDef) {
            throw new Error(`Definition of debris "${debrisName}" is not found`);
        }
        return <Debris>super.create(debrisDef);
    }

    protected createModel(modelDef: any, geometry: BufferGeometry, materials: Material[]): LwoModel {
        return new Debris({
            config: this.config,
            geometry,
            materials,
            sounds: this.createSounds(modelDef),
            collisionModel: this.createCollisionModel(modelDef),
            time: modelDef.time
        });
    }

    private createSounds(modelDef: any): Map<string, Sound> {
        const sounds = new Map<string, Sound>();
        if (modelDef.sounds) {
            for (const soundName of Object.keys(modelDef.sounds)) {
                sounds.set(soundName, this.soundFactory.create(modelDef.sounds[soundName]));
            }
        }
        return sounds;
    }

    private createCollisionModel(modelDef: any) {
        return this.collisionModelFactory.create(modelDef.collisionModel);
    }
}
