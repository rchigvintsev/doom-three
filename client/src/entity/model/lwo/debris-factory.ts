import {Material, Mesh} from 'three';

import {LwoModelFactory} from './lwo-model-factory';
import {GameConfig} from '../../../game-config';
import {GameAssets} from '../../../game-assets';
import {MaterialFactory} from '../../../material/material-factory';
import {CollisionModelFactory} from '../../../physics/collision-model-factory';
import {LwoModel} from './lwo-model';
import {Debris} from './debris';

export class DebrisFactory extends LwoModelFactory {
    constructor(config: GameConfig,
                private readonly debrisDefs: Map<string, any>,
                assets: GameAssets,
                materialFactory: MaterialFactory,
                private readonly collisionModelFactory: CollisionModelFactory) {
        super(config, assets, materialFactory);
    }

    create(debrisName: string): Debris {
        const debrisDef = this.debrisDefs.get(debrisName);
        if (!debrisDef) {
            throw new Error(`Definition of debris "${debrisName}" is not found`);
        }
        return <Debris>super.create(debrisDef);
    }

    protected createModel(modelDef: any, modelMesh: Mesh, materials: Material[]): LwoModel {
        const collisionModel = this.collisionModelFactory.create(modelDef);
        return new Debris({config: this.config, geometry: modelMesh.geometry, materials, collisionModel});
    }
}