import {AnimationAction} from 'three';

import {AbstractAnimationFlowStep} from './abstract-animation-flow-step';
import {AnimationFlow} from './animation-flow';
import {AnimationFlowStep, isAnimationFlowStep} from './animation-flow-step';
import {CrossFadeAnyAnimationFlowStep} from './cross-fade-any-animation-flow-step';

export class ConditionalAnimationFlowStep extends AbstractAnimationFlowStep {
    private elseStepProvider?: AnimationFlowStep | ((previousStep: AnimationFlowStep) => AnimationFlowStep);

    private _thenStep?: AnimationFlowStep;
    private _elseStep?: AnimationFlowStep;

    constructor(flow: AnimationFlow,
                private readonly predicate: () => boolean,
                private readonly thenStepProvider: AnimationFlowStep | ((previousStep: AnimationFlowStep) => AnimationFlowStep)) {
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
        let thenStep;
        if (isAnimationFlowStep(this.thenStepProvider)) {
            thenStep = this.thenStepProvider.flow.clone(flow.mixer).lastStep!;
        } else {
            thenStep = this.thenStepProvider;
        }

        const clone = flow.conditionalStep(this.predicate, thenStep);

        let elseStep;
        if (isAnimationFlowStep(this.elseStepProvider)) {
            elseStep = this.elseStepProvider.flow.clone(flow.mixer).lastStep!;
        } else {
            elseStep = this.elseStepProvider;
        }
        if (elseStep) {
            clone.else(elseStep);
        }

        return clone;
    }

    else(elseStep: AnimationFlowStep | ((previousStep: AnimationFlowStep) => AnimationFlowStep)): ConditionalAnimationFlowStep {
        this.elseStepProvider = elseStep;
        return this;
    }

    thenCrossFadeTo(actionName: string): CrossFadeAnyAnimationFlowStep {
        return this.flow.crossFadeStep(undefined, actionName);
    }

    private get thenStep(): AnimationFlowStep {
        if (this._thenStep) {
            return this._thenStep;
        }

        if (isAnimationFlowStep(this.thenStepProvider)) {
            this._thenStep = this.thenStepProvider;
        } else {
            // Last step in flow must be this conditional step, but we need a step before it.
            const prevStep = this.flow.stepAt(this.flow.length - 2)!;
            this._thenStep = this.thenStepProvider(prevStep);
        }
        return this._thenStep;
    }

    private get elseStep(): AnimationFlowStep | undefined {
        if (this._elseStep) {
            return this._elseStep;
        }

        if (this.elseStepProvider) {
            if (isAnimationFlowStep(this.elseStepProvider)) {
                this._elseStep = this.elseStepProvider;
            } else {
                // Last step in flow must be this conditional step, but we need a step before it.
                const prevStep = this.flow.stepAt(this.flow.length - 2)!;
                this._elseStep = this.elseStepProvider(prevStep);
            }
        }

        return this._elseStep;
    }
}