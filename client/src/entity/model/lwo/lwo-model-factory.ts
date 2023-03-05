import {BufferGeometry, Material, Mesh, MeshBasicMaterial} from 'three';

import {LwoModel} from './lwo-model';
import {AbstractModelFactory} from '../abstract-model-factory';
import {GameConfig} from '../../../game-config';
import {MaterialFactory} from '../../../material/material-factory';
import {GameAssets} from '../../../game-assets';

export class LwoModelFactory extends AbstractModelFactory<LwoModel> {
    constructor(config: GameConfig, assets: GameAssets, materialFactory: MaterialFactory) {
        super(config, assets, materialFactory);
    }

    create(modelDef: any): LwoModel {
        const modelMesh = this.getRequiredModelMesh(modelDef);
        let model;
        if (this.config.renderOnlyWireframe) {
            model = this.createModel(modelDef, modelMesh.geometry, new MeshBasicMaterial({wireframe: true}));
        } else {
            const materials = this.createMaterials(modelDef);
            model = this.createModel(modelDef, modelMesh.geometry, materials);
            if (this.config.showWireframe) {
                model.add(new Mesh(modelMesh.geometry, new MeshBasicMaterial({wireframe: true})));
            }
        }
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

    protected createModel(modelDef: any, geometry: BufferGeometry, materials: Material | Material[]) {
        return new LwoModel({config: this.config, geometry, materials});
    }
}
