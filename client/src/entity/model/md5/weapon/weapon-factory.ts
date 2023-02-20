import {BufferGeometry} from 'three';

import {Md5ModelFactory, Md5ModelFactoryParameters} from '../md5-model-factory';
import {Md5Model} from '../md5-model';
import {Fists} from './fists';
import {Flashlight} from './flashlight';
import {Pistol} from './pistol';
import {FirearmParameters} from './firearm';
import {Shotgun} from './shotgun';
import {SoundSystem} from '../../../../sound/sound-system';

export class WeaponFactory extends Md5ModelFactory {
    constructor(parameters: WeaponFactoryParameters) {
        super(parameters);
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
            config: this.parameters.config,
            geometry,
            materials: this.createMaterials(modelDef),
            sounds: this.createSounds(modelDef),
            soundSystem: this.soundSystem
        };
        return new Fists(fistsParams);
    }

    private createFlashlight(modelDef: any, geometry: BufferGeometry): Flashlight {
        let flashlightMap = undefined;
        if (!this.parameters.config.renderOnlyWireframe) {
            flashlightMap = this.parameters.materialFactory.getTexture('lights/flashlight5');
        }
        const flashlightParams = {
            config: this.parameters.config,
            geometry,
            materials: this.createMaterials(modelDef),
            sounds: this.createSounds(modelDef),
            lightMap: flashlightMap,
            soundSystem: this.soundSystem
        };
        return new Flashlight(flashlightParams);
    }

    private createPistol(modelDef: any, geometry: BufferGeometry): Pistol {
        const pistolParams = {...modelDef} as FirearmParameters;
        pistolParams.config = this.parameters.config;
        pistolParams.geometry = geometry;
        pistolParams.materials = this.createMaterials(modelDef);
        pistolParams.sounds = this.createSounds(modelDef);
        pistolParams.particleSystem = this.particleSystem;
        pistolParams.debrisSystem = this.debrisSystem;
        pistolParams.decalSystem = this.decalSystem;
        pistolParams.soundSystem = this.soundSystem;
        return new Pistol(pistolParams);
    }

    private createShotgun(modelDef: any, geometry: BufferGeometry): Shotgun {
        const shotgunParams = {...modelDef} as FirearmParameters;
        shotgunParams.config = this.parameters.config;
        shotgunParams.geometry = geometry;
        shotgunParams.materials = this.createMaterials(modelDef);
        shotgunParams.sounds = this.createSounds(modelDef);
        shotgunParams.particleSystem = this.particleSystem;
        shotgunParams.debrisSystem = this.debrisSystem;
        shotgunParams.decalSystem = this.decalSystem;
        shotgunParams.soundSystem = this.soundSystem;
        return new Shotgun(shotgunParams);
    }

    private get soundSystem(): SoundSystem {
        return (<WeaponFactoryParameters>this.parameters).soundSystem;
    }
}

export interface WeaponFactoryParameters extends Md5ModelFactoryParameters {
    soundSystem: SoundSystem;
}
