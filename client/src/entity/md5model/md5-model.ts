import {
    AnimationAction,
    AnimationMixer,
    Audio,
    BufferGeometry,
    LoopOnce,
    Material,
    SkeletonHelper,
    SkinnedMesh
} from 'three';

import {Entity} from '../entity';

export class Md5Model extends SkinnedMesh implements Entity {
    skeletonHelper?: SkeletonHelper;

    private readonly animationActions = new Map<string, AnimationAction>();

    private animationMixer?: AnimationMixer;
    private _wireframeModel?: Md5Model;

    private initialized = false;

    constructor(geometry: BufferGeometry,
                materials: Material | Material[],
                private readonly sounds: Map<string, Audio<AudioNode>>) {
        super(geometry, materials);
    }

    init() {
        if (!this.initialized) {
            if (this.animations) {
                this.animationMixer = new AnimationMixer(this);
                this.initAnimationActions(this.animationMixer);
            }
            if (this._wireframeModel) {
                this._wireframeModel.init();
            }
            this.initialized = true;
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

    protected getRequiredAnimationAction(actionName: string): AnimationAction {
        const action = this.animationActions.get(actionName);
        if (!action) {
            throw new Error(`Animation action "${actionName}" is not found in MD5 model "${this.name}"`);
        }
        return action;
    }

    protected getRequiredSound(soundName: string): Audio<AudioNode> {
        const sound = this.sounds.get(soundName);
        if (!sound) {
            throw new Error(`Sound "${soundName}" is not found in MD5 model "${this.name}"`);
        }
        return sound;
    }

    protected executeActionCrossFade(startAction: AnimationAction, endAction: AnimationAction, duration: number) {
        startAction.reset().play();
        endAction.enabled = true;
        endAction.reset().play();
        startAction.crossFadeTo(endAction, duration, false);
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
    }
}