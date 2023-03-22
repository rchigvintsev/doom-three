import {AnimationAction} from 'three';

import {AnimationFlow} from './animation-flow';
import {AnimationFlowStep} from './animation-flow-step';

export abstract class AbstractAnimationFlowStep implements AnimationFlowStep {
    readonly animationFlowStep = true;

    private _started = false;

    constructor(readonly flow: AnimationFlow) {
    }

    get action(): AnimationAction {
        throw new Error('Unsupported operation');
    }

    abstract start(): void;

    abstract stop(): void;

    get started(): boolean {
        return this._started;
    }

    set started(started: boolean) {
        this._started = started;
    }

    abstract clone(flow: AnimationFlow): AnimationFlowStep;
}