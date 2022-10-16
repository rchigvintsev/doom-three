import {Audio, BufferGeometry, Event, Material, Object3D, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {Weapon} from './weapon';
import {GameConfig} from '../../../game-config';
import {WeaponDisableEvent} from '../../../event/weapon-events';
import {ReloadableWeapon} from './reloadable-weapon';
import {Player} from '../../player/player';
import {UpdatableMeshBasicMaterial} from '../../../material/updatable-mesh-basic-material';
import {BufferGeometries} from '../../../util/buffer-geometries';
import {Face3} from '../../../geometry/face3';

const AMMO_CARTRIDGE_SIZE = 12;
const FIRE_FLASH_DURATION_MILLIS = 120;

export class Pistol extends Weapon implements ReloadableWeapon {
    private readonly fireFlashMaterials: UpdatableMeshBasicMaterial[] = [];
    private fireFlashMaterialParams?: Map<string, any>;

    // -1 means infinite
    private ammoReserve = -1;
    private ammoCartridge = AMMO_CARTRIDGE_SIZE;
    private lastFireTime = 0;

    constructor(config: GameConfig,
                geometry: BufferGeometry,
                materials: Material | Material[],
                sounds: Map<string, Audio<AudioNode>[]>) {
        super(config, geometry, materials, sounds);
        if (!config.renderOnlyWireframe) {
            this.initFireFlash();
        }
        this.applyTubeDeformToFireFlash(this.geometry);
    }

    update(deltaTime: number, player?: Player) {
        super.update(deltaTime, player);
        const now = performance.now();
        const fireDelta = now - this.lastFireTime;
        if (fireDelta > FIRE_FLASH_DURATION_MILLIS) {
            this.hideFireFlash();
        } else {
            this.updateFireFlash(fireDelta);
        }
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
                this.showFireFlash();
                this.animateCrossFade('idle', 'fire1', 0.1);
                if (this.ammoCartridge > 1) {
                    this.animateCrossFadeDelayed('fire1', 'idle', 0.3);
                } else {
                    this.animateCrossFadeDelayed('fire1', 'idle_empty', 0.2);
                }
                this.ammoCartridge--;
                this.playFireSound();
                this.lastFireTime = performance.now();
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
        const clipName = e.action.getClip().name;
        if (clipName === 'put_away' && !this.enabled) {
            this.visible = false;
            this.dispatchEvent(new WeaponDisableEvent(this));
        }
    }

    protected updateAcceleration(direction: Vector3) {
        super.updateAcceleration(direction);
        const offset = this.acceleration.offset;
        if (offset.x !== 0 || offset.y !== 0) {
            this.applyTubeDeformToFireFlash(this.geometry, offset);
            if (this.wireframeHelper) {
                this.applyTubeDeformToFireFlash(this.wireframeHelper.geometry, offset);
            }
        }
    }

    protected drop(time: number, rotationX: number): Vector3 | undefined {
        const offset = super.drop(time, rotationX);
        if (offset) {
            this.applyTubeDeformToFireFlash(this.geometry, offset);
            if (this.wireframeHelper) {
                this.applyTubeDeformToFireFlash(this.wireframeHelper.geometry, offset);
            }
        }
        return offset;
    }

    private initFireFlash() {
        for (const materialName of ['models/weapons/pistol/pistol_mflash', 'models/weapons/pistol/pistol_mflash2']) {
            const material = <UpdatableMeshBasicMaterial>this.findMaterialByName(materialName);
            if (!material) {
                console.error(`Material "${materialName}" is not found`);
            } else {
                material.visible = false;
                this.fireFlashMaterials.push(material);
            }
        }
        if (this.fireFlashMaterials.length > 0) {
            this.fireFlashMaterialParams = new Map<string, any>();
            this.fireFlashMaterialParams!.set('pistolFlashScrollX', 0);
            this.fireFlashMaterialParams!.set('pistolFlash2ScrollX', 0);
            this.fireFlashMaterialParams!.set('pistolFlashRotate', 0);
        }
    }

    private showFireFlash() {
        if (this.fireFlashMaterials.length > 0) {
            const flash1Rotate = randomInt(0, 2);
            const flash1Scroll = flash1Rotate < 2 ? 0 : 1;

            this.fireFlashMaterialParams!.set('pistolFlashScrollX', flash1Scroll);
            this.fireFlashMaterialParams!.set('pistolFlashRotate', flash1Rotate);
            this.fireFlashMaterialParams!.set('pistolFlash2ScrollX', 0);

            for (const material of this.fireFlashMaterials) {
                material.setParameters(this.fireFlashMaterialParams!);
                material.visible = true;
                material.update();
            }
        }
    }

    private updateFireFlash(deltaTime: number) {
        if (this.fireFlashMaterials.length > 0) {
            // Animation of flash 1 consists of 12 frames
            let flash1Scroll = Math.trunc(deltaTime / (FIRE_FLASH_DURATION_MILLIS / 12));
            // Animation of flash 2 consists of 4 frames
            const flash2Scroll = Math.trunc(deltaTime / (FIRE_FLASH_DURATION_MILLIS / 4));

            const flash1Rotate = this.fireFlashMaterialParams!.get('pistolFlashRotate');
            if (flash1Rotate > 1) {
                flash1Scroll++;
            }

            this.fireFlashMaterialParams!.set('pistolFlashScrollX', flash1Scroll);
            this.fireFlashMaterialParams!.set('pistolFlash2ScrollX', flash2Scroll);

            for (const material of this.fireFlashMaterials) {
                material.setParameters(this.fireFlashMaterialParams!);
            }
        }
    }

    private hideFireFlash() {
        for (const material of this.fireFlashMaterials) {
            material.visible = false;
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

    private applyTubeDeformToFireFlash(geometry: BufferGeometry, offset?: Vector3) {
        /*
         *  Pistol flash faces
         *  ==================
         *
         *     Player's view direction
         *               |
         *         6066  V
         *    6069 |\  --------- 6067
         *         | \ \       |
         *         |  \ \      |
         *         |   \ \     |
         *     Top |    \ \    | Bottom
         *         |     \ \   |
         *         |      \ \  |
         *         |       \ \ |
         *    6071 |________\ \| 6068
         *                  6070
         */

        const view = new Vector3(-15, 0, 0);
        if (offset) {
            view.y -= offset.x / this.config.worldScale;
            view.z -= offset.y / this.config.worldScale;
        }
        BufferGeometries.applyTubeDeform(geometry, view, new Face3(6067, 6071, 6066), new Face3(6068, 6069, 6070));
    }
}
