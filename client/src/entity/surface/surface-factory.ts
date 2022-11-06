import {BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, Vector2, Vector3} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {Surface} from './surface';
import {MaterialFactory} from '../../material/material-factory';
import {CollisionModelFactory} from '../../physics/collision-model-factory';
import {BufferAttributes} from '../../util/buffer-attributes';

export class SurfaceFactory implements EntityFactory<Surface> {
    constructor(private readonly parameters: SurfaceFactoryParameters) {
    }

    create(surfaceDef: any): Surface {
        const config = this.parameters.config;
        let surface;
        const geometry = this.createGeometry(surfaceDef.geometry);
        const collisionModel = this.parameters.collisionModelFactory.create(surfaceDef);
        if (config.renderOnlyWireframe) {
            surface = new Surface(geometry, new MeshBasicMaterial({wireframe: true}), collisionModel);
        } else {
            const materials = this.parameters.materialFactory.create(surfaceDef.material);
            surface = new Surface(geometry, materials, collisionModel);
            if (config.showWireframe) {
                surface.add(new Mesh(geometry, new MeshBasicMaterial({wireframe: true})));
            }
        }

        surface.name = surfaceDef.name;
        surface.scale.setScalar(config.worldScale);
        if (surfaceDef.position) {
            surface.position.fromArray(surfaceDef.position).multiplyScalar(config.worldScale);
        }

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

export class SurfaceFactoryParameters extends EntityFactoryParameters {
    materialFactory!: MaterialFactory;
    collisionModelFactory!: CollisionModelFactory;
}