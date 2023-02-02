import {AbstractAnimationFlowStep} from './abstract-animation-flow-step';
import {AnimationFlow} from './animation-flow';
import {AnimationAction, LoopRepeat} from 'three';

export abstract class RepeatableAnimationFlowStep extends AbstractAnimationFlowStep {
    protected repetitionSupplier?: number | (() => number);

    constructor(flow: AnimationFlow) {
        super(flow);
    }

    repeat(repetitionSupplier: number | (() => number)): this {
        this.repetitionSupplier = repetitionSupplier;
        return this;
    }

    protected setLoop(action: AnimationAction) {
        if (this.repetitionSupplier) {
            let repetitions;
            if (typeof this.repetitionSupplier === 'number') {
                repetitions = this.repetitionSupplier;
            } else {
                repetitions = this.repetitionSupplier();
            }
            action.setLoop(LoopRepeat, repetitions);
        }
    }
}