import {Material, MeshBasicMaterial, MeshPhongMaterial} from 'three';

import {GameEntityFactory, GameEntityFactoryParameters} from '../game-entity-factory';
import {GameEntity} from '../game-entity';
import {MaterialFactory} from '../../material/material-factory';
import {GameAssets} from '../../game-assets';

export abstract class AbstractModelFactory<T extends GameEntity> implements GameEntityFactory<T> {
    constructor(protected readonly parameters: ModelFactoryParameters) {
    }

    abstract create(entityDef: any): T;

    protected createMaterials(modelDef: any): Material[] {
        const materials: Material[] = [];
        if (this.parameters.config.renderOnlyWireframe) {
            if (modelDef.materials) {
                for (let i = 0; i < modelDef.materials.length; i++) {
                    materials.push(new MeshBasicMaterial({wireframe: true}));
                }
            }
            if (materials.length == 0) {
                materials.push(new MeshBasicMaterial({wireframe: true}));
            }
        } else {
            if (modelDef.materials) {
                for (let i = 0; i < modelDef.materials.length; i++) {
                    materials.push(this.parameters.materialFactory.create(modelDef.materials[i])[0]);
                }
            }
            if (materials.length == 0) {
                materials.push(new MeshPhongMaterial());
            }
        }
        return materials;
    }
}

export interface ModelFactoryParameters extends GameEntityFactoryParameters {
    assets: GameAssets;
    materialFactory: MaterialFactory;
}
