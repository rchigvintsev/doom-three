import {Mesh} from 'three';

import {Weapon, WeaponState} from './weapon';
import {AttackEvent} from '../../../../event/weapon-events';
import {Md5ModelParameters} from '../md5-model';

const PUNCH_FORCE = 30;
const ATTACK_DISTANCE = 30;

export class Fists extends Weapon {
    private readonly attackDistance: number;

    constructor(parameters: Md5ModelParameters) {
        super(parameters);
        this.attackDistance = ATTACK_DISTANCE * this.config.worldScale;
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.startAnimationFlow('enable');
            this.changeState(FistsState.RAISING);
            // Weapon visibility will be changed on next rendering step
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.startAnimationFlow('disable');
            this.changeState(FistsState.LOWERING);
            // Weapon visibility will be changed on "lower" animation finish
        }
    }

    attack() {
        if (this.canAttack()) {
            this.startAnimationFlow('attack');
            this.changeState(FistsState.PUNCHING);
            this.dispatchEvent(new AttackEvent(this, this.attackDistance, PUNCH_FORCE));
        }
    }

    onHit(_target: Mesh) {
        this.playSound('impact');
    }

    onMiss() {
        this.playWooshSound();
    }

    protected doInit() {
        super.doInit();
        this.initAnimationFlows();
    }

    protected updateState() {
        super.updateState();
        if (this.currentState === FistsState.PUNCHING
            && !this.isAnyAnimationRunning('berserk_punch1', 'berserk_punch2', 'berserk_punch3', 'berserk_punch4')) {
            this.changeState(FistsState.IDLE);
        }
    }

    private initAnimationFlows() {
        this.addAnimationFlow('enable', this.animate('raise')
            .onStart(() => this.playRaiseSound())
            .thenCrossFadeTo('idle')
            .withDuration(0.4).flow);
        this.addAnimationFlow('disable', this.animate('idle').thenCrossFadeTo('lower').withDuration(0.25).flow);
        this.addAnimationFlow('attack', this.animateAny('berserk_punch2', 'berserk_punch4')
            .alternateWith(this.animateAny('berserk_punch1', 'berserk_punch3'))
            .thenCrossFadeTo('idle').withFadeOutDuration(0.625).withFadeInDuration(1.875).flow);
    }

    private canAttack() {
        return this.currentState === FistsState.IDLE;
    }

    private playRaiseSound() {
        this.playSound('raise', 0.1);
    }

    private playWooshSound() {
        this.playSound('woosh', 0.1);
    }
}

export class FistsState extends WeaponState {
    static readonly PUNCHING = 'punching';
}
