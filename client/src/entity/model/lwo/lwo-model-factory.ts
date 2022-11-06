import {Material, Mesh} from 'three';

import {LwoModel} from './lwo-model';
import {AbstractModelFactory, ModelFactoryParameters} from '../abstract-model-factory';

export class LwoModelFactory extends AbstractModelFactory<LwoModel> {
    constructor(parameters: ModelFactoryParameters) {
        super(parameters);
    }

    create(modelDef: any): LwoModel {
        const modelMesh = this.getRequiredModelMesh(modelDef);
        const materials = this.createMaterials(modelDef);
        const model = this.createModel(modelDef, modelMesh, materials);
        model.name = modelDef.name;
        model.scale.setScalar(this.parameters.config.worldScale);
        if (modelDef.position) {
            model.position.fromArray(modelDef.position).multiplyScalar(this.parameters.config.worldScale);
        }
        model.init();
        return model;
    }

    protected getRequiredModelMesh(modelDef: any): Mesh {
        const mesh = <Mesh>this.parameters.assets!.modelMeshes.get(modelDef.model);
        if (!mesh) {
            throw new Error(`LWO model mesh "${modelDef.model}" is not found in game assets`);
        }
        return mesh;
    }

    protected createModel(modelDef: any, modelMesh: Mesh, materials: Material[]) {
        return new LwoModel({config: this.parameters.config, geometry: modelMesh.geometry, materials});
    }
}
