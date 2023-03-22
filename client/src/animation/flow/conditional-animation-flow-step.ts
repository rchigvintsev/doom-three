import {AnimationAction} from 'three';

import {AbstractAnimationFlowStep} from './abstract-animation-flow-step';
import {AnimationFlow} from './animation-flow';
import {AnimationFlowStep, isAnimationFlowStep} from './animation-flow-step';
import {CrossFadeAnyAnimationFlowStep} from './cross-fade-any-animation-flow-step';
import {AnimationFlowStepSupplier} from './animation-flow-step-supplier';

export class ConditionalAnimationFlowStep extends AbstractAnimationFlowStep {
    private elseStep?: AnimationFlowStep | AnimationFlowStepSupplier;

    private _thenStep?: AnimationFlowStep;
    private _elseStep?: AnimationFlowStep;

    constructor(
        flow: AnimationFlow,
        private readonly predicate: () => boolean,
        private readonly thenStep: AnimationFlowStep | AnimationFlowStepSupplier
    ) {
        super(flow);
    }

    get action(): AnimationAction {
        if (!this.started) {
            throw new Error('Animation flow step "conditional" is not started');
        }

        if (this.predicate()) {
            return this.getThenStep().action;
        }
        const elseStep = this.getElseStep();
        if (elseStep) {
            return elseStep.action;
        }
        throw new Error('Else step is not defined');
    }

    start() {
        if (this.predicate()) {
            this.getThenStep().flow.start();
        } else {
            const elseStep = this.getElseStep();
            if (elseStep) {
                elseStep.flow.start();
            }
        }
        this.started = true;
    }

    stop() {
        if (this.started) {
            if (this.predicate()) {
                this.getThenStep().flow.stop();
            } else {
                const elseStep = this.getElseStep();
                if (elseStep) {
                    elseStep.flow.stop();
                }
            }
            this.started = false;
        }
    }

    clone(flow: AnimationFlow): AnimationFlowStep {
        const prevStep = flow.lastStep!;
        let thenStep;
        if (isAnimationFlowStep(this.thenStep)) {
            thenStep = this.thenStep.flow.clone(flow.mixer).lastStep!;
        } else {
            thenStep = this.thenStep(prevStep, flow.mixer);
        }
        const clone = flow.conditionalStep(this.predicate, thenStep);
        if (this.elseStep) {
            let elseStep;
            if (isAnimationFlowStep(this.elseStep)) {
                elseStep = this.elseStep.flow.clone(flow.mixer).lastStep!;
            } else {
                elseStep = this.elseStep(prevStep, flow.mixer);
            }
            clone.else(elseStep);
        }
        return clone;
    }

    else(elseStep: AnimationFlowStep | AnimationFlowStepSupplier): ConditionalAnimationFlowStep {
        this.elseStep = elseStep;
        return this;
    }

    thenCrossFadeTo(actionName: string): CrossFadeAnyAnimationFlowStep {
        return this.flow.crossFadeStep(undefined, actionName);
    }

    private getThenStep(): AnimationFlowStep {
        if (this._thenStep) {
            return this._thenStep;
        }

        if (isAnimationFlowStep(this.thenStep)) {
            this._thenStep = this.thenStep;
        } else {
            // Last step in flow must be this conditional step, but we need a step before it.
            const prevStep = this.flow.stepAt(this.flow.length - 2)!;
            this._thenStep = this.thenStep(prevStep);
        }
        return this._thenStep;
    }

    private getElseStep(): AnimationFlowStep | undefined {
        if (this._elseStep) {
            return this._elseStep;
        }

        if (this.elseStep) {
            if (isAnimationFlowStep(this.elseStep)) {
                this._elseStep = this.elseStep;
            } else {
                // Last step in flow must be this conditional step, but we need a step before it.
                const prevStep = this.flow.stepAt(this.flow.length - 2)!;
                this._elseStep = this.elseStep(prevStep);
            }
        }

        return this._elseStep;
    }
}