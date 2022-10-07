import {Audio, BufferGeometry, Event, Material, Object3D} from 'three';

import {Weapon} from './weapon';
import {GameConfig} from '../../../game-config';
import {WeaponDisableEvent} from '../../../event/weapon-events';

export class Pistol extends Weapon {
    constructor(config: GameConfig,
                geometry: BufferGeometry,
                materials: Material | Material[],
                sounds: Map<string, Audio<AudioNode>[]>) {
        super(config, geometry, materials, sounds);
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.animateCrossFadeDelayed('raise', 'idle', 0.50);
            this.playRaiseSound();
            // Weapon visibility will be changed on next rendering step
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.animateCrossFade('idle', 'put_away', 0.25);
            // Weapon visibility will be changed on "lower" animation finish
        }
    }

    attack() {
        if (this.canAttack()) {
            // Do nothing
        }
    }

    onHit(_target: Object3D) {
        // Do nothing
    }

    onMiss() {
        // Do nothing
    }

    protected onAnimationFinished(e: Event) {
        if (e.action === this.getAnimationAction('put_away') && !this.enabled) {
            this.visible = false;
            this.dispatchEvent(new WeaponDisableEvent(this));
        }
    }

    private canAttack() {
        return this.enabled && !this.isRaising() && !this.isLowering() && !this.isAttacking();
    }

    private isAttacking(): boolean {
        return false;
    }

    private playRaiseSound() {
        this.playFirstSound('raise', 0.1);
    }
}
