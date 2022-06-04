import {AnimationAction, AnimationMixer, BufferGeometry, LoopOnce, Material, SkeletonHelper, SkinnedMesh} from 'three';

import {Entity} from '../entity';

export class Md5Model extends SkinnedMesh implements Entity {
    skeletonHelper?: SkeletonHelper;

    protected readonly animationActions = new Map<string, AnimationAction>();

    private animationMixer?: AnimationMixer;
    private _wireframeModel?: Md5Model;

    constructor(geometry: BufferGeometry, materials: Material | Material[]) {
        super(geometry, materials);
    }

    init() {
        if (this.animations) {
            this.animationMixer = new AnimationMixer(this);
            this.initAnimationActions(this.animationMixer);
        }
        if (this._wireframeModel) {
            this._wireframeModel.init();
        }
    }

    update(deltaTime: number): void {
        if (this.animationMixer) {
            this.animationMixer.update(deltaTime);
        }
        if (this._wireframeModel) {
            this._wireframeModel.update(deltaTime);
        }
    }

    clone(recursive?: boolean): this {
        const clone = super.clone(recursive);
        if (this.animations) {
            clone.animations = this.animations.map(animation => animation.clone());
        }
        if (this.skeletonHelper) {
            clone.skeletonHelper = this.skeletonHelper;
        }
        if (this._wireframeModel) {
            clone.wireframeModel = this._wireframeModel;
        }
        return clone;
    }

    set wireframeModel(wireframeModel: Md5Model) {
        this._wireframeModel = wireframeModel;
        this.add(wireframeModel);
    }

    private initAnimationActions(animationMixer: AnimationMixer) {
        for (let i = 0; i < this.animations.length; i++) {
            const animation = this.animations[i];
            const action = animationMixer.clipAction(animation);
            if (animation.name !== 'idle') {
                action.setLoop(LoopOnce, 1);
            }
            this.animationActions.set(animation.name, action);
        }

        const idleAction = this.animationActions.get('idle');
        if (idleAction) {
            idleAction.play();
        }
    }
}