import {AnimationAction} from 'three';

import {AbstractAnimationFlowStep} from './abstract-animation-flow-step';
import {AnimationFlow} from './animation-flow';
import {AnimationFlowStep} from './animation-flow-step';
import {CrossFadeAnyAnimationFlowStep} from './cross-fade-any-animation-flow-step';

export class AlternateAnimationFlowStep extends AbstractAnimationFlowStep {
    private index?: number;

    constructor(flow: AnimationFlow, private readonly steps: AnimationFlowStep[]) {
        super(flow);
    }

    start() {
        if (this.index == undefined || this.index === this.steps.length - 1) {
            this.index = 0;
        } else {
            this.index++;
        }

        if (this.index === 0) {
            // First step always belongs to current flow
            this.steps[0].start();
        } else {
            this.steps[this.index].flow.start();
        }
    }

    get action(): AnimationAction {
        return this.steps[this.index || 0].action;
    }

    clone(flow: AnimationFlow): AlternateAnimationFlowStep {
        // Clone first step and add it to flow
        this.steps[0].clone(flow);

        // Clone other steps
        const clonedSteps = [];
        for (let i = 1; i < this.steps.length; i++) {
            clonedSteps.push(this.steps[i].flow.clone(flow.mixer).lastStep!);
        }

        // Create new alternate step which will replace last flow step
        return flow.alternateStep(...clonedSteps);
    }

    thenCrossFadeTo(actionName: string): CrossFadeAnyAnimationFlowStep {
        return this.flow.crossFadeStep(actionName);
    }
}