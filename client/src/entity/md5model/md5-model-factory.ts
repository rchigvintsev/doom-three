import {
    AnimationAction,
    AnimationClip,
    AnimationMixer,
    Bone,
    LoopOnce,
    Material,
    MathUtils,
    MeshPhongMaterial,
    Quaternion,
    Skeleton,
    SkeletonHelper,
    SkinnedMesh,
    Vector3
} from 'three';

import {round} from 'mathjs';

import {EntityFactory} from '../entity-factory';
import {GameAssets} from '../../game-assets';
import {GameConfig} from '../../game-config';
import {MaterialFactory} from '../../material/material-factory';
import {Fists} from '../weapon/fists';
import {Weapon} from '../weapon/weapon';
import {Md5MeshGeometry} from '../../geometry/md5-mesh-geometry';

// noinspection JSMethodCanBeStatic
export class Md5ModelFactory implements EntityFactory<SkinnedMesh> {
    constructor(private readonly config: GameConfig,
                private readonly materialFactory: MaterialFactory,
                private readonly assets: GameAssets) {
    }

    create(modelDef: any): SkinnedMesh {
        const mesh: SkinnedMesh = this.assets.modelMeshes.get(modelDef.model);
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
        const composed = this.compose(animations);
        const result = this.createMesh(modelDef, mesh, composed);

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

    private bindPose(mesh: SkinnedMesh, animation: any) {
        (<Md5MeshGeometry>mesh.geometry).bindPose(this.getFrame(animation, 0, true));
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

    private compose(animations: any[]): any {
        const firstFrame = this.getFrame(animations[0], 0);
        const bonesJson = [];
        for (let i = 0; i < animations[0].baseFrames.length; i++) {
            const framePosition = firstFrame[i].position;
            const frameOrientation = firstFrame[i].orientation;
            bonesJson.push({
                parent: animations[0].hierarchy[i].parent,
                name: animations[0].hierarchy[i].name,
                pos: [round(framePosition.x, 6), round(framePosition.y, 6), round(framePosition.z, 6)],
                rotq: [round(frameOrientation.x, 6), round(frameOrientation.y, 6),
                    round(frameOrientation.z, 6), round(frameOrientation.w, 6)]
            });
        }

        const jsonAnimations = [];
        for (let i = 0; i < animations.length; i++) {
            jsonAnimations.push(this.composeAnimation(animations[i]));
        }

        return {bones: bonesJson, animations: jsonAnimations};
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

    private createMesh(modelDef: any, mesh: SkinnedMesh, composed: any): SkinnedMesh {
        const material = this.createMaterial(modelDef);

        let result;
        if (modelDef.name === 'fists') {
            result = new Fists(mesh.geometry, material);
        } else {
            result = new SkinnedMesh(mesh.geometry, material);
        }

        result.scale.setScalar(this.config.worldScale);
        result.rotateX(MathUtils.degToRad(-90));

        const skeleton = this.createSkeleton(composed);
        result.add(skeleton.bones[0]);
        result.bind(skeleton);

        if (this.config.showSkeletons && result instanceof Weapon) {
            result.skeletonHelper = new SkeletonHelper(result);
        }

        result.animations = this.createAnimations(composed);
        return result;
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
}