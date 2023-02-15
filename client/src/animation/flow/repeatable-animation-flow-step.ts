import {AnimationAction, LoopRepeat} from 'three';

import {AbstractAnimationFlowStep} from './abstract-animation-flow-step';
import {AnimationFlow} from './animation-flow';

export abstract class RepeatableAnimationFlowStep extends AbstractAnimationFlowStep {
    protected repetitionSupplier?: number | (() => number);

    private onLoopCallback?: () => void;

    constructor(flow: AnimationFlow) {
        super(flow);
        flow.mixer.addEventListener('loop', event => {
            if (this.started && this.onLoopCallback && event.action === this.action) {
                this.onLoopCallback();
            }
        });
    }

    repeat(repetitionSupplier: number | (() => number)): this {
        this.repetitionSupplier = repetitionSupplier;
        return this;
    }

    onLoop(callback: () => void): this {
        this.onLoopCallback = callback;
        return this;
    }

    protected setLoop(action: AnimationAction) {
        const repetitions = this.getRepetitions();
        if (repetitions != undefined) {
            action.setLoop(LoopRepeat, repetitions);
        }
    }

    private getRepetitions(): number | undefined {
        if (this.repetitionSupplier) {
            let repetitions;
            if (typeof this.repetitionSupplier === 'number') {
                repetitions = this.repetitionSupplier;
            } else {
                repetitions = this.repetitionSupplier();
            }
            return repetitions;
        }
    }
}