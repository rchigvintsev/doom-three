import {AnimationClip, Bone, BufferGeometry, MathUtils, Skeleton, SkeletonHelper, SkinnedMesh} from 'three';

import {Fists} from './weapon/fists';
import {Md5MeshGeometry} from '../../../geometry/md5-mesh-geometry';
import {Md5Animation} from '../../../animation/md5-animation';
import {Md5Model} from './md5-model';
import {Flashlight} from "./weapon/flashlight";
import {Md5ModelWireframeHelper} from './md5-model-wireframe-helper';
import {Pistol} from './weapon/pistol';
import {ParticleSystem} from '../../../particles/particle-system';
import {AbstractModelFactory, ModelFactoryParameters} from '../abstract-model-factory';
import {DebrisSystem} from '../../../debris/debris-system';
import {GameAssets} from '../../../game-assets';
import {DecalSystem} from '../../../decal/decal-system';
import {SoundSystem} from '../../../sound/sound-system';

export class Md5ModelFactory extends AbstractModelFactory<Md5Model> {
    constructor(parameters: Md5ModelFactoryParameters) {
        super(parameters);
    }

    create(modelDef: any): Md5Model {
        const modelMesh = this.getRequiredModelMesh(modelDef);
        const animations = this.getAnimations(modelDef);
        this.bindPose(modelMesh, animations[0]);
        const model = this.createModel(modelDef, modelMesh.geometry, animations);
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

    private getSounds(modelDef: any): Map<string, string> {
        const sounds = new Map<string, string>();
        if (modelDef.sounds) {
            for (const soundName of Object.keys(modelDef.sounds)) {
                sounds.set(soundName, modelDef.sounds[soundName]);
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

    private createModel(modelDef: any, geometry: BufferGeometry, animations: Md5Animation[]): Md5Model {
        let model;
        if (modelDef.name === 'fists') {
            model = this.createFists(modelDef, geometry);
        } else if (modelDef.name === 'flashlight') {
            model = this.createFlashlight(modelDef, geometry);
        } else if (modelDef.name === 'pistol') {
            model = this.createPistol(modelDef, geometry);
        } else {
            const materials = this.createMaterials(modelDef);
            const sounds = this.getSounds(modelDef);
            model = new Md5Model({
                config: this.parameters.config,
                geometry,
                materials,
                sounds,
                soundSystem: this.soundSystem
            });
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

    private createFists(modelDef: any, geometry: BufferGeometry) {
        const materials = this.createMaterials(modelDef);
        const sounds = this.getSounds(modelDef);
        return new Fists({config: this.parameters.config, geometry, materials, sounds, soundSystem: this.soundSystem});
    }

    private createFlashlight(modelDef: any, geometry: BufferGeometry) {
        const materials = this.createMaterials(modelDef);
        const sounds = this.getSounds(modelDef);
        let flashlightMap = undefined;
        if (!this.parameters.config.renderOnlyWireframe) {
            flashlightMap = this.parameters.materialFactory.getTexture('lights/flashlight5');
        }
        return new Flashlight({
            config: this.parameters.config,
            geometry,
            materials,
            sounds,
            lightMap: flashlightMap,
            soundSystem: this.soundSystem
        });
    }

    private createPistol(modelDef: any, geometry: BufferGeometry) {
        const materials = this.createMaterials(modelDef);
        const sounds = this.getSounds(modelDef);
        return new Pistol({
            config: this.parameters.config,
            geometry,
            materials,
            sounds,
            particleSystem: this.particleSystem,
            debrisSystem: this.debrisSystem,
            decalSystem: this.decalSystem,
            soundSystem: this.soundSystem,
            muzzleSmokeParticleName: modelDef.muzzleSmoke,
            shellDebrisName: modelDef.shell,
            detonationMarkDecalName: modelDef.detonationMark
        });
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

    private get particleSystem(): ParticleSystem {
        return (<Md5ModelFactoryParameters>this.parameters).particleSystem;
    }

    private get debrisSystem(): DebrisSystem {
        return (<Md5ModelFactoryParameters>this.parameters).debrisSystem;
    }

    private get decalSystem(): DecalSystem {
        return (<Md5ModelFactoryParameters>this.parameters).decalSystem;
    }

    private get soundSystem(): SoundSystem {
        return (<Md5ModelFactoryParameters>this.parameters).soundSystem;
    }
}

export interface Md5ModelFactoryParameters extends ModelFactoryParameters {
    particleSystem: ParticleSystem;
    debrisSystem: DebrisSystem;
    decalSystem: DecalSystem;
    soundSystem: SoundSystem;
}
