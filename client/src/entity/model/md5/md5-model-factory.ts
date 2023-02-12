import {AnimationClip, Bone, BufferGeometry, MathUtils, Skeleton, SkeletonHelper, SkinnedMesh} from 'three';

import {Md5MeshGeometry} from '../../../geometry/md5-mesh-geometry';
import {Md5Animation} from '../../../animation/md5-animation';
import {Md5Model} from './md5-model';
import {Md5ModelWireframeHelper} from './md5-model-wireframe-helper';
import {ParticleSystem} from '../../../particles/particle-system';
import {AbstractModelFactory, ModelFactoryParameters} from '../abstract-model-factory';
import {DebrisSystem} from '../../../debris/debris-system';
import {GameAssets} from '../../../game-assets';
import {DecalSystem} from '../../../decal/decal-system';
import {SoundSystem} from '../../../sound/sound-system';

export abstract class Md5ModelFactory extends AbstractModelFactory<Md5Model> {
    constructor(parameters: Md5ModelFactoryParameters) {
        super(parameters);
    }

    create(modelDef: any): Md5Model {
        const modelMesh = this.getRequiredModelMesh(modelDef);
        const animations = this.getAnimations(modelDef);
        this.bindPose(modelMesh, animations[0]);

        const model = this.createModel(modelDef, modelMesh.geometry);
        model.name = modelDef.name;

        const skeleton = this.createSkeleton(animations[0]);
        this.bindSkeleton(model, skeleton);
        if (this.parameters.config.showSkeletons) {
            model.skeletonHelper = new SkeletonHelper(model);
        }

        model.animations = this.createAnimationClips(animations, skeleton);

        model.scale.setScalar(this.parameters.config.worldScale);

        if (modelDef.position) {
            model.position.fromArray(modelDef.position).multiplyScalar(this.parameters.config.worldScale);
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

        if (this.parameters.config.showWireframe && !this.parameters.config.renderOnlyWireframe) {
            model.wireframeHelper = this.createWireframeHelper(model, animations);
        }

        model.init();
        return model;
    }

    protected createModel(modelDef: any, geometry: BufferGeometry): Md5Model {
        const modelParams = {
            config: this.parameters.config,
            geometry,
            materials: this.createMaterials(modelDef),
            sounds: this.getSounds(modelDef),
            soundSystem: this.soundSystem
        };
        return new Md5Model(modelParams);
    }

    protected getSounds(modelDef: any): Map<string, string> {
        const sounds = new Map<string, string>();
        if (modelDef.sounds) {
            for (const soundName of Object.keys(modelDef.sounds)) {
                sounds.set(soundName, modelDef.sounds[soundName]);
            }
        }
        return sounds;
    }

    protected get soundSystem(): SoundSystem {
        return (<Md5ModelFactoryParameters>this.parameters).soundSystem;
    }

    protected get particleSystem(): ParticleSystem {
        return (<Md5ModelFactoryParameters>this.parameters).particleSystem;
    }

    protected get debrisSystem(): DebrisSystem {
        return (<Md5ModelFactoryParameters>this.parameters).debrisSystem;
    }

    protected get decalSystem(): DecalSystem {
        return (<Md5ModelFactoryParameters>this.parameters).decalSystem;
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

    private bindPose(mesh: SkinnedMesh, animation: Md5Animation) {
        (<Md5MeshGeometry>mesh.geometry).bindPose(animation.getFrame(0, true));
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

    private get assets(): GameAssets {
        return (<Md5ModelFactoryParameters>this.parameters).assets;
    }
}

export interface Md5ModelFactoryParameters extends ModelFactoryParameters {
    particleSystem: ParticleSystem;
    debrisSystem: DebrisSystem;
    decalSystem: DecalSystem;
    soundSystem: SoundSystem;
}
