import {Audio, BufferGeometry, Event, Material, Object3D} from 'three';

import {Weapon} from './weapon';
import {GameConfig} from '../../../game-config';
import {WeaponDisableEvent} from '../../../event/weapon-events';
import {ReloadableWeapon} from './reloadable-weapon';

const AMMO_CARTRIDGE_SIZE = 12;

export class Pistol extends Weapon implements ReloadableWeapon {
    // -1 means infinite
    private ammoReserve = -1;
    private ammoCartridge = AMMO_CARTRIDGE_SIZE;

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
            if (this.ammoCartridge === 0) {
                this.animateCrossFade('idle_empty', 'reload_empty', 0.5);
                this.animateCrossFadeDelayed('reload_empty', 'idle', 1.85);
                this.updateAmmoCountersOnReload();
                this.playReloadSound();
            } else {
                this.animateCrossFade('idle', 'fire1', 0.1);
                if (this.ammoCartridge > 1) {
                    this.animateCrossFadeDelayed('fire1', 'idle', 0.3);
                } else {
                    this.animateCrossFadeDelayed('fire1', 'idle_empty', 0.2);
                }
                this.ammoCartridge--;
                this.playFireSound();
            }
        }
    }

    reload(): void {
        if (this.canReload() && this.ammoCartridge < AMMO_CARTRIDGE_SIZE) {
            this.animateCrossFade('idle', 'reload_empty', 0.5);
            this.animateCrossFadeDelayed('reload_empty', 'idle', 1.85);
            this.updateAmmoCountersOnReload();
            this.playReloadSound();
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
        return this.isIdle();
    }

    private canReload() {
        return this.isIdle();
    }

    private isIdle() {
        return this.enabled && !this.isRaising() && !this.isLowering() && !this.isAttacking() && !this.isReloading();
    }

    private isAttacking(): boolean {
        const fireAction = this.getAnimationAction('fire1');
        return !!fireAction && fireAction.isRunning();
    }

    private isReloading(): boolean {
        const reloadAction = this.getAnimationAction('reload_empty');
        return !!reloadAction && reloadAction.isRunning();
    }

    private playRaiseSound() {
        this.playFirstSound('raise', 0.1);
    }

    private playFireSound() {
        this.playFirstSound('fire');
    }

    private playReloadSound() {
        this.playFirstSound('reload');
    }

    private updateAmmoCountersOnReload() {
        if (this.ammoReserve === -1) { // Infinite reserve
            this.ammoCartridge = AMMO_CARTRIDGE_SIZE;
        } else if (this.ammoReserve < AMMO_CARTRIDGE_SIZE) {
            this.ammoCartridge = this.ammoReserve;
            this.ammoReserve = 0;
        } else {
            this.ammoCartridge = AMMO_CARTRIDGE_SIZE;
            this.ammoReserve -= AMMO_CARTRIDGE_SIZE;
        }
    }
}
