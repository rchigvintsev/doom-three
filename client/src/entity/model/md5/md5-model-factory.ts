import {
    AnimationClip,
    Audio,
    Bone,
    BufferGeometry,
    Material,
    MathUtils,
    Skeleton,
    SkeletonHelper,
    SkinnedMesh
} from 'three';

import {Fists} from './weapon/fists';
import {Md5MeshGeometry} from '../../../geometry/md5-mesh-geometry';
import {Md5Animation} from '../../../animation/md5-animation';
import {Md5Model} from './md5-model';
import {SoundFactory} from '../../sound/sound-factory';
import {Flashlight} from "./weapon/flashlight";
import {Md5ModelWireframeHelper} from './md5-model-wireframe-helper';
import {Pistol} from './weapon/pistol';
import {ParticleSystem} from '../../../particles/particle-system';
import {AbstractModelFactory, ModelFactoryParameters} from '../abstract-model-factory';
import {DebrisSystem} from '../../../debris/debris-system';
import {GameAssets} from '../../../game-assets';

export class Md5ModelFactory extends AbstractModelFactory<Md5Model> {
    constructor(parameters: Md5ModelFactoryParameters) {
        super(parameters);
    }

    create(modelDef: any): Md5Model {
        const modelMesh = this.getRequiredModelMesh(modelDef);
        const animations = this.getAnimations(modelDef);
        this.bindPose(modelMesh, animations[0]);
        const materials = this.createMaterials(modelDef);
        const sounds = this.createSounds(modelDef);
        const model = this.createModel(modelDef, modelMesh.geometry, materials, animations, sounds);
        if (this.parameters.config.showWireframe && !this.parameters.config.renderOnlyWireframe) {
            model.wireframeHelper = this.createWireframeHelper(model, animations);
        }
        model.init();
        return model;
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

    private createSounds(modelDef: any): Map<string, Audio<AudioNode>[]> {
        const sounds = new Map<string, Audio<AudioNode>[]>();
        if (modelDef.sounds) {
            for (const soundName of Object.keys(modelDef.sounds)) {
                sounds.set(soundName, this.soundFactory.create(modelDef.sounds[soundName]));
            }
        }
        return sounds;
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

    private createModel(modelDef: any,
                        geometry: BufferGeometry,
                        materials: Material[],
                        animations: Md5Animation[],
                        sounds: Map<string, Audio<AudioNode>[]>): Md5Model {
        let model;
        if (modelDef.name === 'fists') {
            model = new Fists({config: this.parameters.config, geometry, materials, sounds});
        } else if (modelDef.name === 'flashlight') {
            model = this.createFlashlight(geometry, materials, sounds);
        } else if (modelDef.name === 'pistol') {
            model = this.createPistol(modelDef, geometry, materials, sounds);
        } else {
            model = new Md5Model({config: this.parameters.config, geometry, materials, sounds});
        }
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
        model.rotation.set(MathUtils.degToRad(-90), 0, MathUtils.degToRad(90));
        return model;
    }

    private createPistol(modelDef: any,
                         geometry: BufferGeometry,
                         materials: Material[],
                         sounds: Map<string, Audio<AudioNode>[]>) {
        return new Pistol({
            config: this.parameters.config,
            geometry,
            materials,
            sounds,
            particleSystem: this.particleSystem,
            debrisSystem: this.debrisSystem,
            muzzleSmokeParticleName: modelDef.muzzleSmoke,
            shellDebrisName: modelDef.shell
        });
    }

    private createFlashlight(geometry: BufferGeometry, materials: Material[], sounds: Map<string, Audio<AudioNode>[]>) {
        let flashlightMap = undefined;
        if (!this.parameters.config.renderOnlyWireframe) {
            flashlightMap = this.parameters.materialFactory.getTexture('lights/flashlight5');
        }
        return new Flashlight({config: this.parameters.config, geometry, materials, sounds, lightMap: flashlightMap});
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
        return (<Md5ModelFactoryParameters>this.parameters).assets!;
    }

    private get soundFactory(): SoundFactory {
        return (<Md5ModelFactoryParameters>this.parameters).soundFactory;
    }

    private get particleSystem(): ParticleSystem {
        return (<Md5ModelFactoryParameters>this.parameters).particleSystem;
    }

    private get debrisSystem(): DebrisSystem {
        return (<Md5ModelFactoryParameters>this.parameters).debrisSystem;
    }
}

export class Md5ModelFactoryParameters extends ModelFactoryParameters {
    soundFactory!: SoundFactory;
    particleSystem!: ParticleSystem;
    debrisSystem!: DebrisSystem;
}