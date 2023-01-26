import {AnimationAction} from 'three';

import {AbstractAnimationFlowStep} from './abstract-animation-flow-step';
import {AnimationFlow} from './animation-flow';
import {AnimationFlowStep} from './animation-flow-step';
import {AlternateAnimationFlowStep} from './alternate-animation-flow-step';
import {Random} from '../../util/random';
import {CrossFadeAnyAnimationFlowStep} from './cross-fade-any-animation-flow-step';
import {ConditionalAnimationFlowStep} from './conditional-animation-flow-step';

export class AnyAnimationFlowStep extends AbstractAnimationFlowStep {
    private _action?: AnimationAction;
    private onStartCallback?: () => void;

    constructor(flow: AnimationFlow,
                private readonly actions: AnimationAction[],
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
        this.actions.forEach(action => action.stop().reset());
        if (this.actions.length > 1) {
            this._action = this.actions[Math.floor(this.random.sfc32() * this.actions.length)];
        }
        this._action!.play();
        if (this.onStartCallback) {
            this.onStartCallback();
        }
    }

    clone(flow: AnimationFlow): AnyAnimationFlowStep {
        return flow.anyStep(...this.actions.map(action => action.getClip().name));
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

    thenIf(predicate: () => boolean,
           thenStep: AnimationFlowStep | ((previousStep: AnimationFlowStep) => AnimationFlowStep)): ConditionalAnimationFlowStep {
        return this.flow.conditionalStep(predicate, thenStep);
    }
}