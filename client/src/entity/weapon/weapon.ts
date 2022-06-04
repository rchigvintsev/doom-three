import {AnimationAction, AnimationMixer, BufferGeometry, LoopOnce, Material, SkeletonHelper, SkinnedMesh} from 'three';

import {Entity} from '../entity';

export abstract class Weapon extends SkinnedMesh implements Entity {
    skeletonHelper?: SkeletonHelper;

    protected readonly animationActions = new Map<string, AnimationAction>();

    private animationMixer!: AnimationMixer;

    protected constructor(geometry: BufferGeometry, materials: Material | Material[]) {
        super(geometry, materials);
    }

    init() {
        this.animationMixer = new AnimationMixer(this);
        this.initAnimationActions(this.animationMixer);
    }

    update(deltaTime: number): void {
        this.animationMixer.update(deltaTime);
    }

    private initAnimationActions(animationMixer: AnimationMixer) {
        if (!this.animations) {
            return;
        }

        for (let i = 0; i < this.animations.length; i++) {
            const animation = this.animations[i];
            const action = animationMixer.clipAction(animation);
            if (animation.name !== 'idle') {
                action.setLoop(LoopOnce, 1);
            }
            this.animationActions.set(animation.name, action);
        }

        const idleAction = this.animationActions.get('idle');
        if (idleAction) {
            idleAction.play();
        }
    }
}
