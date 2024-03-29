import {AnimationAction, Material, SkeletonHelper, SkinnedMesh} from 'three';

import {MeshBasedEntity, updateMaterials} from '../../mesh-based-entity';
import {Md5ModelWireframeHelper} from './md5-model-wireframe-helper';
import {GameConfig} from '../../../game-config';
import {FluentAnimationMixer} from '../../../animation/fluent-animation-mixer';
import {ModelParameters} from '../model-parameters';
import {AnyAnimationFlowStep} from '../../../animation/flow/any-animation-flow-step';
import {AnimationFlow} from '../../../animation/flow/animation-flow';
import {ConditionalAnimationFlowStep} from '../../../animation/flow/conditional-animation-flow-step';
import {AnimationFlowStep} from '../../../animation/flow/animation-flow-step';
import {CrossFadeAnyAnimationFlowStep} from '../../../animation/flow/cross-fade-any-animation-flow-step';
import {CurrentAnimationFlowStep} from '../../../animation/flow/current-animation-flow-step';
import {Sound} from '../../sound/sound';

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

    protected animate(actionName: string, stopBeforeStart = true): AnyAnimationFlowStep {
        return this.animationMixer.animate(actionName, stopBeforeStart);
    }

    protected animateAny(...actionNames: string[]): AnyAnimationFlowStep {
        return this.animationMixer.animateAny(...actionNames);
    }

    protected animateCurrent(stopBeforeStart = false): CurrentAnimationFlowStep {
        return this.animationMixer.animateCurrent(stopBeforeStart);
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
            this.wireframeHelper.addAnimationFlow(name, flow);
        }
    }

    protected startAnimationFlow(name: string) {
        this.animationFlows.get(name)?.start();
        if (this.wireframeHelper) {
            this.wireframeHelper.startAnimationFlow(name);
        }
    }

    protected stopAnimationFlow(name: string) {
        this.animationFlows.get(name)?.stop();
        if (this.wireframeHelper) {
            this.wireframeHelper.stopAnimationFlow(name);
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

    protected stopAnimations(...animationNames: string[]) {
        const actions = this.animationMixer.findActions(...animationNames);
        for (const action of actions) {
            action.stop();
        }
    }

    protected stopAllAnimations() {
        this.animationMixer.stopAllAction();
    }

    protected get runningAction(): AnimationAction | undefined {
        return this.animationMixer.getRunningAction();
    }

    protected playSound(soundName: string, delay?: number): Sound | undefined  {
        const sound = this.parameters.sounds.get(soundName);
        if (sound) {
            sound.play(delay);
        }
        return sound;
    }

    protected playSingleSound(soundName: string, delay?: number): Sound | undefined {
        const sound = this.parameters.sounds.get(soundName);
        if (sound && !sound.isPlaying()) {
            sound.play(delay);
        }
        return sound;
    }

    protected stopSounds(...soundNames: string[]) {
        for (const soundName of soundNames) {
            this.parameters.sounds.get(soundName)?.stop();
        }
    }

    protected stopAllSounds() {
        this.parameters.sounds.forEach(sound => sound.stop());
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
}

export interface Md5ModelParameters extends ModelParameters {
    sounds: Map<string, Sound>;
}

export class Md5ModelState {
    static readonly INACTIVE = 'inactive';
}
