import {Material, Mesh} from 'three';

import {LwoModelFactory} from './lwo-model-factory';
import {CollisionModelFactory} from '../../../physics/collision-model-factory';
import {LwoModel} from './lwo-model';
import {Debris} from './debris';
import {ModelFactoryParameters} from '../abstract-model-factory';

export class DebrisFactory extends LwoModelFactory {
    constructor(parameters: DebrisFactoryParameters) {
        super(parameters);
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

    private get debrisDefs(): Map<string, any> {
        return (<DebrisFactoryParameters>this.parameters).debrisDefs;
    }

    private get collisionModelFactory(): CollisionModelFactory {
        return (<DebrisFactoryParameters>this.parameters).collisionModelFactory;
    }
}

export class DebrisFactoryParameters extends ModelFactoryParameters {
    debrisDefs!: Map<string, any>;
    collisionModelFactory!: CollisionModelFactory;
}