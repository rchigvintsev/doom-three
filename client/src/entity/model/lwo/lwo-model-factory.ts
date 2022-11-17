import {BufferGeometry, Material, Mesh, MeshBasicMaterial} from 'three';

import {LwoModel} from './lwo-model';
import {AbstractModelFactory, ModelFactoryParameters} from '../abstract-model-factory';

export class LwoModelFactory extends AbstractModelFactory<LwoModel> {
    constructor(parameters: ModelFactoryParameters) {
        super(parameters);
    }

    create(modelDef: any): LwoModel {
        const modelMesh = this.getRequiredModelMesh(modelDef);
        let model;
        if (this.parameters.config.renderOnlyWireframe) {
            model = this.createModel(modelDef, modelMesh.geometry, new MeshBasicMaterial({wireframe: true}));
        } else {
            const materials = this.createMaterials(modelDef);
            model = this.createModel(modelDef, modelMesh.geometry, materials);
            if (this.parameters.config.showWireframe) {
                model.add(new Mesh(modelMesh.geometry, new MeshBasicMaterial({wireframe: true})));
            }
        }
        model.name = modelDef.name;
        model.scale.setScalar(this.parameters.config.worldScale);
        if (modelDef.position) {
            model.position.fromArray(modelDef.position).multiplyScalar(this.parameters.config.worldScale);
        }
        model.init();
        return model;
    }

    protected getRequiredModelMesh(modelDef: any): Mesh {
        const mesh = <Mesh>this.parameters.assets.modelMeshes.get(modelDef.model);
        if (!mesh) {
            throw new Error(`LWO model mesh "${modelDef.model}" is not found in game assets`);
        }
        return mesh;
    }

    protected createModel(modelDef: any, geometry: BufferGeometry, materials: Material | Material[]) {
        return new LwoModel({config: this.parameters.config, geometry, materials});
    }
}
