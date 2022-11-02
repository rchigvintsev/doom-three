import {Mesh} from 'three';

import {LwoModel} from './lwo-model';
import {GameConfig} from '../../../game-config';
import {GameAssets} from '../../../game-assets';
import {MaterialFactory} from '../../../material/material-factory';
import {WeaponShell} from './debris/weapon-shell';
import {CollisionModelFactory} from '../../../physics/collision-model-factory';
import {AbstractModelFactory} from '../abstract-model-factory';

export class LwoModelFactory extends AbstractModelFactory<LwoModel> {
    constructor(config: GameConfig,
                private readonly assets: GameAssets,
                materialFactory: MaterialFactory,
                private readonly collisionModelFactory: CollisionModelFactory) {
        super(config, materialFactory);
    }

    create(modelDef: any): LwoModel {
        const modelMesh = this.getRequiredModelMesh(modelDef);
        const materials = this.createMaterials(modelDef);

        let model;
        if (modelDef.name === 'debris_brass') {
            const collisionModel = this.collisionModelFactory.create(modelDef);
            model = new WeaponShell({config: this.config, geometry: modelMesh.geometry, materials, collisionModel});
        } else {
            model = new LwoModel({config: this.config, geometry: modelMesh.geometry, materials});
        }
        model.name = modelDef.name;
        model.scale.setScalar(this.config.worldScale);
        if (modelDef.position) {
            model.position.fromArray(modelDef.position).multiplyScalar(this.config.worldScale);
        }
        model.init();
        return model;
    }

    private getRequiredModelMesh(modelDef: any): Mesh {
        const mesh = <Mesh>this.assets.modelMeshes.get(modelDef.model);
        if (!mesh) {
            throw new Error(`LWO model mesh "${modelDef.model}" is not found in game assets`);
        }
        return mesh;
    }
}
