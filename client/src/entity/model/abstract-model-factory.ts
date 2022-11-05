import {Material, MeshBasicMaterial, MeshPhongMaterial} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {Entity} from '../entity';
import {GameConfig} from '../../game-config';
import {MaterialFactory} from '../../material/material-factory';

export abstract class AbstractModelFactory<T extends Entity> implements EntityFactory<T> {
    constructor(protected readonly parameters: ModelFactoryParameters) {
    }

    abstract create(entityDef: any): T;

    protected createMaterials(modelDef: any): Material[] {
        const materials: Material[] = [];
        if (this.config.renderOnlyWireframe) {
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
                    materials.push(this.materialFactory.create(modelDef.materials[i])[0]);
                }
            }
            if (materials.length == 0) {
                materials.push(new MeshPhongMaterial());
            }
        }
        return materials;
    }

    protected get config(): GameConfig {
        return this.parameters.config;
    }

    protected get materialFactory(): MaterialFactory {
        return this.parameters.materialFactory;
    }
}

export class ModelFactoryParameters extends EntityFactoryParameters {
    materialFactory!: MaterialFactory;
}
