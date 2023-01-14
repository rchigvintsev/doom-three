import {AnimationAction} from 'three';

import {AnimationFlow} from './animation-flow';
import {AnimationFlowStep} from './animation-flow-step';

export abstract class AbstractAnimationFlowStep implements AnimationFlowStep {
    constructor(readonly flow: AnimationFlow) {
    }

    get action(): AnimationAction {
        throw new Error('Unsupported operation');
    }

    abstract start(): void;

    abstract clone(flow: AnimationFlow): AnimationFlowStep;
}