import {Euler, Mesh, Vector3} from 'three';
import {DecalGeometry} from 'three/examples/jsm/geometries/DecalGeometry';

import {Decal} from './decal';
import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {GameAssets} from '../../game-assets';
import {MaterialFactory} from '../../material/material-factory';

export class DecalFactory implements EntityFactory<Decal> {
    constructor(private readonly parameters: DecalFactoryParameters) {
    }

    create(decalDef: {name: string, targetMesh: Mesh, position: Vector3, orientation: Euler}): Decal {
        const parentDecalDef = this.parameters.assets.decalDefs.get(decalDef.name);
        if (!parentDecalDef) {
            throw new Error(`Definition of decal "${decalDef.name}" is not found`);
        }
        const size = new Vector3().setScalar(parentDecalDef.size * this.parameters.config.worldScale);
        const geometry = new DecalGeometry(decalDef.targetMesh, decalDef.position, decalDef.orientation, size);
        const material = this.parameters.materialFactory.create(parentDecalDef.material)[0];
        return new Decal({geometry, material, time: parentDecalDef.time});
    }
}

export interface DecalFactoryParameters extends EntityFactoryParameters {
    assets: GameAssets;
    materialFactory: MaterialFactory;
}
