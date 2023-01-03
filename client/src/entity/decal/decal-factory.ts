import {Euler, Mesh, MeshBasicMaterial, Vector3} from 'three';
import {DecalGeometry} from 'three/examples/jsm/geometries/DecalGeometry';

import {Decal} from './decal';
import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {GameAssets} from '../../game-assets';
import {MaterialFactory} from '../../material/material-factory';

export class DecalFactory implements EntityFactory<Decal> {
    constructor(private readonly parameters: DecalFactoryParameters) {
    }

    create(decalDef: {name: string, target: Mesh, position: Vector3, orientation: Euler}): Decal {
        const parentDecalDef = this.parameters.assets.decalDefs.get(decalDef.name);
        if (!parentDecalDef) {
            throw new Error(`Definition of decal "${decalDef.name}" is not found`);
        }

        const size = new Vector3().setScalar(parentDecalDef.size * this.parameters.config.worldScale);
        const geometry = new DecalGeometry(decalDef.target, decalDef.position, decalDef.orientation, size);
        // Transform vertices from world space to local space of target mesh
        const positionAttr = geometry.getAttribute('position');
        const vertices = <number[]>positionAttr.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const vertex = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
            decalDef.target.worldToLocal(vertex);
            vertices[i] = vertex.x;
            vertices[i + 1] = vertex.y;
            vertices[i + 2] = vertex.z;
        }
        positionAttr.needsUpdate = true;

        const material = this.parameters.materialFactory.create(parentDecalDef.material)[0];
        const decal = new Decal({geometry, material, time: parentDecalDef.time, fadeOut: parentDecalDef.fadeOut});
        if (this.parameters.config.showWireframe) {
            decal.add(new Mesh(geometry, new MeshBasicMaterial({wireframe: true})));
        }
        return decal;
    }
}

export interface DecalFactoryParameters extends EntityFactoryParameters {
    assets: GameAssets;
    materialFactory: MaterialFactory;
}
