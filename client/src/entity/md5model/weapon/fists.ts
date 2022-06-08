import {AnimationAction, Audio, BufferGeometry, Material} from 'three';

import {randomInt} from 'mathjs';

import {Weapon} from './weapon';

export class Fists extends Weapon {
    private readonly punchAnimationActionNames = new Map<Hand, string[]>();

    private lastPunchingHand = Hand.LEFT;
    private lastPunchAnimationAction?: AnimationAction;

    constructor(geometry: BufferGeometry, materials: Material | Material[], sounds: Map<string, Audio<AudioNode>[]>) {
        super(geometry, materials, sounds);
    }

    init() {
        super.init();
        this.punchAnimationActionNames.set(Hand.LEFT, ['berserk_punch1', 'berserk_punch3']);
        this.punchAnimationActionNames.set(Hand.RIGHT, ['berserk_punch2', 'berserk_punch4']);
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
            this.executeActionCrossFade(nextPunchActionName, 'idle', 2.0);
            this.playWooshSound();

            this.lastPunchAnimationAction = this.getAnimationAction(nextPunchActionName);
            this.lastPunchingHand = nextPunchingHand;
        }
    }

    private isAttacking(): boolean {
        return !!(this.lastPunchAnimationAction && this.lastPunchAnimationAction.isRunning());
    }

    private playRaiseSound() {
        this.playFirstSound('raise', 0.1);
    }

    private playWooshSound() {
        this.playRandomSound('woosh', 0.1);
    }
}

enum Hand {
    LEFT, RIGHT
}