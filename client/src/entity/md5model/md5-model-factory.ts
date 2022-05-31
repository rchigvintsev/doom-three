import {
    AnimationAction,
    AnimationClip,
    AnimationMixer,
    Bone,
    BufferAttribute,
    BufferGeometry,
    Float32BufferAttribute,
    LoopOnce,
    Material,
    MathUtils,
    MeshPhongMaterial,
    Quaternion,
    Skeleton,
    SkeletonHelper,
    SkinnedMesh,
    Vector2,
    Vector3,
    Vector4
} from 'three';
import {round} from 'mathjs';

import {EntityFactory} from '../entity-factory';
import {GameAssets} from '../../game-assets';
import {GameConfig} from '../../game-config';
import {MaterialFactory} from '../../material/material-factory';
import {Fists} from '../weapon/fists';
import {Weapon} from '../weapon/weapon';

// noinspection JSMethodCanBeStatic
export class Md5ModelFactory implements EntityFactory<SkinnedMesh> {
    constructor(private readonly config: GameConfig,
                private readonly materialFactory: MaterialFactory,
                private readonly assets: GameAssets) {
    }

    create(modelDef: any): SkinnedMesh {
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
        const result = this.createMesh(modelDef, composed);

        const animationMixer = new AnimationMixer(result);
        const actions = new Map<string, AnimationAction>();
        for (let i = 0; i < animations.length; i++) {
            const animation = animations[i];
            const action = animationMixer.clipAction(animation.name);
            if (animation.name !== 'idle') {
                action.setLoop(LoopOnce, 1);
            }
            actions.set(animation.name, action);
        }
        result.userData['animationMixer'] = animationMixer;

        const action = actions.get('idle');
        if (action) {
            action.play();
        }

        result.position.set(0, 0.5, 0);
        return result;
    }

