import {
    AnimationClip,
    BufferAttribute,
    BufferGeometry,
    Material,
    MathUtils,
    Mesh,
    Quaternion,
    Vector2,
    Vector3
} from 'three';
import {round} from 'mathjs';

import {EntityFactory} from '../entity-factory';
import {GameAssets} from '../../game-assets';
import {GameConfig} from '../../game-config';
import {MaterialFactory} from '../../material/material-factory';

// noinspection JSMethodCanBeStatic
export class Md5ModelFactory implements EntityFactory<Mesh> {
    constructor(private readonly config: GameConfig,
                private readonly materialFactory: MaterialFactory,
                private readonly assets: GameAssets) {
    }

    create(modelDef: any): Mesh {
        const mesh = this.assets.modelMeshes.get(modelDef.model);
        if (!mesh) {
            throw new Error(`MD5 model mesh "${modelDef.model}" is not found in game assets`);
        }

        const animations: any[] = [];
        for (const animationName of modelDef.animations) {
            const animation = this.assets.modelAnimations.get(animationName);
            if (animation) {
                animations.push(animation);
            }
        }

        this.bindPose(mesh, animations[0]);
        const composed = this.compose(mesh, animations);
        const result = new Mesh(this.createGeometry(composed), this.getMaterials(modelDef)[0]);
        result.animations = this.createAnimations(composed);
        result.position.set(0, 0.5, 0);
        result.rotateX(MathUtils.degToRad(-90));
        return result;
    }

    private bindPose(mesh: any, animation: any) {
        const rotatedPosition = new Vector3(0, 0, 0);
        const firstFrame = this.getFrame(animation, 0, true);
        if (mesh.meshes) {
            for (const subMesh of mesh.meshes) {
                for (const vertex of subMesh.vertices) {
                    vertex.position = new Vector3(0, 0, 0);
                    for (let w = 0; w < vertex.weight.count; w++) {
                        const weight = subMesh.weights[vertex.weight.index + w];
                        const joint = firstFrame[weight.joint];

                        if (w === 0) {
                            const heavyBones = this.findTwoHeaviestWeights(vertex, subMesh);

                            subMesh.skinWeights.push(round(heavyBones[0].bias, 3));
                            subMesh.skinWeights.push(round(heavyBones[1].bias, 3));

                            subMesh.skinIndices.push(heavyBones[0].joint);
                            subMesh.skinIndices.push(heavyBones[1].joint);
                        }

                        if (weight.position) {
                            rotatedPosition.copy(weight.position).applyQuaternion(joint.orientation);
                        }

                        vertex.position.x += (joint.position.x + rotatedPosition.x) * weight.bias;
                        vertex.position.y += (joint.position.y + rotatedPosition.y) * weight.bias;
                        vertex.position.z += (joint.position.z + rotatedPosition.z) * weight.bias;
                    }
                }
            }
        }
    }

    private getFrame(animationDef: any, frameIndex: number, poseBinding = false): any[] {
        const frame = animationDef.frames[frameIndex];
        const joints: any[] = [];
        for (let i = 0; i < animationDef.baseFrames.length; i++) {
            const baseJoint = animationDef.baseFrames[i];
            const offset = animationDef.hierarchy[i].index;
            const flags = animationDef.hierarchy[i].flags;

            const position = new Vector3().copy(baseJoint.position);
            const orientation = new Quaternion().copy(baseJoint.orientation);

            let j = 0;

            if (flags & 1) {
                position.x = frame[offset + j];
                j++;
            }
            if (flags & 2) {
                position.y = frame[offset + j];
                j++;
            }
            if (flags & 4) {
                position.z = frame[offset + j];
                j++;
            }
            if (flags & 8) {
                orientation.x = frame[offset + j];
                j++;
            }
            if (flags & 16) {
                orientation.y = frame[offset + j];
                j++;
            }
            if (flags & 32) {
                orientation.z = frame[offset + j];
                j++;
            }

            orientation.w = -Math.sqrt(Math.abs(1.0 - orientation.x * orientation.x - orientation.y * orientation.y
                - orientation.z * orientation.z));

            const parentIndex = animationDef.hierarchy[i].parent;
            if (parentIndex >= 0 && poseBinding) {
                const parentJoint = joints[parentIndex];
                position.applyQuaternion(parentJoint.orientation);
                position.add(parentJoint.position);
                orientation.multiplyQuaternions(parentJoint.orientation, orientation);
            }

            joints.push({position, orientation});
        }

        return joints;
    }

