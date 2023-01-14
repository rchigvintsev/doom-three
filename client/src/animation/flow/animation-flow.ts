import {FluentAnimationMixer} from '../fluent-animation-mixer';
import {AnimationFlowStep} from './animation-flow-step';
import {AnyAnimationFlowStep} from './any-animation-flow-step';
import {AlternateAnimationFlowStep} from './alternate-animation-flow-step';
import {ConditionalAnimationFlowStep} from './conditional-animation-flow-step';
import {CrossFadeAnyAnimationFlowStep} from './cross-fade-any-animation-flow-step';

export class AnimationFlow {
    private readonly steps: AnimationFlowStep[] = [];

    constructor(readonly mixer: FluentAnimationMixer) {
    }

    get lastStep(): AnimationFlowStep | undefined {
        if (this.steps.length > 0) {
            return this.steps[this.steps.length - 1];
        }
    }

    start() {
        for (const step of this.steps) {
            step.start();
        }
    }

    singleStep(actionName: string): AnyAnimationFlowStep {
        return this.anyStep(actionName);
    }

    anyStep(...actionNames: string[]): AnyAnimationFlowStep {
        const step = new AnyAnimationFlowStep(this, this.mixer.findActions(...actionNames));
        this.steps.push(step);
        return step;
    }

    alternateStep(...nextSteps: AnimationFlowStep[]): AlternateAnimationFlowStep {
        const prevStep = this.steps[this.steps.length - 1];
        const alternateStep = new AlternateAnimationFlowStep(this, [prevStep, ...nextSteps]);
        this.steps[this.steps.length - 1] = alternateStep;
        return alternateStep;
    }

    crossFadeStep(toActionName: string): CrossFadeAnyAnimationFlowStep {
        return this.crossFadeAnyStep(toActionName);
    }

    crossFadeAnyStep(...toActionNames: string[]): CrossFadeAnyAnimationFlowStep {
        const prevStep = this.steps[this.steps.length - 1];
        const toActions = this.mixer.findActions(...toActionNames);
        const step = new CrossFadeAnyAnimationFlowStep(this, prevStep, toActions);
        this.steps.push(step);
        this.mixer.addUpdateHandler(step);
        return step;
    }

    conditionalStep(predicate: () => boolean, thenStep: AnimationFlowStep): ConditionalAnimationFlowStep {
        const step = new ConditionalAnimationFlowStep(this, predicate, thenStep);
        this.steps.push(step);
        return step;
    }

    clone(mixer: FluentAnimationMixer): AnimationFlow {
        const clone = new AnimationFlow(mixer);
        for (const step of this.steps) {
            step.clone(clone);
        }
        return clone;
    }
}