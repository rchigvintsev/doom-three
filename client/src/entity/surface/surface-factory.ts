import {BufferGeometry, Vector2, Vector3} from 'three';
import {Face3, Geometry} from 'three/examples/jsm/deprecated/Geometry';

import {EntityFactory} from '../entity-factory';
import {Surface} from './surface';
import {GameConfig} from '../../game-config';
import {MaterialFactory} from '../../material/material-factory';

export class SurfaceFactory implements EntityFactory<Surface> {
    constructor(private readonly config: GameConfig, private readonly materialFactory: MaterialFactory) {
    }

    create(surfaceDef: any): Surface {
        const geometry = this.createGeometry(surfaceDef.geometry);
        const materials = this.materialFactory.create(surfaceDef.material);
        const surface = new Surface(geometry, materials);
        if (surfaceDef.position) {
            surface.position.fromArray(surfaceDef.position).multiplyScalar(this.config.worldScale);
        }
        return surface;
    }

    private createGeometry(geometryDef: any): BufferGeometry {
        const vertices: Vector3[] = [];
        for (const vertex of geometryDef.vertices) {
            vertices.push(new Vector3(vertex[0], vertex[1], vertex[2]).multiplyScalar(this.config.worldScale));
        }

        const faces: Face3[] = [];
        for (const face of geometryDef.faces) {
            faces.push(new Face3(face[0], face[1], face[2]));
        }

        const geometry = new Geometry();
        geometry.vertices = vertices;
        geometry.faces = faces;

        geometryDef.uvs.forEach(function (uv: number[][], i: number) {
            geometry.faceVertexUvs[0][i] = [
                new Vector2(uv[0][0], uv[0][1] * -1),
                new Vector2(uv[1][0], uv[1][1] * -1),
                new Vector2(uv[2][0], uv[2][1] * -1)
            ];
        });

        geometry.mergeVertices();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        // TODO: try to use BufferGeometry without mediation of deprecated Geometry
        return geometry.toBufferGeometry();
    }
}