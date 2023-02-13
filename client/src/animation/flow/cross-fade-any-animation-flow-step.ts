import {AnimationAction, LoopRepeat} from 'three';

import {AnimationFlow} from './animation-flow';
import {AnimationFlowStep} from './animation-flow-step';
import {AnimationUpdateHandler} from '../animation-update-handler';
import {Random} from '../../util/random';
import {ConditionalAnimationFlowStep} from './conditional-animation-flow-step';
import {RepeatableAnimationFlowStep} from './repeatable-animation-flow-step';

export class CrossFadeAnyAnimationFlowStep extends RepeatableAnimationFlowStep implements AnimationUpdateHandler {
    private delay?: number;
    private duration?: number;
    private fadeOutDuration?: number;
    private fadeInDuration?: number;
    private warping = false;
    private _clampWhenFinished = false;
    private onStartCallback?: (action: AnimationAction) => void;
    private started = false;
    private toAction?: AnimationAction;

    constructor(flow: AnimationFlow,
                private readonly fromStep: AnimationFlowStep,
                private readonly toActions: AnimationAction[],
                private readonly random = new Random()) {
        super(flow);
        if (toActions.length === 1) {
            this.toAction = toActions[0];
        }
    }

    get action(): AnimationAction {
        if (!this.toAction) {
            throw new Error('Animation flow step "cross fade any" is not started');
        }
        return this.toAction;
    }

    handle(_deltaTime: number) {
        if (this.started && this.delay != undefined) {
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
                this.toAction!.play();

                let duration = this.duration;
                if (duration == undefined) {
                    duration = fromClip.duration - fromAction.time;
                }

                this.crossFadeActions(fromAction, this.toAction!, duration);

                if (this.onStartCallback) {
                    this.onStartCallback(this.toAction!);
                }

                this.started = false;
            }
        }
    }

    start() {
        this.toActions.forEach(action => action.stop());
        if (this.toActions.length > 1) {
            this.toAction = this.toActions[Math.floor(this.random.sfc32() * this.toActions.length)];
        }
        this.setLoop(this.toAction!);
        this.toAction!.clampWhenFinished = this._clampWhenFinished;

        if (this.delay == undefined) {
            const fromAction = this.fromStep.action;
            this.toAction!.play();

            let duration = this.duration;
            if (duration == undefined) {
                duration = 1;
            }

            this.crossFadeActions(fromAction, this.toAction!, duration);

            if (this.onStartCallback) {
                this.onStartCallback(this.toAction!);
            }
        }

        this.started = true;
    }

    clone(flow: AnimationFlow): CrossFadeAnyAnimationFlowStep {
        const clone = flow.crossFadeAnyStep(undefined, ...this.toActions.map(action => action.getClip().name));
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

    clampWhenFinished(): this {
        this._clampWhenFinished = true;
        return this;
    }

    onStart(callback: (action: AnimationAction) => void): this {
        this.onStartCallback = callback;
        return this;
    }

    thenCrossFadeTo(actionName: string): CrossFadeAnyAnimationFlowStep {
        return this.flow.crossFadeStep(undefined, actionName);
    }

    thenCrossFadeToAny(...actionNames: string[]): CrossFadeAnyAnimationFlowStep {
        return this.flow.crossFadeAnyStep(undefined, ...actionNames);
    }

    thenIf(predicate: () => boolean, thenStep: AnimationFlowStep): ConditionalAnimationFlowStep {
        return this.flow.conditionalStep(predicate, thenStep);
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