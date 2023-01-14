import {AnimationAction} from 'three';

import {AnimationFlow} from './animation-flow';

export interface AnimationFlowStep {
    get flow(): AnimationFlow;

    get action(): AnimationAction;

    start(): void;

    clone(flow: AnimationFlow): AnimationFlowStep;
}