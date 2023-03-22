import {AnimationAction} from 'three';

import {AnimationFlow} from './animation-flow';
import {AnimationFlowStep} from './animation-flow-step';
import {AlternateAnimationFlowStep} from './alternate-animation-flow-step';
import {Random} from '../../util/random';
import {CrossFadeAnyAnimationFlowStep} from './cross-fade-any-animation-flow-step';
import {ConditionalAnimationFlowStep} from './conditional-animation-flow-step';
import {AnimationFlowStepSupplier} from './animation-flow-step-supplier';
import {RepeatableAnimationFlowStep} from './repeatable-animation-flow-step';
import {AnimationUpdateHandler} from '../animation-update-handler';

export class AnyAnimationFlowStep extends RepeatableAnimationFlowStep implements AnimationUpdateHandler {
    protected _clampWhenFinished = false;
    protected _startAtTime = 0;
    protected onStartCallback?: (action: AnimationAction) => void;
    protected _action?: AnimationAction;

    private readonly onTimeCallbacks: OnTimeCallback[] = [];

    constructor(flow: AnimationFlow,
                protected readonly actions: AnimationAction[],
                private readonly stopBeforeStart = true,
                private readonly random = new Random()) {
        super(flow);
        if (actions.length === 1) {
            this._action = actions[0];
        }
    }

    get action(): AnimationAction {
        if (!this.started) {
            throw new Error('Animation flow step "any" is not started');
        }
        return this._action!;
    }

    handle(deltaTime: number) {
        if (this.started) {
            this.invokeOnTimeCallbacks(deltaTime);
        }
    }

    start() {
        if (this.stopBeforeStart) {
            this.actions.forEach(action => action.stop());
        }
        if (this.actions.length > 1) {
            this._action = this.actions[Math.floor(this.random.sfc32() * this.actions.length)];
        }
        this.setLoop(this._action!);
        this._action!.clampWhenFinished = this._clampWhenFinished;
        this._action!.time = this._startAtTime;
        this.doStart();
        this.started = true;
    }

    stop() {
        if (this.started) {
            this.doStop();
            this.started = false;
        }
    }

    clone(flow: AnimationFlow): AnyAnimationFlowStep {
        const clone = flow.anyStep(this.actions.map(action => action.getClip().name), this.stopBeforeStart);
        if (this.repetitionSupplier != undefined) {
            clone.repeat(this.repetitionSupplier);
        }
        if (this._clampWhenFinished) {
            clone.clampWhenFinished();
        }
        return clone;
    }

    clampWhenFinished(): this {
        this._clampWhenFinished = true;
        return this;
    }

    startAtTime(time: number): this {
        this._startAtTime = time;
        return this;
    }

    onStart(callback: (action: AnimationAction) => void): this {
        this.onStartCallback = callback;
        return this;
    }

    onTime(times: number[], callback: (time: number) => void, predicate?: (action: string) => boolean): this {
        this.onTimeCallbacks.push(new OnTimeCallback(times, callback, predicate));
        return this;
    }

    alternateWith(step: AnimationFlowStep): AlternateAnimationFlowStep {
        return this.flow.alternateStep(step);
    }

    thenCrossFadeTo(actionName: string): CrossFadeAnyAnimationFlowStep {
        return this.flow.crossFadeStep(undefined, actionName);
    }

    thenCrossFadeToAny(...actionNames: string[]): CrossFadeAnyAnimationFlowStep {
        return this.flow.crossFadeAnyStep(undefined, ...actionNames);
    }

    thenIf(predicate: () => boolean, thenStep: AnimationFlowStep | AnimationFlowStepSupplier): ConditionalAnimationFlowStep {
        return this.flow.conditionalStep(predicate, thenStep);
    }

    protected doStart() {
        this._action!.play();
        if (this.onStartCallback) {
            this.onStartCallback(this._action!);
        }
    }

    protected doStop() {
        this._action!.stop();
    }

    protected invokeOnTimeCallbacks(deltaTime: number) {
        if (!this._action!.isRunning()) {
            return;
        }

        const actionTime = this._action!.time;
        for (const callback of this.onTimeCallbacks) {
            if (callback.predicate && !callback.predicate(this._action!.getClip().name)) {
                continue;
            }

            if (callback.scheduled) {
                callback.callback(actionTime);
                callback.scheduled = false;
            }

            for (const time of callback.times) {
                if (time >= actionTime && time <= actionTime + deltaTime) {
                    callback.scheduled = true;
                }
            }
        }
    }
}

class OnTimeCallback {
    scheduled = false;

    constructor(readonly times: number[],
                readonly callback: (time: number) => void,
                readonly predicate?: (action: string) => boolean) {
    }
}