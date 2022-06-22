import {AnimationAction, Audio, BufferGeometry, Material} from 'three';

import {randomInt} from 'mathjs';

import {Weapon} from './weapon';
import {GameConfig} from '../../../game-config';
import {AttackEvent} from '../../../event/attack-event';

const PUNCH_FORCE = 200;

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
        this.attackDistance = 20 * config.worldScale;
    }

    init() {
        super.init();
        this.punchAnimationActionNames.set(Hand.LEFT, ['berserk_punch1', 'berserk_punch3']);
        this.punchAnimationActionNames.set(Hand.RIGHT, ['berserk_punch2', 'berserk_punch4']);
    }

    clone(recursive?: boolean): this {
        const clone = super.clone(recursive);
        this.punchAnimationActionNames.forEach((value, key) =>
            clone.punchAnimationActionNames.set(key, value));
        clone.lastPunchingHand = this.lastPunchingHand;
        clone.lastPunchAnimationAction = this.lastPunchAnimationAction;
        return clone;
    }

    enable() {
        if (!this.enabled) {
            this.executeActionCrossFade('raise', 'idle', 0.40);
            this.playRaiseSound();
            this.enabled = true;
        }
    }

    disable() {
        if (this.enabled) {
            this.executeActionCrossFade('idle', 'lower', 0.25);
            this.enabled = false;
        }
    }

    attack(): void {
        if (!this.isAttacking()) {
            const nextPunchingHand = (this.lastPunchingHand + 1) % 2;
            const punchActionNames = this.punchAnimationActionNames.get(nextPunchingHand)!;
            const nextPunchActionName = punchActionNames[randomInt(0, punchActionNames.length)];

            const punchAction = this.getRequiredAnimationAction(nextPunchActionName);
            punchAction.stop().reset().fadeOut(0.625).play();

            const idleAction = this.getRequiredAnimationAction('idle');
            idleAction.stop().reset().fadeIn(1.875).play();

            this.lastPunchAnimationAction = punchAction;
            this.lastPunchingHand = nextPunchingHand;

            this.dispatchEvent(new AttackEvent(this, this.attackDistance, PUNCH_FORCE));
        }
    }

    playRaiseSound() {
        this.playFirstSound('raise', 0.1);
    }

    playImpactSound() {
        this.playRandomSound('impact');
    }

    playWooshSound() {
        this.playRandomSound('woosh', 0.1);
    }

    private isAttacking(): boolean {
        return !!(this.lastPunchAnimationAction && this.lastPunchAnimationAction.isRunning());
    }
}

enum Hand {
    LEFT, RIGHT
}