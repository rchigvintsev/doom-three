import {AnimationAction, LoopRepeat} from 'three';

import {AnimationFlow} from './animation-flow';
import {AnimationFlowStep} from './animation-flow-step';
import {Random} from '../../util/random';
import {AnyAnimationFlowStep} from './any-animation-flow-step';

export class CrossFadeAnyAnimationFlowStep extends AnyAnimationFlowStep {
    private delay?: number;
    private duration?: number;
    private fadeOutDuration?: number;
    private fadeInDuration?: number;
    private warping = false;
    private playing = false;

    constructor(flow: AnimationFlow,
                private readonly fromStep: AnimationFlowStep,
                toActions: AnimationAction[],
                stopBeforeStart?: boolean,
                random?: Random) {
        super(flow, toActions, stopBeforeStart, random);
    }

    get action(): AnimationAction {
        if (!this.started) {
            throw new Error('Animation flow step "cross fade any" is not started');
        }
        return super.action;
    }

    handle(deltaTime: number) {
        if (this.started) {
            if (this.playing) {
                this.invokeOnTimeCallbacks(deltaTime);
            } else if (this.delay != undefined) {
                const fromAction = this.fromStep.action;
                const fromClip = fromAction.getClip();

                let delay = Math.min(this.delay, fromClip.duration);
                let time = fromAction.time;
                if (this.isActionRepeating(fromAction)) {
                    delay += (fromAction.repetitions - 1) * fromClip.duration;
                    const loopCount = this.getActionLoopCount(fromAction);
                    if (loopCount !== -1) {
                        time += loopCount * fromClip.duration;
                    }
                }

                if (time >= delay) {
                    this._action!.play();
                    this.playing = true;

                    let duration = this.duration;
                    if (duration == undefined) {
                        duration = fromClip.duration - fromAction.time;
                    }

                    this.crossFadeActions(fromAction, this._action!, duration);

                    if (this.onStartCallback) {
                        this.onStartCallback(this._action!);
                    }
                }
            }
        }
    }

    clone(flow: AnimationFlow): CrossFadeAnyAnimationFlowStep {
        const clone = flow.crossFadeAnyStep(undefined, ...this.actions.map(action => action.getClip().name));
        if (this.delay != undefined) {
            clone.withDelay(this.delay);
        }
        if (this.duration != undefined) {
            clone.withDuration(this.duration);
        }
        if (this.fadeOutDuration != undefined) {
            clone.withFadeOutDuration(this.fadeOutDuration);
        }
        if (this.fadeInDuration != undefined) {
            clone.withFadeInDuration(this.fadeInDuration);
        }
        if (this.warping) {
            clone.withWarping();
        }
        if (this._clampWhenFinished) {
            clone.clampWhenFinished();
        }
        if (this.repetitionSupplier) {
            clone.repeat(this.repetitionSupplier);
        }
        return clone;
    }

    withDelay(delay: number): this {
        this.delay = delay;
        return this;
    }

    withDuration(duration: number): this {
        this.duration = duration;
        return this;
    }

    withFadeOutDuration(fadeOutDuration: number): this {
        this.fadeOutDuration = fadeOutDuration;
        return this;
    }

    withFadeInDuration(fadeInDuration: number): this {
        this.fadeInDuration = fadeInDuration;
        return this;
    }

    withWarping(): this {
        this.warping = true;
        return this;
    }

    protected doStart() {
        if (this.delay == undefined) {
            const fromAction = this.fromStep.action;
            this._action!.play();
            this.playing = true;

            let duration = this.duration;
            if (duration == undefined) {
                duration = 1;
            }

            this.crossFadeActions(fromAction, this._action!, duration);

            if (this.onStartCallback) {
                this.onStartCallback(this._action!);
            }
        } else {
            this.playing = false;
        }

        this.started = true;
    }

    protected doStop() {
        super.doStop();
        this.playing = false;
    }

    private isActionRepeating(action?: AnimationAction): boolean {
        return !!action && action.loop === LoopRepeat && action.repetitions > 1 && action.isRunning();
    }

    private getActionLoopCount(action: AnimationAction) {
        return (<any>action)._loopCount;
    }

    private crossFadeActions(fromAction: AnimationAction, toAction: AnimationAction, duration: number) {
        if (this.fadeOutDuration != undefined || this.fadeInDuration != undefined) {
            let fadeOutDuration = this.fadeOutDuration;
            if (fadeOutDuration == undefined) {
                fadeOutDuration = duration;
            }
            fromAction.fadeOut(fadeOutDuration);

            let fadeInDuration = this.fadeInDuration;
            if (fadeInDuration == undefined) {
                fadeInDuration = duration;
            }
            toAction.fadeIn(fadeInDuration);
        } else {
            fromAction.crossFadeTo(toAction, duration, this.warping);
        }
    }
}

