import {FileLoader, Loader, LoadingManager, Quaternion, Vector2, Vector3} from 'three';

import {JsonLoader} from './json-loader';
import {Md5ChildMesh, Md5Mesh, Md5MeshJoint, Md5MeshVertex, Md5MeshWeight, Md5VertexWeight} from '../model/md5-mesh';

/**
 * Most of the code in this script is kindly borrowed from "MD5 to JSON Converter"
 * (http://oos.moxiecode.com/js_webgl/md5_converter) by @oosmoxiecode (https://twitter.com/oosmoxiecode).
 */
export class Md5MeshLoader extends Loader {
    private readonly fileLoader: FileLoader;
    private readonly jsonLoader: JsonLoader;

    constructor(manager?: LoadingManager) {
        super(manager);
        this.fileLoader = new FileLoader(this.manager);
        this.jsonLoader = new JsonLoader(this.manager);
    }

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Md5Mesh> {
        return this.fileLoader.loadAsync(url, onProgress).then(content => this.parse(<string>content));
    }

    private parse(s: string): Md5Mesh {
        return new Md5Mesh(this.parseJoints(s), this.parseMeshes(s));
    }

    private parseJoints(s: string): Md5MeshJoint[] {
        const result: Md5MeshJoint[] = [];
        s.replace(/joints {([^}]*)}/m, (_, joints) => {
            const jointRegExp = /"(\w+)"\s([-\d]+) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \)/g;
            (<string>joints).replace(jointRegExp, (_, name, parent, x, y, z, ox, oy, oz) => {
                const position = new Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
                const ov = new Vector3(parseFloat(ox), parseFloat(oy), parseFloat(oz));
                const w = -Math.sqrt(Math.abs(1.0 - ov.x * ov.x - ov.y * ov.y - ov.z * ov.z));
                const orientation = new Quaternion(ov.x, ov.y, ov.z, w);
                result.push(new Md5MeshJoint(name, parent, position, orientation));
                return _;
            });
            return _;
        });
        return result;
    }

    private parseMeshes(s: string): Md5ChildMesh[] {
        const result: Md5ChildMesh[] = [];
        s.replace(/mesh {([^}]*)}/mg, (_, mesh) => {
            const meshDef = new Md5ChildMesh();

            (<string>mesh).replace(/shader "(.+)"/, (_, shader) => {
                meshDef.shader = shader;
                return _;
            });

            const verticesRegExp = /vert \d+ \( ([-\d.]+) ([-\d.]+) \) (\d+) (\d+)/g;
            (<string>mesh).replace(verticesRegExp, (_, u, v, weightIndex, weightCount) => {
                const position = new Vector3(0, 0, 0);
                const normal = new Vector3(0, 0, 0);
                const tangent = new Vector3(0, 0, 0);
                const uv = new Vector2(parseFloat(u), parseFloat(v));
                const weight = new Md5VertexWeight(parseInt(weightIndex), parseInt(weightCount));
                meshDef.vertices.push(new Md5MeshVertex(position, normal, tangent, uv, weight));
                return _;
            });

            (<string>mesh).replace(/tri \d+ (\d+) (\d+) (\d+)/g, (_, i1, i2, i3) => {
                meshDef.faces.push(parseInt(i1));
                meshDef.faces.push(parseInt(i2));
                meshDef.faces.push(parseInt(i3));
                return _;
            });

            const weightsRegExp = /weight \d+ (\d+) ([-\d.]+) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \)/g;
            (<string>mesh).replace(weightsRegExp, (_, joint, bias, x, y, z) => {
                const position = new Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
                const normal = new Vector3(0, 0, 0);
                const tangent = new Vector3(0, 0, 0);
                meshDef.weights.push(new Md5MeshWeight(parseInt(joint), parseFloat(bias), position, normal, tangent));
                return _;
            });

            result.push(meshDef);
            return _;
        });
        return result;
    }

    /*private static bindPose(modelDef: Md5ModelDefinition, animationDef: Md5AnimationDefinition) {
        const rotatedPosition = new Vector3(0, 0, 0);
        const firstFrame = Md5MeshLoader.getFrame(animationDef, 0, true);
        for (const mesh of modelDef.meshes) {
            for (const vertex of mesh.vertices) {
                vertex.position = new Vector3(0, 0, 0);
                for (let w = 0; w < vertex.weight.count; w++) {
                    const weight = mesh.weights[vertex.weight.index + w];
                    const joint = firstFrame[weight.joint];

                    if (w === 0) {
                        const heavyBones = Md5MeshLoader.findTwoHeaviestWeights(vertex, mesh);

                        modelDef.skinWeights.push(round(heavyBones[0].bias, 3));
                        modelDef.skinWeights.push(round(heavyBones[1].bias, 3));

                        modelDef.skinIndices.push(heavyBones[0].joint);
                        modelDef.skinIndices.push(heavyBones[1].joint);
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

    private static getFrame(animationDef: Md5AnimationDefinition,
                            frameIndex: number,
                            poseBinding = false): Md5ModelJoint[] {
        const frame = animationDef.frames[frameIndex];
        const joints: Md5ModelJoint[] = [];
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

            joints.push(new Md5ModelJoint(null, null, position, orientation));
        }

        return joints;
    }

    private static findTwoHeaviestWeights(vertex: Md5MeshVertex, mesh: Md5ModelMesh): Md5MeshWeight[] {
        const result: Md5MeshWeight[] = [];
        let weight, firstHighestWeight = 0, firstHighestJoint = 0;

        for (let i = 0; i < vertex.weight.count; i++) {
            weight = mesh.weights[vertex.weight.index + i];
            if (weight.bias > firstHighestWeight) {
                firstHighestWeight = weight.bias;
                firstHighestJoint = weight.joint;
            }
        }

        result[0] = new Md5MeshWeight(firstHighestJoint, firstHighestWeight);

        if (vertex.weight.count > 1) {
            let secondHighestWeight = 0, secondHighestJoint = 0;

            for (let j = 0; j < vertex.weight.count; j++) {
                weight = mesh.weights[vertex.weight.index + j];
                if (weight.bias > secondHighestWeight && weight.joint !== firstHighestJoint) {
                    secondHighestWeight = weight.bias;
                    secondHighestJoint = weight.joint;
                }
            }

            result[1] = new Md5MeshWeight(secondHighestJoint, secondHighestWeight);
        }

        if (vertex.weight.count > 2) {
            const sum = result[0].bias + result[1].bias;
            result[0] = new Md5MeshWeight(result[0].joint, result[0].bias / sum);
            result[1] = new Md5MeshWeight(result[1].joint, result[1].bias / sum);
        }

        return result;
    }

    private static compose(modelDef: Md5ModelDefinition, animationDefs: Md5AnimationDefinition[]): any {
        const vertices = [];
        const faces = [];
        const uvs = [];
        const materials = [];

        let vertexCount = 0;
        // let faceCount = 0;

        for (let m = 0; m < modelDef.meshes.length; m++) {
            const mesh = modelDef.meshes[m];

            for (let v = 0; v < mesh.vertices.length; v++) {
                const vertex = mesh.vertices[v];
                const vertexPosition = vertex.position;

                vertices.push(round(vertexPosition.x, 3));
                vertices.push(round(vertexPosition.y, 3));
                vertices.push(round(vertexPosition.z, 3));

                uvs.push(round(vertex.uv.x, 3));
                uvs.push(round(1.0 - vertex.uv.y, 3));
            }

            for (let f = 0; f < mesh.faces.length; f += 3) {
                faces.push(10);
                faces.push(mesh.faces[f] + vertexCount);
                faces.push(mesh.faces[f + 2] + vertexCount);
                faces.push(mesh.faces[f + 1] + vertexCount);

                faces.push(m);

                faces.push(mesh.faces[f] + vertexCount);
                faces.push(mesh.faces[f + 2] + vertexCount);
                faces.push(mesh.faces[f + 1] + vertexCount);
            }

            vertexCount += mesh.vertices.length;
            // faceCount += mesh.faces.length / 3;

            if (mesh.shader) {
                materials[m] = {DbgColor: 15658734, DbgIndex: m, DbgName: encodeURI(mesh.shader)};
            }
        }

        const firstFrame = Md5MeshLoader.getFrame(animationDefs[0], 0);
        const bonesJson = [];
        for (let bf = 0; bf < animationDefs[0].baseFrames.length; bf++) {
            const framePosition = firstFrame[bf].position;
            const frameOrientation = firstFrame[bf].orientation;
            bonesJson.push({
                parent: animationDefs[0].hierarchy[bf].parent,
                name: animationDefs[0].hierarchy[bf].name,
                pos: [round(framePosition.x, 6), round(framePosition.y, 6), round(framePosition.z, 6)],
                rotq: [round(frameOrientation.x, 6), round(frameOrientation.y, 6),
                    round(frameOrientation.z, 6), round(frameOrientation.w, 6)]
            });
        }

        const animations = [];
        for (let i = 0; i < animationDefs.length; i++) {
            animations.push(Md5MeshLoader.composeAnimation(animationDefs[i]));
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
            skinIndices: modelDef.skinIndices,
            skinWeights: modelDef.skinWeights,
            animations: animations
        };
    }

    private static composeAnimation(animationDef: Md5AnimationDefinition): any {
        const animationLength = ((animationDef.frames.length - 1) * animationDef.frameTime) / 1000;
        const animationFps = animationDef.frameRate;
        const hierarchyJson = [];

        for (let h = 0; h < animationDef.hierarchy.length; h++) {
            const bone = animationDef.hierarchy[h];
            const boneKeys: any[] = [];
            const boneJson = {parent: bone.parent, keys: boneKeys};

            for (let fr = 0; fr < animationDef.frames.length; fr++) {
                const frame = Md5MeshLoader.getFrame(animationDef, fr);
                const position = frame[h].position;
                const rotation = frame[h].orientation;
                const time = (animationDef.frameTime * fr) / 1000;

                const scl: number[] = [];
                const boneKeyJson = {
                    time,
                    pos: [round(position.x, 6), round(position.y, 6), round(position.z, 6)],
                    rot: [round(rotation.x, 6), round(rotation.y, 6), round(rotation.z, 6),
                        round(rotation.w, 6)],
                    scl
                };
                boneKeys.push(boneKeyJson);

                if (fr === 0 || fr === animationDef.frames.length - 1) {
                    boneKeyJson.scl.push(1, 1, 1);
                }
            }

            hierarchyJson.push(boneJson);
        }

        return {
            name: animationDef.name,
            length: animationLength,
            fps: animationFps,
            hierarchy: hierarchyJson
        };
    }*/
}
