import {
    AnimationAction,
    AnimationMixer,
    Audio,
    BufferGeometry,
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
import {Md5ModelWireframeHelper} from './md5-model-wireframe-helper';
import {Animations} from '../../util/animations';

export class Md5Model extends SkinnedMesh implements Entity {
    skeletonHelper?: SkeletonHelper;

    private readonly sounds = new Map<string, Audio<AudioNode>[]>();
    private readonly animationActions = new Map<string, AnimationAction>();

    private animationMixer?: AnimationMixer;
    private initialized = false;

    private _wireframeHelper?: Md5ModelWireframeHelper;

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
            if (this._wireframeHelper) {
                this._wireframeHelper.init();
            }
            this.initialized = true;
        }
    }

    registerCollisionModels(_physicsWorld: PhysicsWorld, _scene: Scene) {
        // Do nothing for now
    }

    update(deltaTime: number) {
        if (this.animationMixer) {
            this.animationMixer.update(deltaTime);
        }
        if (this._wireframeHelper) {
            this._wireframeHelper.update(deltaTime);
        }
    }

    onAttack(_hitPoint: Vector3, _forceVector: Vector3, _weapon: Weapon): void {
        // Do nothing by default
    }

    get wireframeHelper(): Md5ModelWireframeHelper | undefined {
        return this._wireframeHelper;
    }

    set wireframeHelper(helper: Md5ModelWireframeHelper | undefined) {
        this._wireframeHelper = helper;
        if (helper) {
            this.add(helper);
        }
    }

    animateCrossFadeTo(startActionName: string, endActionName: string, duration: number) {
        const startAction = this.getRequiredAnimationAction(startActionName);
        const endAction = this.getRequiredAnimationAction(endActionName);

        startAction.play();
        endAction.reset().play();
        startAction.crossFadeTo(endAction, duration, false);

        if (this._wireframeHelper) {
            this._wireframeHelper.animateCrossFadeTo(startActionName, endActionName, duration);
        }
    }

    animateFadeOutFadeIn(fadeOutActionName: string,
                         fadeOutActionDuration: number,
                         fadeInActionName: string,
                         fadeInActionDuration: number) {
        const fadeOutAction = this.getRequiredAnimationAction(fadeOutActionName);
        const fadeInAction = this.getRequiredAnimationAction(fadeInActionName);

        fadeOutAction.stop().reset().fadeOut(fadeOutActionDuration).play();
        fadeInAction.stop().reset().fadeIn(fadeInActionDuration).play();

        if (this._wireframeHelper) {
            this._wireframeHelper.animateFadeOutFadeIn(fadeOutActionName, fadeOutActionDuration,
                fadeInActionName, fadeInActionDuration);
        }
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
        Animations.createAnimationActions(animationMixer, this.animations)
            .forEach((action, name) => this.animationActions.set(name, action));
    }
}