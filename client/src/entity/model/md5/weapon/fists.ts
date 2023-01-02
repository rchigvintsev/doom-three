import {AnimationAction, Mesh} from 'three';

import {randomInt} from 'mathjs';

import {Weapon, WeaponState} from './weapon';
import {AttackEvent} from '../../../../event/weapon-events';
import {Md5ModelParameters} from '../md5-model';

const PUNCH_FORCE = 50;
const ATTACK_DISTANCE = 30;

export class Fists extends Weapon {
    private readonly attackDistance: number;
    private readonly punchAnimationActionNames = new Map<Hand, string[]>();

    private lastPunchingHand = Hand.LEFT;
    private lastPunchAnimationAction?: AnimationAction;

    constructor(parameters: Md5ModelParameters) {
        super(parameters);
        this.attackDistance = ATTACK_DISTANCE * this.config.worldScale;
        this.punchAnimationActionNames.set(Hand.LEFT, ['berserk_punch1', 'berserk_punch3']);
        this.punchAnimationActionNames.set(Hand.RIGHT, ['berserk_punch2', 'berserk_punch4']);
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.animateCrossFade('raise', 'idle', 0.40);
            this.changeState(FistsState.RAISING);
            this.playRaiseSound();
            // Weapon visibility will be changed on next rendering step
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.animateCrossFade('idle', 'lower', 0.25);
            this.changeState(FistsState.LOWERING);
            // Weapon visibility will be changed on "lower" animation finish
        }
    }

    attack() {
        if (this.canAttack()) {
            const nextPunchingHand = (this.lastPunchingHand + 1) % 2;
            const punchActionNames = this.punchAnimationActionNames.get(nextPunchingHand)!;
            const nextPunchActionName = punchActionNames[randomInt(0, punchActionNames.length)];

            this.animateCrossFadeAsync(nextPunchActionName, 'idle', 0.625, 1.875);
            this.changeState(FistsState.PUNCHING);

            this.lastPunchAnimationAction = this.getAnimationAction(nextPunchActionName);
            this.lastPunchingHand = nextPunchingHand;

            if (this.wireframeHelper) {
                this.wireframeHelper.animateCrossFadeAsync(nextPunchActionName, 'idle', 0.625, 1.875);
            }

            this.dispatchEvent(new AttackEvent(this, this.attackDistance, PUNCH_FORCE));
        }
    }

    onHit(_target: Mesh) {
        this.playImpactSound();
    }

    onMiss() {
        this.playWooshSound();
    }

    protected updateState() {
        super.updateState();
        if (this.currentState === FistsState.PUNCHING
            && (!this.lastPunchAnimationAction || !this.lastPunchAnimationAction.isRunning())) {
            this.changeState(FistsState.IDLE);
        }
    }

    private canAttack() {
        return this.currentState === FistsState.IDLE;
    }

    private playRaiseSound() {
        this.playFirstSound('raise', 0.1);
    }

    private playImpactSound() {
        this.playRandomSound('impact');
    }

    private playWooshSound() {
        this.playRandomSound('woosh', 0.1);
    }
}

export class FistsState extends WeaponState {
    static readonly PUNCHING = 'punching';
}

enum Hand {
    LEFT, RIGHT
}