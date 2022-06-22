import {
    AnimationAction,
    AnimationMixer,
    Audio,
    BufferGeometry,
    LoopOnce,
    Material,
    Scene,
    SkeletonHelper,
    SkinnedMesh,
    Vector3
} from 'three';

import {randomInt} from 'mathjs';

import {Entity} from '../entity';
import {PhysicsWorld} from '../../physics/physics-world';
import {Weapon} from './weapon/weapon';

export class Md5Model extends SkinnedMesh implements Entity {
    skeletonHelper?: SkeletonHelper;

    private readonly sounds = new Map<string, Audio<AudioNode>[]>();
    private readonly animationActions = new Map<string, AnimationAction>();

    private animationMixer?: AnimationMixer;
    private _wireframeModel?: Md5Model;

    private initialized = false;

    constructor(geometry: BufferGeometry,
                materials: Material | Material[],
                sounds: Map<string, Audio<AudioNode>[]>) {
        super(geometry, materials);
        if (sounds) {
            sounds.forEach((value, key) => this.sounds.set(key, value));
        }
    }

    init() {
        if (!this.initialized) {
            if (this.animations) {
                this.animationMixer = new AnimationMixer(this);
                this.initAnimationActions(this.animationMixer);
            }
            if (this._wireframeModel) {
                this._wireframeModel.init();
            }
            this.initialized = true;
        }
    }

    clone(recursive?: boolean): this {
        const clone = super.clone(recursive);
        if (this.sounds) {
            this.sounds.forEach((value, key) => clone.sounds.set(key, value));
        }
        if (this.animations) {
            clone.animations = this.animations.map(animation => animation.clone());
        }
        this.animationActions.forEach((value, key) => clone.animationActions.set(key, value));
        clone.animationMixer = this.animationMixer;
        if (this.skeletonHelper) {
            clone.skeletonHelper = this.skeletonHelper;
        }
        if (this._wireframeModel) {
            clone.wireframeModel = this._wireframeModel;
        }
        clone.initialized = this.initialized;
        return clone;
    }

    registerCollisionModels(_physicsWorld: PhysicsWorld, _scene: Scene) {
        // Do nothing for now
    }

    update(deltaTime: number) {
        if (this.animationMixer) {
            this.animationMixer.update(deltaTime);
        }
        if (this._wireframeModel) {
            this._wireframeModel.update(deltaTime);
        }
    }

    onHit(_hitPoint: Vector3, _weapon: Weapon): void {
        // Do nothing
    }

    set wireframeModel(wireframeModel: Md5Model) {
        this._wireframeModel = wireframeModel;
        this.add(wireframeModel);
    }

    protected playFirstSound(soundName: string, delay?: number) {
        const sounds = this.getRequiredSounds(soundName);
        if (sounds && sounds.length > 0) {
            const sound = sounds[0];
            if (!sound.isPlaying) {
                sound.play(delay);
            }
        }
    }

    protected playRandomSound(soundName: string, delay?: number) {
        const sounds = this.getRequiredSounds(soundName);
        if (sounds) {
            const sound = sounds[randomInt(0, sounds.length)];
            if (!sound.isPlaying) {
                sound.play(delay);
            }
        }
    }

    protected executeActionCrossFade(startActionName: string, endActionName: string, duration: number) {
        const startAction = this.getRequiredAnimationAction(startActionName);
        const endAction = this.getRequiredAnimationAction(endActionName);

        startAction.reset().play();
        endAction.enabled = true;
        endAction.reset().play();
        startAction.crossFadeTo(endAction, duration, false);

        if (this._wireframeModel) {
            this._wireframeModel.executeActionCrossFade(startActionName, endActionName, duration);
        }
    }

    protected getRequiredSounds(soundName: string): Audio<AudioNode>[] {
        const sounds = this.sounds.get(soundName);
        if (!sounds) {
            throw new Error(`Sounds "${soundName}" are not found in MD5 model "${this.name}"`);
        }
        return sounds;
    }

    protected getRequiredAnimationAction(actionName: string): AnimationAction {
        const action = this.getAnimationAction(actionName);
        if (!action) {
            throw new Error(`Animation action "${actionName}" is not found in MD5 model "${this.name}"`);
        }
        return action;
    }

    protected getAnimationAction(actionName: string): AnimationAction | undefined {
        return this.animationActions.get(actionName);
    }

    private initAnimationActions(animationMixer: AnimationMixer) {
        for (let i = 0; i < this.animations.length; i++) {
            const animation = this.animations[i];
            const action = animationMixer.clipAction(animation);
            if (animation.name !== 'idle') {
                action.setLoop(LoopOnce, 1);
            }
            this.animationActions.set(animation.name, action);
        }
    }
}