import {BufferGeometry, MeshBasicMaterial, SkinnedMesh} from 'three';

import {FluentAnimationMixer} from '../../../animation/fluent-animation-mixer';
import {AnimationFlow} from '../../../animation/flow/animation-flow';
import {AnimationFlowStep} from '../../../animation/flow/animation-flow-step';

export class Md5ModelWireframeHelper extends SkinnedMesh {
    private animationMixer!: FluentAnimationMixer;
    private initialized = false;
    private readonly animationFlows = new Map<string, AnimationFlow>();

    constructor(geometry: BufferGeometry) {
        super(geometry, new MeshBasicMaterial({wireframe: true}));
    }

    init() {
        if (!this.initialized) {
            this.animationMixer = new FluentAnimationMixer(this);
            this.initialized = true;
        }
    }

    addAnimationFlow(name: string, flow: AnimationFlow) {
        this.animationFlows.set(name, flow.clone(this.animationMixer));
    }

    startAnimationFlow(name: string) {
        this.animationFlows.get(name)?.start();
    }

    animate(name: string): AnimationFlowStep {
        return this.animationMixer.animate(name);
    }

    update(deltaTime: number) {
        this.animationMixer.update(deltaTime);
    }
}