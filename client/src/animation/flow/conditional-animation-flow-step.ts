import {AnimationAction} from 'three';

import {AbstractAnimationFlowStep} from './abstract-animation-flow-step';
import {AnimationFlow} from './animation-flow';
import {AnimationFlowStep} from './animation-flow-step';
import {CrossFadeAnyAnimationFlowStep} from './cross-fade-any-animation-flow-step';

export class ConditionalAnimationFlowStep extends AbstractAnimationFlowStep {
    private elseStep?: AnimationFlowStep;

    constructor(flow: AnimationFlow,
                private readonly predicate: () => boolean,
                private readonly thenStep: AnimationFlowStep) {
        super(flow);
    }

    get action(): AnimationAction {
        if (this.predicate()) {
            return this.thenStep.action;
        }
        if (this.elseStep) {
            return this.elseStep.action;
        }
        throw new Error('Else step is not defined');
    }

    start() {
        if (this.predicate()) {
            this.thenStep.flow.start();
        } else if (this.elseStep) {
            this.elseStep.flow.start();
        }
    }

    clone(flow: AnimationFlow): AnimationFlowStep {
        const clone = flow.conditionalStep(this.predicate, this.thenStep.flow.clone(flow.mixer).lastStep!);
        if (this.elseStep) {
            clone.else(this.elseStep.flow.clone(flow.mixer).lastStep!);
        }
        return clone;
    }

    else(elseStep: AnimationFlowStep): ConditionalAnimationFlowStep {
        this.elseStep = elseStep;
        return this;
    }

    thenCrossFadeTo(actionName: string): CrossFadeAnyAnimationFlowStep {
        return this.flow.crossFadeStep(actionName);
    }
}