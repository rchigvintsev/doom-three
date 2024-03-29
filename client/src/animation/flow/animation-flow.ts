import {FluentAnimationMixer} from '../fluent-animation-mixer';
import {AnimationFlowStep} from './animation-flow-step';
import {AnyAnimationFlowStep} from './any-animation-flow-step';
import {AlternateAnimationFlowStep} from './alternate-animation-flow-step';
import {ConditionalAnimationFlowStep} from './conditional-animation-flow-step';
import {CrossFadeAnyAnimationFlowStep} from './cross-fade-any-animation-flow-step';
import {AnimationFlowStepSupplier} from './animation-flow-step-supplier';
import {CurrentAnimationFlowStep} from './current-animation-flow-step';

export class AnimationFlow {
    private readonly steps: AnimationFlowStep[] = [];

    constructor(readonly mixer: FluentAnimationMixer) {
    }

    get length(): number {
        return this.steps.length;
    }

    get lastStep(): AnimationFlowStep | undefined {
        if (this.length > 0) {
            return this.stepAt(this.length - 1);
        }
    }

    stepAt(index: number): AnimationFlowStep | undefined {
        return this.steps[index];
    }

    start() {
        for (const step of this.steps) {
            step.start();
        }
    }

    stop() {
        for (const step of this.steps) {
            step.stop();
        }
    }

    singleStep(actionName: string, stopBeforeStart = true): AnyAnimationFlowStep {
        return this.anyStep([actionName], stopBeforeStart);
    }

    anyStep(actionNames: string[], stopBeforeStart = true): AnyAnimationFlowStep {
        const step = new AnyAnimationFlowStep(this, this.mixer.findActions(...actionNames), stopBeforeStart);
        this.steps.push(step);
        this.mixer.addUpdateHandler(step);
        return step;
    }

    currentStep(stopBeforeStart = true): CurrentAnimationFlowStep {
        const step = new CurrentAnimationFlowStep(this, stopBeforeStart);
        this.steps.push(step);
        return step;
    }

    alternateStep(...nextSteps: AnimationFlowStep[]): AlternateAnimationFlowStep {
        const prevStep = this.steps[this.steps.length - 1];
        const alternateStep = new AlternateAnimationFlowStep(this, [prevStep, ...nextSteps]);
        this.steps[this.steps.length - 1] = alternateStep;
        return alternateStep;
    }

    crossFadeStep(fromStep: AnimationFlowStep | undefined, toActionName: string): CrossFadeAnyAnimationFlowStep {
        return this.crossFadeAnyStep(fromStep, toActionName);
    }

    crossFadeAnyStep(fromStep: AnimationFlowStep | undefined, ...toActionNames: string[]): CrossFadeAnyAnimationFlowStep {
        if (!fromStep) {
            fromStep = this.steps[this.steps.length - 1];
        }
        const toActions = this.mixer.findActions(...toActionNames);
        const step = new CrossFadeAnyAnimationFlowStep(this, fromStep, toActions);
        this.steps.push(step);
        this.mixer.addUpdateHandler(step);
        return step;
    }

    conditionalStep(predicate: () => boolean,
                    thenStep: AnimationFlowStep | AnimationFlowStepSupplier): ConditionalAnimationFlowStep {
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