import {Audio, Material, Mesh, SkeletonHelper, SkinnedMesh, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {MeshBasedEntity, updateMaterials} from '../../mesh-based-entity';
import {Md5ModelWireframeHelper} from './md5-model-wireframe-helper';
import {GameConfig} from '../../../game-config';
import {FluentAnimationMixer} from '../../../animation/fluent-animation-mixer';
import {ModelParameters} from '../model-parameters';
import {SoundSystem} from '../../../sound/sound-system';
import {MaterialKind} from '../../../material/material-kind';
import {isUpdatableMaterial} from '../../../material/updatable-material';
import {AnyAnimationFlowStep} from '../../../animation/flow/any-animation-flow-step';
import {AnimationFlow} from '../../../animation/flow/animation-flow';
import {ConditionalAnimationFlowStep} from '../../../animation/flow/conditional-animation-flow-step';
import {AnimationFlowStep} from '../../../animation/flow/animation-flow-step';
import {CrossFadeAnyAnimationFlowStep} from '../../../animation/flow/cross-fade-any-animation-flow-step';
import {CurrentAnimationFlowStep} from '../../../animation/flow/current-animation-flow-step';

export class Md5Model extends SkinnedMesh implements MeshBasedEntity {
    skeletonHelper?: SkeletonHelper;

    protected animationMixer!: FluentAnimationMixer;
    protected previousState?: string;
    protected currentState: string = Md5ModelState.INACTIVE;

    private initialized = false;
    private _wireframeHelper?: Md5ModelWireframeHelper;

    private readonly animationFlows = new Map<string, AnimationFlow>();

    constructor(protected readonly parameters: Md5ModelParameters) {
        super(parameters.geometry, parameters.materials);
    }

    init() {
        if (!this.initialized) {
            this.doInit();
            this.initialized = true;
        }
    }

    update(deltaTime: number) {
        this.animationMixer.update(deltaTime);
        if (this._wireframeHelper) {
            this._wireframeHelper.update(deltaTime);
        }
        if (!this.config.renderOnlyWireframe) {
            updateMaterials(this, deltaTime);
        }
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

    protected animate(actionName: string, resetOnStart = true): AnyAnimationFlowStep {
        return this.animationMixer.animate(actionName, resetOnStart);
    }

    protected animateAny(...actionNames: string[]): AnyAnimationFlowStep {
        return this.animationMixer.animateAny(...actionNames);
    }

    protected animateCurrent(resetOnStart = false): CurrentAnimationFlowStep {
        return this.animationMixer.animateCurrent(resetOnStart);
    }

    protected animateIf(predicate: () => boolean, actionName: string): ConditionalAnimationFlowStep {
        return this.animationMixer.animateIf(predicate, actionName);
    }

    protected animateCrossFade(previousStep: AnimationFlowStep,
                               actionName: string,
                               animationMixer?: FluentAnimationMixer): CrossFadeAnyAnimationFlowStep {
        return (animationMixer || this.animationMixer).animateCrossFade(previousStep, actionName);
    }

    protected doInit() {
        this.animationMixer = new FluentAnimationMixer(this);
        if (this._wireframeHelper) {
            this._wireframeHelper.init();
        }
    }

    protected addAnimationFlow(name: string, flow: AnimationFlow) {
        this.animationFlows.set(name, flow);
        if (this.wireframeHelper) {
            this.wireframeHelper.addAnimation(name, flow);
        }
    }

    protected startAnimationFlow(name: string) {
        this.animationFlows.get(name)?.start();
        if (this.wireframeHelper) {
            this.wireframeHelper.playAnimation(name);
        }
    }

    protected isAnyAnimationRunning(...animationNames: string[]): boolean {
        const actions = this.animationMixer.findActions(...animationNames);
        for (const action of actions) {
            if (action.isRunning()) {
                return true;
            }
        }
        return false;
    }

    protected stopAllAnimations(...animationNames: string[]) {
        const actions = this.animationMixer.findActions(...animationNames);
        for (const action of actions) {
            action.stop().reset();
        }
    }

    protected playImpactSound(soundPosition: Vector3, target: Mesh): Audio<AudioNode> {
        const targetMaterial = Array.isArray(target.material) ? target.material[0] : target.material;
        let materialKind = MaterialKind.METAL;
        if (isUpdatableMaterial(targetMaterial)) {
            materialKind = targetMaterial.kind;
        }

        let soundAlias;
        if (materialKind === MaterialKind.METAL) {
            soundAlias = 'impact_metal';
        } else if (materialKind === MaterialKind.CARDBOARD) {
            soundAlias = 'impact_cardboard';
        } else {
            throw new Error('Unsupported material type: ' + materialKind);
        }

        const sound = this.createSound(soundAlias);
        sound.position.copy(soundPosition);
        target.add(sound);
        sound.play();
        return sound;
    }

    protected playSound(soundName: string, delay?: number, onEnded?: () => void): Audio<AudioNode>  {
        const sound = this.createSound(soundName);
        sound.onEnded = () => {
            sound.isPlaying = false;
            if (onEnded) {
                onEnded();
            }
        };
        sound.play(delay);
        return sound;
    }

    protected playSoundOnce(soundName: string, delay?: number, onEnded?: () => void): Audio<AudioNode> {
        let sound: Audio<AudioNode>;
        const sounds = this.findSounds(soundName);
        if (sounds.length > 0) {
            for (const sound of sounds) {
                if (sound.isPlaying) {
                    return sound;
                }
            }
            sound = sounds[randomInt(0, sounds.length)];
        } else {
            sound = this.createSound(soundName);
        }

        sound.onEnded = () => {
            sound.isPlaying = false;
            if (onEnded) {
                onEnded();
            }
        };
        sound.play(delay);
        return sound;
    }

    protected stopAllSounds(...soundNames: string[]) {
        for (const sound of this.findSounds(...soundNames)) {
            if (sound.isPlaying) {
                sound.stop();
            }
        }
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

    protected changeState(newState: string) {
        this.previousState = this.currentState;
        this.currentState = newState;
    }

    private findSounds(...soundAliases: string[]): Audio<AudioNode>[] {
        const soundNames = soundAliases.map(alias => this.soundNameForAlias(alias));
        return this.parameters.soundSystem.findSounds(...soundNames);
    }

    private createSound(soundAlias: string): Audio<AudioNode> {
        return this.parameters.soundSystem.createSound(this.soundNameForAlias(soundAlias));
    }

    private soundNameForAlias(soundAlias: string): string {
        const soundName = this.parameters.sounds.get(soundAlias);
        if (!soundName) {
            throw new Error(`Sound "${soundAlias}" is not found for MD5 model "${this.name}"`);
        }
        return soundName;
    }
}

export interface Md5ModelParameters extends ModelParameters {
    sounds: Map<string, string>;
    soundSystem: SoundSystem;
}

export class Md5ModelState {
    static readonly INACTIVE = 'inactive';
}
