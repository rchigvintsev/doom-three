import {AnimationAction, AnimationMixer} from 'three';
import {Object3D} from 'three/src/core/Object3D';

import {Animations} from '../util/animations';
import {AnimationFlow} from './flow/animation-flow';
import {AnyAnimationFlowStep} from './flow/any-animation-flow-step';
import {AnimationUpdateHandler} from './animation-update-handler';
import {ConditionalAnimationFlowStep} from './flow/conditional-animation-flow-step';
import {AnimationFlowStep} from './flow/animation-flow-step';
import {CrossFadeAnyAnimationFlowStep} from './flow/cross-fade-any-animation-flow-step';
import {CurrentAnimationFlowStep} from './flow/current-animation-flow-step';

export class FluentAnimationMixer extends AnimationMixer {
    private readonly animationActions = new Map<string, AnimationAction>();
    private readonly updateHandlers: AnimationUpdateHandler[] = [];

    constructor(root: Object3D) {
        super(root);
        this.initAnimationActions(root);
    }

    addUpdateHandler(handler: AnimationUpdateHandler) {
        this.updateHandlers.push(handler);
    }

    update(deltaTime: number): AnimationMixer {
        super.update(deltaTime);
        for (const handler of this.updateHandlers) {
            handler.handle(deltaTime);
        }
        return this;
    }

    animate(actionName: string, resetOnStart = true): AnyAnimationFlowStep {
        return new AnimationFlow(this).singleStep(actionName, resetOnStart);
    }

    animateAny(...actionNames: string[]): AnyAnimationFlowStep {
        return new AnimationFlow(this).anyStep(actionNames);
    }

    animateCurrent(resetOnStart = true): CurrentAnimationFlowStep {
        return new AnimationFlow(this).currentStep(resetOnStart);
    }

    animateIf(predicate: () => boolean, thenActionName: string): ConditionalAnimationFlowStep {
        return new AnimationFlow(this).conditionalStep(predicate, this.animate(thenActionName));
    }

    animateCrossFade(fromStep: AnimationFlowStep, toActionName: string): CrossFadeAnyAnimationFlowStep {
        return new AnimationFlow(this).crossFadeStep(fromStep, toActionName);
    }

    findActions(...actionNames: string[]): AnimationAction[] {
        const actions = [];
        for (const actionName of actionNames) {
            actions.push(this.findAction(actionName));
        }
        return actions;
    }

    findAction(actionName: string): AnimationAction {
        const action = this.animationActions.get(actionName);
        if (!action) {
            throw new Error(`Animation action "${actionName}" is not found`);
        }
        return action;
    }

    getRunningAction(): AnimationAction | undefined {
        for (const action of this.animationActions.values()) {
            if (action.isRunning()) {
                return action;
            }
        }
    }

    private initAnimationActions(root: Object3D) {
        Animations.createAnimationActions(this, root.animations)
            .forEach((action, name) => this.animationActions.set(name, action));
    }
}
