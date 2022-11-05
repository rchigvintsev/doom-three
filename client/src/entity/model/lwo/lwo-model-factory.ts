import {Material, Mesh} from 'three';

import {LwoModel} from './lwo-model';
import {GameConfig} from '../../../game-config';
import {GameAssets} from '../../../game-assets';
import {MaterialFactory} from '../../../material/material-factory';
import {AbstractModelFactory} from '../abstract-model-factory';

export class LwoModelFactory extends AbstractModelFactory<LwoModel> {
    constructor(config: GameConfig,
                private readonly assets: GameAssets,
                materialFactory: MaterialFactory) {
        super(config, materialFactory);
    }

    create(modelDef: any): LwoModel {
        const modelMesh = this.getRequiredModelMesh(modelDef);
        const materials = this.createMaterials(modelDef);
        const model = this.createModel(modelDef, modelMesh, materials);
        model.name = modelDef.name;
        model.scale.setScalar(this.config.worldScale);
        if (modelDef.position) {
            model.position.fromArray(modelDef.position).multiplyScalar(this.config.worldScale);
        }
        model.init();
        return model;
    }

    protected getRequiredModelMesh(modelDef: any): Mesh {
        const mesh = <Mesh>this.assets.modelMeshes.get(modelDef.model);
        if (!mesh) {
            throw new Error(`LWO model mesh "${modelDef.model}" is not found in game assets`);
        }
        return mesh;
    }

    protected createModel(modelDef: any, modelMesh: Mesh, materials: Material[]) {
        return new LwoModel({config: this.config, geometry: modelMesh.geometry, materials});
    }
}
