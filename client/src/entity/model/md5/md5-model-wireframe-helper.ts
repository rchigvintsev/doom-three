import {BufferGeometry, MeshBasicMaterial, SkinnedMesh} from 'three';

import {FluentAnimationMixer} from '../../../animation/fluent-animation-mixer';
import {AnimationFlow} from '../../../animation/flow/animation-flow';

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

    addAnimation(name: string, flow: AnimationFlow) {
        this.animationFlows.set(name, flow.clone(this.animationMixer));
    }

    playAnimation(name: string) {
        this.animationFlows.get(name)?.start();
    }

    update(deltaTime: number) {
        this.animationMixer.update(deltaTime);
    }
}