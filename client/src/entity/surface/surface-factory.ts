import {BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, Vector2, Vector3} from 'three';

import {inject, injectable} from 'inversify';

import {GameEntityFactory} from '../game-entity-factory';
import {Surface} from './surface';
import {MaterialFactory} from '../../material/material-factory';
import {CollisionModelFactory} from '../../physics/collision-model-factory';
import {BufferAttributes} from '../../util/buffer-attributes';
import {GameConfig} from '../../game-config';
import {TYPES} from '../../types';

@injectable()
export class SurfaceFactory implements GameEntityFactory<Surface> {
    constructor(@inject(TYPES.Config) private readonly config: GameConfig,
                @inject(TYPES.MaterialFactory) private readonly materialFactory: MaterialFactory,
                @inject(TYPES.CollisionModelFactory) private readonly collisionModelFactory: CollisionModelFactory) {
    }

    create(surfaceDef: any): Surface {
        let surface;
        const geometry = this.createGeometry(surfaceDef.geometry);
        const collisionModel = this.collisionModelFactory.create(surfaceDef.collisionModel);
        if (this.config.renderOnlyWireframe) {
            surface = new Surface(geometry, new MeshBasicMaterial({wireframe: true}), collisionModel);
        } else {
            const materials = this.materialFactory.create(surfaceDef.material);
            surface = new Surface(geometry, materials, collisionModel);
            if (this.config.showWireframe) {
                surface.add(new Mesh(geometry, new MeshBasicMaterial({wireframe: true})));
            }
        }

        surface.name = surfaceDef.name;
        surface.scale.setScalar(this.config.worldScale);
        if (surfaceDef.position) {
            collisionModel.position.setFromArray(surfaceDef.position).multiplyScalar(this.config.worldScale);
        }
        surface.init();

        return surface;
    }

    private createGeometry(geometryDef: any): BufferGeometry {
        if (geometryDef.vertices.length > 0 && geometryDef.faces.length === 0) {
            throw new Error('Faceless geometries are not supported');
        }

        const vertices: Vector3[] = [];
        const normals: Vector3[] = [];
        const uvs: Vector2[] = [];

        for (let i = 0; i < geometryDef.faces.length; i++) {
            const face = geometryDef.faces[i];

            for (let j = 0; j < 3; j++) {
                const vertex = geometryDef.vertices[face[j]];
                vertices.push(new Vector3().fromArray(vertex));
            }

            const faceNormal = this.computeFaceNormal(face, geometryDef.vertices);
            normals.push(faceNormal, faceNormal, faceNormal);

            if (geometryDef.uvs.length > 0) {
                const uv = geometryDef.uvs[i];
                if (uv) {
                    uvs.push(
                        new Vector2(uv[0][0], uv[0][1] * -1),
                        new Vector2(uv[1][0], uv[1][1] * -1),
                        new Vector2(uv[2][0], uv[2][1] * -1)
                    );
                } else {
                    console.warn(`Vertex UV is not defined for face ${i}`);
                    uvs.push(new Vector2(), new Vector2(), new Vector2());
                }
            }
        }

        const bufferGeometry = new BufferGeometry();
        const positionAttr = new BufferAttribute(new Float32Array(vertices.length * 3), 3);
        const position = BufferAttributes.copyVector3sArray(positionAttr, vertices);
        bufferGeometry.setAttribute('position', position);
        const normalAttr = new BufferAttribute(new Float32Array(normals.length * 3), 3);
        const normal = BufferAttributes.copyVector3sArray(normalAttr, normals);
        bufferGeometry.setAttribute('normal', normal);
        if (uvs.length > 0) {
            const uvAttr = new BufferAttribute(new Float32Array(uvs.length * 2), 2);
            const uv = BufferAttributes.copyVector2sArray(uvAttr, uvs);
            bufferGeometry.setAttribute('uv', uv);
        }
        bufferGeometry.groups = [{
            start: 0,
            materialIndex: 0,
            count: geometryDef.faces.length * 3
        }];
        return bufferGeometry;
    }

    private computeFaceNormal(face: number[], vertices: number[][]): Vector3 {
        const vA = new Vector3().fromArray(vertices[face[0]]);
        const vB = new Vector3().fromArray(vertices[face[1]]);
        const vC = new Vector3().fromArray(vertices[face[2]]);

        const cb = new Vector3(), ab = new Vector3();
        cb.subVectors(vC, vB);
        ab.subVectors(vA, vB);
        cb.cross(ab);
        cb.normalize();
        return cb;
    }
}