    private bindPose(mesh: any, animation: any) {
        const rotatedPosition = new Vector3(0, 0, 0);
        const firstFrame = this.getFrame(animation, 0, true);
        mesh.skinWeights = [];
        mesh.skinIndices = [];
        if (mesh.meshes) {
            for (const subMesh of mesh.meshes) {
                for (const vertex of subMesh.vertices) {
                    vertex.position = new Vector3(0, 0, 0);
                    for (let w = 0; w < vertex.weight.count; w++) {
                        const weight = subMesh.weights[vertex.weight.index + w];
                        const joint = firstFrame[weight.joint];

                        if (w === 0) {
                            const heavyBones = this.findTwoHeaviestWeights(vertex, subMesh);

                            mesh.skinWeights.push(round(heavyBones[0].bias, 3));
                            mesh.skinWeights.push(round(heavyBones[1].bias, 3));

                            mesh.skinIndices.push(heavyBones[0].joint);
                            mesh.skinIndices.push(heavyBones[1].joint);
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
        const vertices: Vector3[] = [];
        const faces: {a: number, b: number, c: number, materialIndex: number}[] = [];
        const uvs: Vector2[] = [];
        const materials = [];

        let vertexCount = 0;

        if (mesh.meshes) {
            for (let m = 0; m < mesh.meshes.length; m++) {
                const subMesh = mesh.meshes[m];

                for (let v = 0; v < subMesh.vertices.length; v++) {
                    const vertex = subMesh.vertices[v];
                    const vertexPosition = vertex.position;

                    const x = round(vertexPosition.x, 3);
                    const y = round(vertexPosition.y, 3);
                    const z = round(vertexPosition.z, 3);
                    vertices.push(new Vector3(x, y, z));

                    uvs.push(vertex.uv);
                }

                for (let f = 0; f < subMesh.faces.length; f += 3) {
                    const a = subMesh.faces[f] + vertexCount;
                    const b = subMesh.faces[f + 2] + vertexCount;
                    const c = subMesh.faces[f + 1] + vertexCount;
                    faces.push({a, b, c, materialIndex: m});
                }

                vertexCount += subMesh.vertices.length;

                if (subMesh.shader) {
                    materials[m] = subMesh.shader;
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

                const boneKeyJson: { pos: any[]; rot: any[]; time: number; scl?: number[] } = {
                    time,
                    pos: [round(position.x, 6), round(position.y, 6), round(position.z, 6)],
                    rot: [round(rotation.x, 6), round(rotation.y, 6), round(rotation.z, 6),
                        round(rotation.w, 6)]
                };
                boneKeys.push(boneKeyJson);

                if (fr === 0 || fr === animation.frames.length - 1) {
                    boneKeyJson.scl = [1, 1, 1];
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

    private createMesh(modelDef: any, composed: any): SkinnedMesh {
        const geometry = this.createGeometry(composed);
        const material = this.createMaterial(modelDef);

        let mesh;
        if (modelDef.name === 'fists') {
            mesh = new Fists(geometry, material);
        } else {
            mesh = new SkinnedMesh(geometry, material);
        }

        mesh.scale.setScalar(this.config.worldScale);
        mesh.rotateX(MathUtils.degToRad(-90));

        const skeleton = this.createSkeleton(composed);
        mesh.add(skeleton.bones[0]);
        mesh.bind(skeleton);

        if (this.config.showSkeletons && mesh instanceof Weapon) {
            mesh.skeletonHelper = new SkeletonHelper(mesh);
        }

        mesh.animations = this.createAnimations(composed);
        return mesh;
    }

    private createGeometry(composed: any): BufferGeometry {
        const vertices: Vector3[] = [];
        const uvs: Vector2[] = [];
        const groups: { start: number; count: number; materialIndex?: number }[] = [];
        const skinIndices: Vector4[] = [];
        const skinWeights: Vector4[] = [];

        let materialIndex = undefined;
        let group: { start: number; count: number; materialIndex?: number } | undefined = undefined;
        let i = 0;

        for (; i < composed.faces.length; i++) {
            const face = composed.faces[i];

            for (let j = 0; j < 3; j++) {
                const vertexIdx = j === 0 ? face.a : (j === 1 ? face.b : face.c);
                vertices.push(composed.vertices[vertexIdx]);

                if (composed.skinIndices) {
                    const siX = composed.skinIndices[vertexIdx * 2];
                    const siY = composed.skinIndices[vertexIdx * 2 + 1];
                    skinIndices.push(new Vector4(siX, siY, 0, 0));
                }

                if (composed.skinWeights) {
                    const swX = composed.skinWeights[vertexIdx * 2];
                    const svY = composed.skinWeights[vertexIdx * 2 + 1];
                    skinWeights.push(new Vector4(swX, svY, 0, 0));
                }
            }

            if (face.materialIndex !== materialIndex) {
                materialIndex = face.materialIndex;
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

            const uvLayer = composed.uvs[0];
            for (let j = 0; j < 3; j++) {
                const uvIdx = j === 0 ? face.a : (j === 1 ? face.b : face.c);
                uvs.push(uvLayer[uvIdx]);
            }
        }

        if (group) {
            group.count = (i * 3) - group.start;
            groups.push(group);
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
        const skinIndex =  new Float32BufferAttribute(skinIndices.length * 4, 4);
        geometry.setAttribute('skinIndex', skinIndex.copyVector4sArray(skinIndices));
        const skinWeight = new Float32BufferAttribute(skinWeights.length * 4, 4);
        geometry.setAttribute('skinWeight', skinWeight.copyVector4sArray(skinWeights));
        geometry.groups = groups;
        return geometry;
    }

    private createSkeleton(composed: any) {
        const skeletonBones: Bone[] = [];
        if (composed.bones) {
            for (const bone of composed.bones) {
                const skeletonBone = new Bone();
                skeletonBone.name = bone.name;
                skeletonBone.position.fromArray(bone.pos);
                skeletonBone.quaternion.fromArray(bone.rotq);
                if (bone.scl != null) {
                    skeletonBone.scale.fromArray(bone.scl);
                }
                skeletonBones.push(skeletonBone);
            }

            for (let i = 0; i < composed.bones.length; i++) {
                const bone = composed.bones[i];
                if (bone.parent !== -1 && bone.parent != null && skeletonBones[bone.parent]) {
                    skeletonBones[bone.parent].add(skeletonBones[i]);
                }
            }
        }
        return new Skeleton(skeletonBones);
    }

    private createMaterial(modelDef: any): Material {
        if (modelDef.materials) {
            return this.materialFactory.create(modelDef.materials[0])[0];
        }
        return new MeshPhongMaterial();
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

    private computeVertexNormals(faces: any[], vertices: Vector3[]): Vector3[] {
        const vertexNormals: Vector3[] = [];
        for (let v = 0; v < vertices.length; v++) {
            vertexNormals[v] = new Vector3();
        }

        const cb = new Vector3(), ab = new Vector3();
        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];
            const faceVertices: Vector3[] = [];
            for (let j = 0; j < 3; j++) {
                const vertexIdx = j === 0 ? face.a : (j === 1 ? face.b : face.c);
                faceVertices.push(vertices[vertexIdx]);
            }

            cb.subVectors(faceVertices[2], faceVertices[1]);
            ab.subVectors(faceVertices[0], faceVertices[2]);
            cb.cross(ab);

            for (let j = 0; j < 3; j++) {
                const vertexIdx = j === 0 ? face.a : (j === 1 ? face.b : face.c);
                vertexNormals[vertexIdx].add(cb);
            }
        }

        for (let i = 0; i < vertexNormals.length; i++) {
            vertexNormals[i].normalize();
        }

        const normals: Vector3[] = [];
        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];
            for (let j = 0; j < 3; j++) {
                const vertexIdx = j === 0 ? face.a : (j === 1 ? face.b : face.c);
                normals.push(vertexNormals[vertexIdx]);
            }
        }
        return normals;
    }
}