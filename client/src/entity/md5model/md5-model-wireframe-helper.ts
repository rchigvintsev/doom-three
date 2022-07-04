import {AnimationAction, AnimationMixer, BufferGeometry, MeshBasicMaterial, SkinnedMesh} from 'three';
import {Animations} from '../../util/animations';

export class Md5ModelWireframeHelper extends SkinnedMesh {
    private readonly animationActions = new Map<string, AnimationAction>();

    private animationMixer?: AnimationMixer;
    private initialized = false;

    constructor(geometry: BufferGeometry) {
        super(geometry, new MeshBasicMaterial({wireframe: true}));
    }

    init() {
        if (!this.initialized) {
            if (this.animations) {
                this.animationMixer = new AnimationMixer(this);
                this.initAnimationActions(this.animationMixer);
            }
            this.initialized = true;
        }
    }

    update(deltaTime: number) {
        if (this.animationMixer) {
            this.animationMixer.update(deltaTime);
        }
    }

    animateCrossFadeTo(startActionName: string, endActionName: string, duration: number) {
        const startAction = this.getRequiredAnimationAction(startActionName);
        const endAction = this.getRequiredAnimationAction(endActionName);

        startAction.play();
        endAction.reset().play();
        startAction.crossFadeTo(endAction, duration, false);
    }

    animateFadeOutFadeIn(fadeOutActionName: string,
                         fadeOutActionDuration: number,
                         fadeInActionName: string,
                         fadeInActionDuration: number) {
        const fadeOutAction = this.getRequiredAnimationAction(fadeOutActionName);
        const fadeInAction = this.getRequiredAnimationAction(fadeInActionName);

        fadeOutAction.stop().reset().fadeOut(fadeOutActionDuration).play();
        fadeInAction.stop().reset().fadeIn(fadeInActionDuration).play();
    }

    private getRequiredAnimationAction(actionName: string): AnimationAction {
        const action = this.getAnimationAction(actionName);
        if (!action) {
            throw new Error(`Animation action "${actionName}" is not found in MD5 model "${this.name}"`);
        }
        return action;
    }

    protected getAnimationAction(actionName: string): AnimationAction | undefined {
        return this.animationActions.get(actionName);
    }

    private initAnimationActions(animationMixer: AnimationMixer) {
        Animations.createAnimationActions(animationMixer, this.animations)
            .forEach((action, name) => this.animationActions.set(name, action));
    }
}