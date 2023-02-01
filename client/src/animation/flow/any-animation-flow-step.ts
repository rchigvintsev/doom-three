import {AnimationAction, LoopRepeat} from 'three';

import {AbstractAnimationFlowStep} from './abstract-animation-flow-step';
import {AnimationFlow} from './animation-flow';
import {AnimationFlowStep} from './animation-flow-step';
import {AlternateAnimationFlowStep} from './alternate-animation-flow-step';
import {Random} from '../../util/random';
import {CrossFadeAnyAnimationFlowStep} from './cross-fade-any-animation-flow-step';
import {ConditionalAnimationFlowStep} from './conditional-animation-flow-step';
import {AnimationFlowStepSupplier} from './animation-flow-step-supplier';

export class AnyAnimationFlowStep extends AbstractAnimationFlowStep {
    private _action?: AnimationAction;
    private repetitionSupplier?: number | (() => number);
    private onStartCallback?: () => void;

    constructor(flow: AnimationFlow,
                private readonly actions: AnimationAction[],
                private readonly resetOnStart = true,
                private readonly random = new Random()) {
        super(flow);
        if (actions.length === 1) {
            this._action = actions[0];
        }
    }

    get action(): AnimationAction {
        if (!this._action) {
            throw new Error('Animation flow step "any" is not started');
        }
        return this._action;
    }

    start() {
        if (this.resetOnStart) {
            this.actions.forEach(action => action.stop().reset());
        }
        if (this.actions.length > 1) {
            this._action = this.actions[Math.floor(this.random.sfc32() * this.actions.length)];
        }
        if (this.repetitionSupplier) {
            let repetitions;
            if (typeof this.repetitionSupplier === 'number') {
                repetitions = this.repetitionSupplier;
            } else {
                repetitions = this.repetitionSupplier();
            }
            this._action!.setLoop(LoopRepeat, repetitions);
        }
        this._action!.play();
        if (this.onStartCallback) {
            this.onStartCallback();
        }
    }

    clone(flow: AnimationFlow): AnyAnimationFlowStep {
        const clone = flow.anyStep(this.actions.map(action => action.getClip().name), this.resetOnStart);
        if (this.repetitionSupplier != undefined) {
            clone.repeat(this.repetitionSupplier);
        }
        return clone;
    }

    repeat(repetitionSupplier: number | (() => number)): this {
        this.repetitionSupplier = repetitionSupplier;
        return this;
    }

    onStart(callback: () => void): this {
        this.onStartCallback = callback;
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
}