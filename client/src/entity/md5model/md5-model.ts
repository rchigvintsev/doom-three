import {
    AnimationAction,
    Audio,
    BufferGeometry,
    Event,
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
import {isUpdatableMaterial} from '../../material/updatable-material';
import {GameConfig} from '../../game-config';
import {CustomAnimationMixer} from '../../animation/custom-animation-mixer';

export class Md5Model extends SkinnedMesh implements Entity {
    skeletonHelper?: SkeletonHelper;

    private readonly sounds = new Map<string, Audio<AudioNode>[]>();

    protected animationMixer?: CustomAnimationMixer;
    private initialized = false;

    private _wireframeHelper?: Md5ModelWireframeHelper;

    constructor(protected config: GameConfig,
                geometry: BufferGeometry,
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
                this.animationMixer = new CustomAnimationMixer(this);
                this.animationMixer.addEventListener('finished', e => this.onAnimationFinished(e));
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
        if (!this.config.renderOnlyWireframe) {
            this.updateMaterials(deltaTime);
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

    animateCrossFade(startActionName: string, endActionName: string, duration = 1) {
        if (this.animationMixer) {
            this.animationMixer.crossFade(startActionName, endActionName, duration);
            if (this._wireframeHelper) {
                this._wireframeHelper.animateCrossFade(startActionName, endActionName, duration);
            }
        }
    }

    animateCrossFadeAsync(startActionName: string,
                          endActionName: string,
                          fadeOutDuration: number,
                          fadeInDuration: number) {
        if (this.animationMixer) {
            this.animationMixer.crossFadeAsync(startActionName, endActionName, fadeOutDuration, fadeInDuration);
            if (this._wireframeHelper) {
                this._wireframeHelper.animateCrossFadeAsync(startActionName, endActionName, fadeOutDuration,
                    fadeInDuration);
            }
        }
    }

    animateCrossFadeDelayed(startActionName: string, endActionName: string, delay: number, duration?: number) {
        if (this.animationMixer) {
            this.animationMixer.crossFadeDelayed(startActionName, endActionName, delay, duration);
            if (this._wireframeHelper) {
                this._wireframeHelper.animateCrossFadeDelayed(startActionName, endActionName, delay, duration);
            }
        }
    }

    protected playFirstSound(soundName: string, delay?: number) {
        const sounds = this.getRequiredSounds(soundName);
        if (sounds && sounds.length > 0) {
            const sound = sounds[0];
            if (!sound.isPlaying) {
                sound.play(delay);
            } else {
                sound.stop().play(delay);
            }
        }
    }

    protected playRandomSound(soundName: string, delay?: number) {
        const sounds = this.getRequiredSounds(soundName);
        if (sounds) {
            const sound = sounds[randomInt(0, sounds.length)];
            if (!sound.isPlaying) {
                sound.play(delay);
            } else {
                sound.stop().play(delay);
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

    protected getAnimationAction(actionName: string): AnimationAction | undefined {
        if (this.animationMixer) {
            return this.animationMixer.getAnimationAction(actionName);
        }
    }

    protected onAnimationFinished(_e: Event) {
        // Do nothing by default
    }

    private updateMaterials(deltaTime: number) {
        if (Array.isArray(this.material)) {
            for (const material of this.material) {
                if (isUpdatableMaterial(material)) {
                    material.update(deltaTime);
                }
            }
        } else if (isUpdatableMaterial(this.material)) {
            this.material.update(deltaTime);
        }
    }
}