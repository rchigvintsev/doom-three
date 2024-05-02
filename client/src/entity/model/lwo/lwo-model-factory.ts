import {BufferGeometry, Material, Mesh, MeshBasicMaterial} from 'three';

import {LwoModel} from './lwo-model';
import {AbstractModelFactory} from '../abstract-model-factory';
import {MaterialFactory} from '../../../material/material-factory';
import {Game} from '../../../game';

export class LwoModelFactory extends AbstractModelFactory<LwoModel> {
    constructor(materialFactory: MaterialFactory) {
        super(materialFactory);
    }

    create(modelDef: any): LwoModel {
        const modelMesh = this.getRequiredModelMesh(modelDef);
        let model;
        const config = Game.getContext().config;
        if (config.renderOnlyWireframe) {
            model = this.createModel(modelDef, modelMesh.geometry, new MeshBasicMaterial({wireframe: true}));
        } else {
            const materials = this.createMaterials(modelDef);
            model = this.createModel(modelDef, modelMesh.geometry, materials);
            if (config.showWireframe) {
                model.add(new Mesh(modelMesh.geometry, new MeshBasicMaterial({wireframe: true})));
            }
        }
        model.name = modelDef.name;
        model.scale.setScalar(config.worldScale);
        if (modelDef.position) {
            model.position.fromArray(modelDef.position).multiplyScalar(config.worldScale);
        }
        model.init();
        return model;
    }

    protected getRequiredModelMesh(modelDef: any): Mesh {
        const mesh = <Mesh>Game.getContext().assets.modelMeshes.get(modelDef.model);
        if (!mesh) {
            throw new Error(`LWO model mesh "${modelDef.model}" is not found in game assets`);
        }
        return mesh;
    }

    protected createModel(_modelDef: any, geometry: BufferGeometry, materials: Material | Material[]) {
        return new LwoModel({geometry, materials});
    }
}
