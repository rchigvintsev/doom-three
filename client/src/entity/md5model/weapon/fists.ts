import {AnimationAction, Audio, BufferGeometry, Material, Object3D} from 'three';

import {randomInt} from 'mathjs';

import {Weapon} from './weapon';
import {GameConfig} from '../../../game-config';
import {AttackEvent} from '../../../event/weapon-events';

const PUNCH_FORCE = 50;
const ATTACK_DISTANCE = 30;

export class Fists extends Weapon {
    private readonly attackDistance: number;
    private readonly punchAnimationActionNames = new Map<Hand, string[]>();

    private lastPunchingHand = Hand.LEFT;
    private lastPunchAnimationAction?: AnimationAction;

    constructor(config: GameConfig,
                geometry: BufferGeometry,
                materials: Material | Material[],
                sounds: Map<string, Audio<AudioNode>[]>) {
        super(config, geometry, materials, sounds);
        this.attackDistance = ATTACK_DISTANCE * config.worldScale;
        this.punchAnimationActionNames.set(Hand.LEFT, ['berserk_punch1', 'berserk_punch3']);
        this.punchAnimationActionNames.set(Hand.RIGHT, ['berserk_punch2', 'berserk_punch4']);
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.animateCrossFadeTo('raise', 'idle', 0.40);
            this.playRaiseSound();
            // Weapon visibility will be changed on next rendering step
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.animateCrossFadeTo('idle', 'lower', 0.25);
            // Weapon visibility will be changed on "lower" animation finish
        }
    }

    attack() {
        if (this.canAttack()) {
            const nextPunchingHand = (this.lastPunchingHand + 1) % 2;
            const punchActionNames = this.punchAnimationActionNames.get(nextPunchingHand)!;
            const nextPunchActionName = punchActionNames[randomInt(0, punchActionNames.length)];

            this.animateFadeOutFadeIn(nextPunchActionName, 0.625, 'idle', 1.875);

            this.lastPunchAnimationAction = this.getAnimationAction(nextPunchActionName);
            this.lastPunchingHand = nextPunchingHand;

            if (this.wireframeHelper) {
                this.wireframeHelper.animateFadeOutFadeIn(nextPunchActionName, 0.625, 'idle', 1.875);
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

    private playRaiseSound() {
        this.playFirstSound('raise', 0.1);
    }

    private playImpactSound() {
        this.playRandomSound('impact');
    }

    private playWooshSound() {
        this.playRandomSound('woosh', 0.1);
    }

    private isAttacking(): boolean {
        return !!(this.lastPunchAnimationAction && this.lastPunchAnimationAction.isRunning());
    }
}

enum Hand {
    LEFT, RIGHT
}