import {AnimationFlowStep} from './animation-flow-step';
import {FluentAnimationMixer} from '../fluent-animation-mixer';

export interface AnimationFlowStepSupplier {
    (previousStep: AnimationFlowStep, animationMixer?: FluentAnimationMixer): AnimationFlowStep;
}
