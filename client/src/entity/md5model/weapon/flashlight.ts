import {AnimationAction, Audio, BufferGeometry, Material, Object3D} from 'three';

import {randomInt} from 'mathjs';

import {Weapon} from './weapon';
import {GameConfig} from '../../../game-config';
import {AttackEvent} from '../../../event/weapon-events';

const PUNCH_FORCE = 50;
const ATTACK_DISTANCE = 30;

export class Flashlight extends Weapon {
    private readonly attackDistance!: number;
    private readonly punchAnimationActionNames = ['swing1', 'swing2'];

    private lastPunchAnimationAction?: AnimationAction;

    constructor(config: GameConfig,
                geometry: BufferGeometry,
                materials: Material | Material[],
                sounds: Map<string, Audio<AudioNode>[]>) {
        super(config, geometry, materials, sounds);
        this.attackDistance = ATTACK_DISTANCE * config.worldScale;
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

    attack(): void {
        if (this.canAttack()) {
            const nextPunchActionName = this.punchAnimationActionNames[randomInt(0, this.punchAnimationActionNames.length)];
            this.animateFadeOutFadeIn(nextPunchActionName, 0.625, 'idle', 1.875);
            this.lastPunchAnimationAction = this.getAnimationAction(nextPunchActionName);
            this.dispatchEvent(new AttackEvent(this, this.attackDistance, PUNCH_FORCE));
        }
    }

    onHit(_target: Object3D): void {
        this.playImpactSound();
    }

    onMiss(): void {
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