    private findTwoHeaviestWeights(vertex: any, mesh: any): any[] {
        const result: any[] = [];

        let weight, firstHighestWeight = 0, firstHighestJoint = 0;
        for (let i = 0; i < vertex.weight.count; i++) {
            weight = mesh.weights[vertex.weight.index + i];
            if (weight.bias > firstHighestWeight) {
                firstHighestWeight = weight.bias;
                firstHighestJoint = weight.joint;
            }
        }
        result[0] = {joint: firstHighestJoint, bias: firstHighestWeight};

        let secondHighestWeight = 0, secondHighestJoint = 0;
        if (vertex.weight.count > 1) {
            for (let j = 0; j < vertex.weight.count; j++) {
                weight = mesh.weights[vertex.weight.index + j];
                if (weight.bias > secondHighestWeight && weight.joint !== firstHighestJoint) {
                    secondHighestWeight = weight.bias;
                    secondHighestJoint = weight.joint;
                }
            }
        }
        result[1] = {joint: secondHighestJoint, bias: secondHighestWeight};


        if (vertex.weight.count > 2) {
            const sum = result[0].bias + result[1].bias;
            result[0] = {joint: result[0].joint, bias: result[0].bias / sum};
            result[1] = {joint: result[1].joint, bias: result[1].bias / sum};
        }

        return result;
    }

    private compose(mesh: any, animations: any[]): any {
        const vertices = [];
        const faces = [];
        const uvs = [];
        const materials = [];

        let vertexCount = 0;

        if (mesh.meshes) {
            for (let m = 0; m < mesh.meshes.length; m++) {
                const subMesh = mesh.meshes[m];

                for (let v = 0; v < subMesh.vertices.length; v++) {
                    const vertex = subMesh.vertices[v];
                    const vertexPosition = vertex.position;

                    vertices.push(round(vertexPosition.x, 3));
                    vertices.push(round(vertexPosition.y, 3));
                    vertices.push(round(vertexPosition.z, 3));

                    uvs.push(round(vertex.uv.x, 3));
                    uvs.push(round(1.0 - vertex.uv.y, 3));
                }

                for (let f = 0; f < subMesh.faces.length; f += 3) {
                    faces.push(10);
                    faces.push(subMesh.faces[f] + vertexCount);
                    faces.push(subMesh.faces[f + 2] + vertexCount);
                    faces.push(subMesh.faces[f + 1] + vertexCount);

                    faces.push(m);

                    faces.push(subMesh.faces[f] + vertexCount);
                    faces.push(subMesh.faces[f + 2] + vertexCount);
                    faces.push(subMesh.faces[f + 1] + vertexCount);
                }

                vertexCount += subMesh.vertices.length;

                if (subMesh.shader) {
                    materials[m] = {DbgColor: 15658734, DbgIndex: m, DbgName: encodeURI(subMesh.shader)};
                }
            }
        }

        const firstFrame = this.getFrame(animations[0], 0);
        const bonesJson = [];
        for (let bf = 0; bf < animations[0].baseFrames.length; bf++) {
            const framePosition = firstFrame[bf].position;
            const frameOrientation = firstFrame[bf].orientation;
            bonesJson.push({
                parent: animations[0].hierarchy[bf].parent,
                name: animations[0].hierarchy[bf].name,
                pos: [round(framePosition.x, 6), round(framePosition.y, 6), round(framePosition.z, 6)],
                rotq: [round(frameOrientation.x, 6), round(frameOrientation.y, 6),
                    round(frameOrientation.z, 6), round(frameOrientation.w, 6)]
            });
        }

        const jsonAnimations = [];
        for (let i = 0; i < animations.length; i++) {
            jsonAnimations.push(this.composeAnimation(animations[i]));
        }

        return {
            metadata: {
                formatVersion: 3.1,
                description: 'MD5 model converted from .md5mesh file using MD5 to JSON converter'
            },
            scale: 1.0,
            materials: materials,
            vertices: vertices,
            uvs: [uvs],
            faces: faces,
            bones: bonesJson,
            skinIndices: mesh.skinIndices,
            skinWeights: mesh.skinWeights,
            animations: jsonAnimations
        };
    }

    private composeAnimation(animation: any): any {
        const animationLength = ((animation.frames.length - 1) * animation.frameTime) / 1000;
        const animationFps = animation.frameRate;
        const hierarchyJson = [];

        for (let h = 0; h < animation.hierarchy.length; h++) {
            const bone = animation.hierarchy[h];
            const boneKeys: any[] = [];
            const boneJson = {parent: bone.parent, keys: boneKeys};

            for (let fr = 0; fr < animation.frames.length; fr++) {
                const frame = this.getFrame(animation, fr);
                const position = frame[h].position;
                const rotation = frame[h].orientation;
                const time = (animation.frameTime * fr) / 1000;

                const scl: number[] = [];
                const boneKeyJson = {
                    time,
                    pos: [round(position.x, 6), round(position.y, 6), round(position.z, 6)],
                    rot: [round(rotation.x, 6), round(rotation.y, 6), round(rotation.z, 6),
                        round(rotation.w, 6)],
                    scl
                };
                boneKeys.push(boneKeyJson);

                if (fr === 0 || fr === animation.frames.length - 1) {
                    boneKeyJson.scl.push(1, 1, 1);
                }
            }

            hierarchyJson.push(boneJson);
        }

        return {
            name: animation.name,
            length: animationLength,
            fps: animationFps,
            hierarchy: hierarchyJson,
            tracks: []
        };
    }

