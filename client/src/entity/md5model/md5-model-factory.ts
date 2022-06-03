import {
    AnimationAction,
    AnimationClip,
    AnimationMixer,
    Bone,
    BufferGeometry,
    LoopOnce,
    Material,
    MathUtils,
    MeshPhongMaterial,
    Skeleton,
    SkeletonHelper,
    SkinnedMesh
} from 'three';

import {EntityFactory} from '../entity-factory';
import {GameAssets} from '../../game-assets';
import {GameConfig} from '../../game-config';
import {MaterialFactory} from '../../material/material-factory';
import {Fists} from '../weapon/fists';
import {Weapon} from '../weapon/weapon';
import {Md5MeshGeometry} from '../../geometry/md5-mesh-geometry';
import {Md5Animation} from '../../animation/md5-animation';

// noinspection JSMethodCanBeStatic
export class Md5ModelFactory implements EntityFactory<SkinnedMesh> {
    constructor(private readonly config: GameConfig,
                private readonly materialFactory: MaterialFactory,
                private readonly assets: GameAssets) {
    }

    create(modelDef: any): SkinnedMesh {
        const mesh = <SkinnedMesh>this.assets.modelMeshes.get(modelDef.model);
        if (!mesh) {
            throw new Error(`MD5 model mesh "${modelDef.model}" is not found in game assets`);
        }
        const animations: Md5Animation[] = modelDef.animations
            .map((animationName: string) => this.assets.modelAnimations.get(animationName));

        this.bindPose(mesh, animations[0]);
        const resultMesh = this.createMesh(modelDef.name, mesh.geometry, this.createMaterial(modelDef));
        const skeleton = this.bindSkeleton(resultMesh, animations[0]);

        resultMesh.animations = animations.map(animation => AnimationClip.parseAnimation(animation, skeleton.bones));

        const animationMixer = new AnimationMixer(resultMesh);
        const actions = new Map<string, AnimationAction>();
        for (let i = 0; i < resultMesh.animations.length; i++) {
            const clip = resultMesh.animations[i];
            const action = animationMixer.clipAction(clip);
            if (clip.name !== 'idle') {
                action.setLoop(LoopOnce, 1);
            }
            actions.set(clip.name, action);
        }
        resultMesh.userData['animationMixer'] = animationMixer;

        const action = actions.get('idle');
        if (action) {
            action.play();
        }

        return resultMesh;
    }

    private bindPose(mesh: SkinnedMesh, animation: Md5Animation) {
        (<Md5MeshGeometry>mesh.geometry).bindPose(animation.getFrame(0, true));
    }

    private bindSkeleton(mesh: SkinnedMesh, animation: Md5Animation): Skeleton {
        const skeleton = this.createSkeleton(animation);
        mesh.add(skeleton.bones[0]);
        mesh.bind(skeleton);
        if (this.config.showSkeletons && mesh instanceof Weapon) {
            mesh.skeletonHelper = new SkeletonHelper(mesh);
        }
        return skeleton;
    }

    private createSkeleton(animation: Md5Animation): Skeleton {
        const bones: Bone[] = [];
        const firstFrame = animation.getFrame(0);
        for (let i = 0; i < animation.baseFrames.length; i++) {
            const framePosition = firstFrame[i].position;
            const frameOrientation = firstFrame[i].orientation;

            const bone = new Bone();
            bone.name = animation.hierarchy[i].name;
            bone.position.copy(framePosition);
            bone.quaternion.copy(frameOrientation);
            bone.userData['parent'] = animation.hierarchy[i].parent;
            bones.push(bone);
        }

        for (let i = 0; i < bones.length; i++) {
            const bone = bones[i];
            const parent = bone.userData['parent'];
            if (parent !== -1 && parent != null && bones[parent]) {
                bones[parent].add(bone);
            }
        }

        return new Skeleton(bones);
    }

    private createMaterial(modelDef: any): Material {
        if (modelDef.materials) {
            return this.materialFactory.create(modelDef.materials[0])[0];
        }
        return new MeshPhongMaterial();
    }

    private createMesh(modelName: string, geometry: BufferGeometry, material: Material): SkinnedMesh {
        let mesh;
        if (modelName === 'fists') {
            mesh = new Fists(geometry, material);
        } else {
            mesh = new SkinnedMesh(geometry, material);
        }
        mesh.scale.setScalar(this.config.worldScale);
        mesh.position.set(0, 0.5, 0);
        mesh.rotateX(MathUtils.degToRad(-90));
        return mesh;
    }
}