import {AnimationAction, Audio, Event, Material, Scene, SkeletonHelper, SkinnedMesh, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {PhysicsSystem} from '../../../physics/physics-system';
import {Weapon} from './weapon/weapon';
import {Md5ModelWireframeHelper} from './md5-model-wireframe-helper';
import {GameConfig} from '../../../game-config';
import {CustomAnimationMixer} from '../../../animation/custom-animation-mixer';
import {ModelParameters} from '../model-parameters';
import {MeshBasedEntity, updateMaterials} from '../../mesh-based-entity';

export class Md5Model extends SkinnedMesh implements MeshBasedEntity {
    skeletonHelper?: SkeletonHelper;

    protected animationMixer?: CustomAnimationMixer;

    private readonly sounds = new Map<string, Audio<AudioNode>[]>();
    private initialized = false;
    private _wireframeHelper?: Md5ModelWireframeHelper;

    constructor(protected readonly parameters: Md5ModelParameters) {
        super(parameters.geometry, parameters.materials);
        this.parameters = parameters;
        if (parameters.sounds) {
            parameters.sounds.forEach((value, key) => this.sounds.set(key, value));
        }
    }

    init() {
        if (!this.initialized) {
            this.doInit();
            this.initialized = true;
        }
    }

    registerCollisionModels(_physicsSystem: PhysicsSystem, _scene: Scene) {
        // Do nothing for now
    }

    unregisterCollisionModels(_physicsSystem: PhysicsSystem, _scene: Scene) {
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
            updateMaterials(this, deltaTime);
        }
    }

    onAttack(_hitPoint: Vector3, _forceVector: Vector3, _weapon: Weapon): void {
        // Do nothing by default
    }

    get config(): GameConfig {
        return this.parameters.config;
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

    protected doInit() {
        if (this.animations) {
            this.animationMixer = new CustomAnimationMixer(this);
            this.animationMixer.addEventListener('finished', e => this.onAnimationFinished(e));
        }
        if (this._wireframeHelper) {
            this._wireframeHelper.init();
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

    protected findMaterialByName(name: string): Material | undefined {
        if (Array.isArray(this.material)) {
            for (const material of this.material) {
                if (material.name === name) {
                    return material;
                }
            }
        } else if (this.material.name === name) {
            return this.material;
        }
        return undefined;
    }
}

export class Md5ModelParameters extends ModelParameters {
    sounds?: Map<string, Audio<AudioNode>[]>;
}