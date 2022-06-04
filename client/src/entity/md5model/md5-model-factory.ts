import {
    AnimationClip,
    Bone,
    BufferGeometry,
    Material,
    MathUtils,
    MeshBasicMaterial,
    MeshPhongMaterial,
    Skeleton,
    SkeletonHelper,
    SkinnedMesh
} from 'three';

import {EntityFactory} from '../entity-factory';
import {GameAssets} from '../../game-assets';
import {GameConfig} from '../../game-config';
import {MaterialFactory} from '../../material/material-factory';
import {Fists} from './weapon/fists';
import {Md5MeshGeometry} from '../../geometry/md5-mesh-geometry';
import {Md5Animation} from '../../animation/md5-animation';
import {Md5Model} from './md5-model';

// noinspection JSMethodCanBeStatic
export class Md5ModelFactory implements EntityFactory<Md5Model> {
    constructor(private readonly config: GameConfig,
                private readonly materialFactory: MaterialFactory,
                private readonly assets: GameAssets) {
    }

    create(modelDef: any): Md5Model {
        const mesh = <SkinnedMesh>this.assets.modelMeshes.get(modelDef.model);
        if (!mesh) {
            throw new Error(`MD5 model mesh "${modelDef.model}" is not found in game assets`);
        }
        const animations: Md5Animation[] = modelDef.animations
            .map((animationName: string) => this.assets.modelAnimations.get(animationName));
        this.bindPose(mesh, animations[0]);
        const material = this.createMaterial(modelDef);
        const model = this.createModel(modelDef.name, mesh.geometry, material, animations);
        if (this.config.showWireframe && !this.config.renderOnlyWireframe) {
            model.wireframeModel = this.createWireframeModel(model, animations);
        }
        model.init();
        return model;
    }

    private bindPose(mesh: SkinnedMesh, animation: Md5Animation) {
        (<Md5MeshGeometry>mesh.geometry).bindPose(animation.getFrame(0, true));
    }

    private bindSkeleton(model: Md5Model, skeleton: Skeleton) {
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

    private createMaterial(modelDef: any): Material {
        if (this.config.renderOnlyWireframe) {
            return new MeshBasicMaterial({wireframe: true});
        }
        if (modelDef.materials) {
            return this.materialFactory.create(modelDef.materials[0])[0];
        }
        return new MeshPhongMaterial();
    }

    private createModel(modelName: string,
                        geometry: BufferGeometry,
                        material: Material,
                        animations: Md5Animation[]): Md5Model {
        let model;
        if (modelName === 'fists') {
            model = new Fists(geometry, material);
        } else {
            model = new Md5Model(geometry, material);
        }
        model.name = modelName;

        const skeleton = this.createSkeleton(animations[0]);
        this.bindSkeleton(model, skeleton);
        if (this.config.showSkeletons) {
            model.skeletonHelper = new SkeletonHelper(model);
        }

        model.animations = this.createAnimationClips(animations, skeleton);

        model.scale.setScalar(this.config.worldScale);
        model.position.set(0, 0.5, 0);
        model.rotateX(MathUtils.degToRad(-90));
        return model;
    }

    private createWireframeModel(model: Md5Model, animations: Md5Animation[]) {
        const wireframeModel = model.clone();
        wireframeModel.material = new MeshBasicMaterial({wireframe: true});
        this.bindSkeleton(wireframeModel, this.createSkeleton(animations[0]));
        wireframeModel.scale.setScalar(1);
        wireframeModel.position.setScalar(0);
        wireframeModel.rotation.set(0, 0, 0);
        return wireframeModel;
    }

    private createAnimationClips(animations: Md5Animation[], skeleton: Skeleton) {
        return animations.map(animation => AnimationClip.parseAnimation(animation, skeleton.bones));
    }
}