    private isBitSet(value: any, position: number): boolean {
        return (value & (1 << position)) !== 0;
    }

    private createGeometry(composed: any): BufferGeometry {
        const vertices: Vector3[] = [];
        const uvs: Vector2[] = [];
        const groups: { start: number; count: number; materialIndex?: number }[] = [];

        let materialIndex = undefined;
        let group: { start: number; count: number; materialIndex?: number } | undefined = undefined;

        for (let i = 0; i < composed.faces.length;) {
            const faceType = composed.faces[i++];

            const hasMaterial = this.isBitSet(faceType, 1);
            const hasFaceVertexUv = this.isBitSet(faceType, 3);

            for (let j = 0; j < 3; j++) {
                const vertexIdx = composed.faces[i + j];
                const x = composed.vertices[vertexIdx * 3];
                const y = composed.vertices[vertexIdx * 3 + 1];
                const z = composed.vertices[vertexIdx * 3 + 2];
                vertices.push(new Vector3(x, y, z).multiplyScalar(this.config.worldScale));
            }

            i += 3;

            if (hasMaterial) {
                const faceMaterialIndex = composed.faces[i++];
                if (faceMaterialIndex !== materialIndex) {
                    materialIndex = faceMaterialIndex;
                    if (group) {
                        group.count = (i * 3) - group.start;
                        groups.push(group);
                    }

                    group = {
                        start: i * 3,
                        count: 0,
                        materialIndex: materialIndex
                    };
                }
            }

            if (hasFaceVertexUv) {
                const uvLayer = composed.uvs[0];
                for (let j = 0; j < 3; j++) {
                    const uvIndex = composed.faces[i++];
                    const u = uvLayer[uvIndex * 2];
                    const v = uvLayer[uvIndex * 2 + 1];
                    const uv = new Vector2(u, v);
                    uvs.push(uv);
                }
            }
        }

        const normals = this.computeVertexNormals(composed.faces, composed.vertices);

        const geometry = new BufferGeometry();
        const position = new BufferAttribute(new Float32Array(vertices.length * 3), 3).copyVector3sArray(vertices);
        geometry.setAttribute('position', position);
        const normal = new BufferAttribute(new Float32Array(normals.length * 3), 3).copyVector3sArray(normals);
        geometry.setAttribute('normal', normal);
        if (uvs.length > 0) {
            const uv = new BufferAttribute(new Float32Array(uvs.length * 2), 2).copyVector2sArray(uvs);
            geometry.setAttribute('uv', uv);
        }
        geometry.groups = groups;
        return geometry;
    }

    private createAnimations(composed: any): AnimationClip[] {
        const animations: AnimationClip[] = [];
        for (let i = 0; i < composed.animations.length; i++) {
            const animation = AnimationClip.parseAnimation(composed.animations[i], composed.bones);
            if (animation) {
                animations.push(animation);
            }
        }
        return animations;
    }

    private computeVertexNormals(faces: number[], vertices: number[]): Vector3[] {
        const vertexNormals: Vector3[] = [];
        for (let v = 0, vl = vertices.length / 3; v < vl; v++) {
            vertexNormals[v] = new Vector3();
        }

        const cb = new Vector3(), ab = new Vector3();
        for (let i = 0; i < faces.length; i += 8) {
            const faceVertices: Vector3[] = [];
            for (let j = 1; j < 4; j++) {
                faceVertices.push(new Vector3(vertices[faces[i + j] * 3], vertices[faces[i + j] * 3 + 1],
                    vertices[faces[i + j] * 3 + 2]));
            }

            cb.subVectors(faceVertices[2], faceVertices[1]);
            ab.subVectors(faceVertices[0], faceVertices[2]);
            cb.cross(ab);

            for (let j = 1; j < 4; j++) {
                vertexNormals[faces[i + j]].add(cb);
            }
        }

        for (let i = 0; i < vertexNormals.length; i++) {
            vertexNormals[i].normalize();
        }

        const normals: Vector3[] = [];
        for (let i = 0; i < faces.length; i += 8) {
            for (let j = 1; j < 4; j++) {
                normals.push(vertexNormals[faces[i + j]]);
            }
        }
        return normals;
    }

    private getMaterials(modelDef: any) {
        let materials: Material[] = [];
        const declaredMaterials = modelDef.materials;
        if (declaredMaterials) {
            for (let i = 0; i < declaredMaterials.length; i++) {
                const declaredMaterial = declaredMaterials[i];
                materials = materials.concat(this.materialFactory.create(declaredMaterial));
            }
        }
        return materials;
    }
}