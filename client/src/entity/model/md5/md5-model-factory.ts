import {AnimationClip, Bone, BufferGeometry, MathUtils, Skeleton, SkeletonHelper, SkinnedMesh} from 'three';

import {Md5MeshGeometry} from '../../../geometry/md5-mesh-geometry';
import {Md5Animation} from '../../../animation/md5-animation';
import {Md5Model} from './md5-model';
import {Md5ModelWireframeHelper} from './md5-model-wireframe-helper';
import {AbstractModelFactory} from '../abstract-model-factory';
import {GameAssets} from '../../../game-assets';
import {SoundFactory} from '../../sound/sound-factory';
import {Sound} from '../../sound/sound';
import {MaterialFactory} from '../../../material/material-factory';
import {GameConfig} from '../../../game-config';

export abstract class Md5ModelFactory extends AbstractModelFactory<Md5Model> {
    constructor(config: GameConfig,
                assets: GameAssets,
                materialFactory: MaterialFactory,
                protected readonly soundFactory: SoundFactory) {
        super(config, assets, materialFactory);
    }

    create(modelDef: any): Md5Model {
        const modelMesh = this.getRequiredModelMesh(modelDef);
        const modelGeometry = modelMesh.geometry.clone();
        const animations = this.getAnimations(modelDef);
        this.bindPose(<Md5MeshGeometry>modelGeometry, animations[0]);

        const model = this.createModel(modelDef, modelGeometry);
        model.name = modelDef.name;

        const skeleton = this.createSkeleton(animations[0]);
        this.bindSkeleton(model, skeleton);
        if (this.config.showSkeletons) {
            model.skeletonHelper = new SkeletonHelper(model);
        }

        model.animations = this.createAnimationClips(animations, skeleton);

        model.scale.setScalar(this.config.worldScale);

        if (modelDef.position) {
            model.position.fromArray(modelDef.position).multiplyScalar(this.config.worldScale);
        }
        if (modelDef.rotation) {
            model.rotation.set(
                MathUtils.degToRad(modelDef.rotation[0] - 90),
                MathUtils.degToRad(modelDef.rotation[1]),
                MathUtils.degToRad(modelDef.rotation[2] + 90)
            );
        } else {
            model.rotation.set(MathUtils.degToRad(-90), 0, MathUtils.degToRad(90));
        }

        if (this.config.showWireframe && !this.config.renderOnlyWireframe) {
            model.wireframeHelper = this.createWireframeHelper(model, animations);
        }

        model.init();
        return model;
    }

    protected createModel(modelDef: any, geometry: BufferGeometry): Md5Model {
        const modelParams = {
            config: this.config,
            geometry,
            materials: this.createMaterials(modelDef),
            sounds: this.createSounds(modelDef)
        };
        return new Md5Model(modelParams);
    }

    protected createSounds(modelDef: any): Map<string, Sound> {
        const sounds = new Map<string, Sound>();
        if (modelDef.sounds) {
            for (const soundName of Object.keys(modelDef.sounds)) {
                sounds.set(soundName, this.soundFactory.create(modelDef.sounds[soundName]));
            }
        }
        return sounds;
    }

    private getRequiredModelMesh(modelDef: any): SkinnedMesh {
        const mesh = <SkinnedMesh>this.assets.modelMeshes.get(modelDef.model);
        if (!mesh) {
            throw new Error(`MD5 model mesh "${modelDef.model}" is not found in game assets`);
        }
        return mesh;
    }

    private getAnimations(modelDef: any): Md5Animation[] {
        return modelDef.animations.map((animationName: string) => this.assets.modelAnimations.get(animationName));
    }

    private bindPose(geometry: Md5MeshGeometry, animation: Md5Animation) {
        geometry.bindPose(animation.getFrame(0, true));
    }

    private bindSkeleton(model: SkinnedMesh, skeleton: Skeleton) {
        model.add(skeleton.bones[0]);
        model.bind(skeleton);
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

    private createWireframeHelper(model: Md5Model, animations: Md5Animation[]): Md5ModelWireframeHelper {
        const helper = new Md5ModelWireframeHelper(model.geometry.clone());
        if (model.animations) {
            helper.animations = model.animations.map(animation => animation.clone());
        }
        this.bindSkeleton(helper, this.createSkeleton(animations[0]));
        return helper;
    }

    private createAnimationClips(animations: Md5Animation[], skeleton: Skeleton) {
        return animations.map(animation => AnimationClip.parseAnimation(animation, skeleton.bones));
    }
}
