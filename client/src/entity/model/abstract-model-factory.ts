import {BufferGeometry, Material, MeshBasicMaterial, MeshPhongMaterial} from 'three';

import {GameEntityFactory} from '../game-entity-factory';
import {GameEntity} from '../game-entity';
import {MaterialFactory} from '../../material/material-factory';
import {Game} from '../../game';

export abstract class AbstractModelFactory<T extends GameEntity> implements GameEntityFactory<T> {
    constructor(protected readonly materialFactory: MaterialFactory) {
    }

    abstract create(entityDef: any): T;

    protected createMaterials(modelDef: any, geometry?: BufferGeometry): Material[] {
        const materials: Material[] = [];
        if (Game.getContext().config.renderOnlyWireframe) {
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

        if (geometry) {
            for (const group of geometry.groups) {
                if (group.materialIndex != undefined && !materials[group.materialIndex]) {
                    materials[group.materialIndex] = new MeshBasicMaterial({visible: false});
                }
            }
        }

        return materials;
    }
}
