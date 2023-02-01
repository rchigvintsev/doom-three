import {AnimationAction} from 'three';

import {AbstractAnimationFlowStep} from './abstract-animation-flow-step';
import {AnimationFlow} from './animation-flow';
import {CrossFadeAnyAnimationFlowStep} from './cross-fade-any-animation-flow-step';

export class CurrentAnimationFlowStep extends AbstractAnimationFlowStep {
    private _action?: AnimationAction;

    constructor(flow: AnimationFlow, private readonly resetOnStart = true) {
        super(flow);
    }

    get action(): AnimationAction {
        if (!this._action) {
            throw new Error('Animation flow step "current" is not started');
        }
        return this._action;
    }

    start() {
        this._action = this.flow.mixer.getRunningAction();
        if (!this._action) {
            console.error('Failed to start animation flow step "current": no running action found');
            return;
        }

        if (this.resetOnStart) {
            this._action.stop().reset();
        }
        this._action!.play();
    }

    clone(flow: AnimationFlow): CurrentAnimationFlowStep {
        return flow.currentStep(this.resetOnStart);
    }

    thenCrossFadeTo(actionName: string): CrossFadeAnyAnimationFlowStep {
        return this.flow.crossFadeStep(undefined, actionName);
    }
}