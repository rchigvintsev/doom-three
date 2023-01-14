import {AnimationAction, AnimationMixer} from 'three';
import {Object3D} from 'three/src/core/Object3D';

import {Animations} from '../util/animations';
import {AnimationFlow} from './flow/animation-flow';
import {AnyAnimationFlowStep} from './flow/any-animation-flow-step';
import {AnimationUpdateHandler} from './animation-update-handler';
import {ConditionalAnimationFlowStep} from './flow/conditional-animation-flow-step';

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

    animate(actionName: string): AnyAnimationFlowStep {
        return new AnimationFlow(this).singleStep(actionName);
    }

    animateAny(...actionNames: string[]): AnyAnimationFlowStep {
        return new AnimationFlow(this).anyStep(...actionNames);
    }

    animateIf(predicate: () => boolean, thenActionName: string): ConditionalAnimationFlowStep {
        return new AnimationFlow(this).conditionalStep(predicate, this.animate(thenActionName));
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

    private initAnimationActions(root: Object3D) {
        Animations.createAnimationActions(this, root.animations)
            .forEach((action, name) => this.animationActions.set(name, action));
    }
}
