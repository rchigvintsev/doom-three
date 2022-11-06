import {Audio, Material, Mesh} from 'three';

import {LwoModelFactory} from './lwo-model-factory';
import {CollisionModelFactory} from '../../../physics/collision-model-factory';
import {LwoModel} from './lwo-model';
import {Debris} from './debris';
import {ModelFactoryParameters} from '../abstract-model-factory';
import {SoundFactory} from '../../sound/sound-factory';

export class DebrisFactory extends LwoModelFactory {
    constructor(parameters: DebrisFactoryParameters) {
        super(parameters);
    }

    create(debrisName: string): Debris {
        const debrisDef = (<DebrisFactoryParameters>this.parameters).debrisDefs.get(debrisName);
        if (!debrisDef) {
            throw new Error(`Definition of debris "${debrisName}" is not found`);
        }
        return <Debris>super.create(debrisDef);
    }

    protected createModel(modelDef: any, modelMesh: Mesh, materials: Material[]): LwoModel {
        const sounds = this.createSounds(modelDef);
        const collisionModel = (<DebrisFactoryParameters>this.parameters).collisionModelFactory.create(modelDef);
        return new Debris({
            config: this.parameters.config,
            geometry: modelMesh.geometry,
            materials,
            sounds,
            collisionModel
        });
    }

    private createSounds(modelDef: any): Map<string, Audio<AudioNode>[]> {
        const sounds = new Map<string, Audio<AudioNode>[]>();
        const soundFactory = (<DebrisFactoryParameters>this.parameters).soundFactory;
        if (modelDef.sounds) {
            for (const soundName of Object.keys(modelDef.sounds)) {
                sounds.set(soundName, soundFactory.create(modelDef.sounds[soundName]));
            }
        }
        return sounds;
    }
}

export class DebrisFactoryParameters extends ModelFactoryParameters {
    debrisDefs!: Map<string, any>;
    soundFactory!: SoundFactory;
    collisionModelFactory!: CollisionModelFactory;
}