import {AnimationAction, AnimationMixer} from 'three';
import {Object3D} from 'three/src/core/Object3D';
import {Animations} from '../util/animations';
import {Strings} from '../util/strings';

export class CustomAnimationMixer extends AnimationMixer {
    private readonly animationActions = new Map<string, AnimationAction>();
    private readonly updateHandlerCache = new Map<number, UpdateHandler>();

    private updateHandler?: UpdateHandler;

    constructor(root: Object3D) {
        super(root);
        this.initAnimationActions(root);
    }

    update(deltaTime: number): AnimationMixer {
        super.update(deltaTime);
        if (this.updateHandler) {
            this.updateHandler.handle(deltaTime);
        }
        return this;
    }

    crossFade(startActionName: string, endActionName: string, duration: number) {
        const startAction = this.getRequiredAnimationAction(startActionName);
        const endAction = this.getRequiredAnimationAction(endActionName);

        startAction.reset().play();
        endAction.reset().play();
        startAction.crossFadeTo(endAction, duration, false);
    }

    crossFadeAsync(startActionName: string, endActionName: string, fadeOutDuration: number, fadeInDuration: number) {
        const startAction = this.getRequiredAnimationAction(startActionName);
        const endAction = this.getRequiredAnimationAction(endActionName);

        startAction.stop().reset().fadeOut(fadeOutDuration).play();
        endAction.stop().reset().fadeIn(fadeInDuration).play();
    }

    crossFadeDelayed(startActionName: string, endActionName: string, delay: number, duration?: number) {
        const startAction = this.getRequiredAnimationAction(startActionName);
        const endAction = this.getRequiredAnimationAction(endActionName);

        const startActionDuration = startAction.getClip().duration;
        if (delay > startActionDuration) {
            console.error(`Specified delay (${delay}) is greater than start action duration (${startActionDuration})`);
            return;
        }

        startAction.reset().play();

        let key = Strings.hashCode(startActionName);
        key = 31 * key + Strings.hashCode(endActionName);
        key = 31 * key + delay;
        key = 31 * key + (duration || 0);

        this.updateHandler = this.updateHandlerCache.get(key);
        if (!this.updateHandler) {
            this.updateHandler = new (class extends UpdateHandler {
                handle(_deltaTime: number): void {
                    if (startAction.time > delay) {
                        endAction.reset().play();
                        if (duration == undefined) {
                            duration = startActionDuration - startAction.time;
                        }
                        startAction.crossFadeTo(endAction, duration, false);
                        this.mixer.updateHandler = undefined;
                    }
                }
            })(this);
            this.updateHandlerCache.set(key, this.updateHandler);
        }
    }

    getRequiredAnimationAction(actionName: string): AnimationAction {
        const action = this.getAnimationAction(actionName);
        if (!action) {
            throw new Error(`Animation action "${actionName}" is not found`);
        }
        return action;
    }

    getAnimationAction(actionName: string): AnimationAction | undefined {
        return this.animationActions.get(actionName);
    }

    private initAnimationActions(root: Object3D) {
        Animations.createAnimationActions(this, root.animations)
            .forEach((action, name) => this.animationActions.set(name, action));
    }
}

abstract class UpdateHandler {
    constructor(protected readonly mixer: CustomAnimationMixer) {
    }

    abstract handle(deltaTime: number): void
}