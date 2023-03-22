import {AnimationAction} from 'three';

import {AnimationFlow} from './animation-flow';

export interface AnimationFlowStep {
    get flow(): AnimationFlow;

    get action(): AnimationAction;

    start(): void;

    stop(): void;

    get started(): boolean;

    clone(flow: AnimationFlow): AnimationFlowStep;
}

export function isAnimationFlowStep(o: any): o is AnimationFlowStep {
    return o && o.animationFlowStep;
}