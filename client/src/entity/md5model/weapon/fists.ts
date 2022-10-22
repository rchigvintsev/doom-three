import {AnimationAction, Object3D} from 'three';

import {randomInt} from 'mathjs';

import {Weapon} from './weapon';
import {AttackEvent} from '../../../event/weapon-events';
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
            this.playRaiseSound();
            // Weapon visibility will be changed on next rendering step
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.animateCrossFade('idle', 'lower', 0.25);
            // Weapon visibility will be changed on "lower" animation finish
        }
    }

    attack() {
        if (this.canAttack()) {
            const nextPunchingHand = (this.lastPunchingHand + 1) % 2;
            const punchActionNames = this.punchAnimationActionNames.get(nextPunchingHand)!;
            const nextPunchActionName = punchActionNames[randomInt(0, punchActionNames.length)];

            this.animateCrossFadeAsync(nextPunchActionName, 'idle', 0.625, 1.875);

            this.lastPunchAnimationAction = this.getAnimationAction(nextPunchActionName);
            this.lastPunchingHand = nextPunchingHand;

            if (this.wireframeHelper) {
                this.wireframeHelper.animateCrossFadeAsync(nextPunchActionName, 'idle', 0.625, 1.875);
            }

            this.dispatchEvent(new AttackEvent(this, this.attackDistance, PUNCH_FORCE));
        }
    }

    onHit(_target: Object3D) {
        this.playImpactSound();
    }

    onMiss() {
        this.playWooshSound();
    }

    private canAttack() {
        return this.enabled && !this.isRaising() && !this.isLowering() && !this.isAttacking();
    }

    private isAttacking(): boolean {
        return !!(this.lastPunchAnimationAction && this.lastPunchAnimationAction.isRunning());
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

enum Hand {
    LEFT, RIGHT
}