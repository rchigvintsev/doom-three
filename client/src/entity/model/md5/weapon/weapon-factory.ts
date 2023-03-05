import {BufferGeometry} from 'three';

import {inject, injectable} from 'inversify';

import {Md5ModelFactory} from '../md5-model-factory';
import {Md5Model} from '../md5-model';
import {Fists} from './fists';
import {Flashlight} from './flashlight';
import {Pistol} from './pistol';
import {FirearmParameters} from './firearm';
import {Shotgun} from './shotgun';
import {CachingSoundFactory} from '../../../sound/caching-sound-factory';
import {GameEntityFactory} from '../../../game-entity-factory';
import {Sound} from '../../../sound/sound';
import {GameAssets} from '../../../../game-assets';
import {GameConfig} from '../../../../game-config';
import {MaterialFactory} from '../../../../material/material-factory';
import {SoundFactory} from '../../../sound/sound-factory';
import {TYPES} from '../../../../types';
import {DebrisManager} from '../../lwo/debris-manager';
import {Weapon} from './weapon';
import {ParticleManager} from '../../../particle/particle-manager';
import {DecalManager} from '../../../decal/decal-manager';

@injectable()
export class WeaponFactory extends Md5ModelFactory {
    private readonly cachingSoundFactory: GameEntityFactory<Sound>;
    constructor(@inject(TYPES.Config) config: GameConfig,
                @inject(TYPES.Assets) assets: GameAssets,
                @inject(TYPES.MaterialFactory) materialFactory: MaterialFactory,
                @inject(TYPES.SoundFactory) soundFactory: SoundFactory,
                @inject(TYPES.ParticleManager) private readonly particleManager: ParticleManager,
                @inject(TYPES.DebrisManager) private readonly debrisManager: DebrisManager,
                @inject(TYPES.DecalManager) private readonly decalManager: DecalManager) {
        super(config, assets,  materialFactory, soundFactory);
        this.cachingSoundFactory = new CachingSoundFactory(soundFactory);
    }

    create(modelDef: any): Weapon {
        return <Weapon>super.create(modelDef);
    }

    protected createModel(modelDef: any, geometry: BufferGeometry): Md5Model {
        if (modelDef.name === 'fists') {
            return this.createFists(modelDef, geometry);
        }
        if (modelDef.name === 'flashlight') {
            return this.createFlashlight(modelDef, geometry);
        }
        if (modelDef.name === 'pistol') {
            return this.createPistol(modelDef, geometry);
        }
        if (modelDef.name === 'shotgun') {
            return this.createShotgun(modelDef, geometry);
        }
        return super.createModel(modelDef, geometry);
    }

    private createFists(modelDef: any, geometry: BufferGeometry): Fists {
        const fistsParams = {
            config: this.config,
            geometry,
            materials: this.createMaterials(modelDef),
            sounds: this.createSounds(modelDef),
            soundFactory: this.cachingSoundFactory
        };
        return new Fists(fistsParams);
    }

    private createFlashlight(modelDef: any, geometry: BufferGeometry): Flashlight {
        let flashlightMap = undefined;
        if (!this.config.renderOnlyWireframe) {
            flashlightMap = this.materialFactory.getTexture('lights/flashlight5');
        }
        const flashlightParams = {
            config: this.config,
            geometry,
            materials: this.createMaterials(modelDef),
            sounds: this.createSounds(modelDef),
            lightMap: flashlightMap,
            soundFactory: this.cachingSoundFactory
        };
        return new Flashlight(flashlightParams);
    }

    private createPistol(modelDef: any, geometry: BufferGeometry): Pistol {
        const pistolParams = {...modelDef} as FirearmParameters;
        pistolParams.config = this.config;
        pistolParams.geometry = geometry;
        pistolParams.materials = this.createMaterials(modelDef);
        pistolParams.sounds = this.createSounds(modelDef);
        pistolParams.soundFactory = this.cachingSoundFactory;
        pistolParams.particleManager = this.particleManager;
        pistolParams.debrisManager = this.debrisManager;
        pistolParams.decalManager = this.decalManager;
        return new Pistol(pistolParams);
    }

    private createShotgun(modelDef: any, geometry: BufferGeometry): Shotgun {
        const shotgunParams = {...modelDef} as FirearmParameters;
        shotgunParams.config = this.config;
        shotgunParams.geometry = geometry;
        shotgunParams.materials = this.createMaterials(modelDef);
        shotgunParams.sounds = this.createSounds(modelDef);
        shotgunParams.soundFactory = this.cachingSoundFactory;
        shotgunParams.particleManager = this.particleManager;
        shotgunParams.debrisManager = this.debrisManager;
        shotgunParams.decalManager = this.decalManager;
        return new Shotgun(shotgunParams);
    }
}
