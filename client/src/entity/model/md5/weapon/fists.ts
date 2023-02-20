import {Mesh} from 'three';

import {Weapon, WeaponParameters, WeaponState} from './weapon';
import {AttackEvent} from '../../../../event/weapon-events';

const PUNCH_FORCE = 30;
const ATTACK_DISTANCE = 30;

export class Fists extends Weapon {
    private readonly attackDistance: number;

    constructor(parameters: WeaponParameters) {
        super(parameters);
        this.attackDistance = ATTACK_DISTANCE * this.config.worldScale;
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
        this.playWhooshSound();
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

    private playWhooshSound() {
        this.playSound('whoosh', 0.1);
    }
}

export class FistsState extends WeaponState {
    static readonly PUNCHING = 'punching';
}
