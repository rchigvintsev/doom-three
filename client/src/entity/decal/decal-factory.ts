import {BufferAttribute, Euler, Mesh, MeshBasicMaterial, Vector3} from 'three';
import {DecalGeometry} from 'three/examples/jsm/geometries/DecalGeometry';

import {inject, injectable} from 'inversify';

import {Decal} from './decal';
import {GameEntityFactory} from '../game-entity-factory';
import {MaterialFactory} from '../../material/material-factory';
import {TYPES} from '../../types';
import {Game} from '../../game';

@injectable()
export class DecalFactory implements GameEntityFactory<Decal> {
    constructor(@inject(TYPES.MaterialFactory) private readonly materialFactory: MaterialFactory) {
    }

    create(decalDef: {name: string, target: Mesh, position: Vector3, orientation: Euler}): Decal {
        const context = Game.getContext();

        const parentDecalDef = context.assets.decalDefs.get(decalDef.name);
        if (!parentDecalDef) {
            throw new Error(`Definition of decal "${decalDef.name}" is not found`);
        }

        const size = new Vector3().setScalar(parentDecalDef.size * context.config.worldScale);
        const geometry = new DecalGeometry(decalDef.target, decalDef.position, decalDef.orientation, size);
        // Transform vertices from world space to local space of target mesh
        const positionAttr = geometry.getAttribute('position') as BufferAttribute;
        const vertices = <number[]>positionAttr.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const vertex = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
            decalDef.target.worldToLocal(vertex);
            vertices[i] = vertex.x;
            vertices[i + 1] = vertex.y;
            vertices[i + 2] = vertex.z;
        }
        positionAttr.needsUpdate = true;

        const material = this.materialFactory.create(parentDecalDef.material)[0];
        const decal = new Decal({geometry, material, time: parentDecalDef.time, fadeOut: parentDecalDef.fadeOut});
        if (context.config.showWireframe) {
            decal.add(new Mesh(geometry, new MeshBasicMaterial({wireframe: true})));
        }
        return decal;
    }
}
