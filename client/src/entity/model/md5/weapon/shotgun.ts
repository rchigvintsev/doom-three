import {BufferGeometry, Quaternion, Vector2, Vector3} from 'three';

import {Player} from '../../../player/player';
import {Firearm, FirearmParameters, FirearmState} from './firearm';
import {BufferGeometries} from '../../../../util/buffer-geometries';

const SHELL_EJECTION_TIMEOUT_MILLIS = 650;
const BUCKSHOT_DISTRIBUTION_FACTOR = 0.5;

export class Shotgun extends Firearm {
    private shellEjected = true;
    private ammoCountersUpdated = true;
    private ammoCountersUpdateTimeoutMillis = 0;
    private lastReloadTime = 0;

    constructor(parameters: FirearmParameters) {
        super(parameters);
        this.applyTubeDeformToFireFlash(this.geometry);
    }

    update(deltaTime: number, player?: Player) {
        super.update(deltaTime, player);

        if (this.lastFireTime > 0 && !this.shellEjected) {
            const now = performance.now();
            if (now - this.lastFireTime > SHELL_EJECTION_TIMEOUT_MILLIS) {
                this.ejectShell();
            }
        }

        if (this.lastReloadTime > 0 && !this.ammoCountersUpdated) {
            if (!this.isReloading()) {
                this.ammoCountersUpdated = true;
            } else {
                const now = performance.now();
                if (now - this.lastReloadTime > this.ammoCountersUpdateTimeoutMillis) {
                    this.updateAmmoCountersOnReload();
                    this.ammoCountersUpdated = true;
                }
            }
        }
    }

    attack() {
        const canAttack = this.canAttack();
        if (canAttack && this.isReloading()) {
            this.stopAnimations('reload_start', 'reload_loop', 'reload_loop2', 'reload_loop3', 'reload_end');
            this.stopSounds('reload_start', 'reload_loop', 'pump');
        }
        super.attack();
        if (canAttack) {
            this.shellEjected = false;
        }
    }

    isLowAmmo(): boolean {
        return this.ammoClip < 3;
    }

    protected doInit() {
        super.doInit();
        this.initAnimationFlows();
    }

    protected updateState() {
        switch (this.currentState) {
            case FirearmState.SHOOTING:
                if (!this.isAnyAnimationRunning('fire1', 'fire2', 'fire3')) {
                    this.changeState(FirearmState.IDLE);
                }
                break;
            case FirearmState.RELOADING:
                if (!this.isAnyAnimationRunning(
                    'reload_start',
                    'reload_loop',
                    'reload_loop2',
                    'reload_loop3',
                    'reload_end'
                )) {
                    this.changeState(FirearmState.IDLE);
                }
                break;
            default:
                super.updateState();
        }
    }

    protected computeMuzzleSmokeParticlePosition(position: Vector3) {
        return position.setFromMatrixPosition(this.skeleton.bones[40].matrixWorld);
    }

    protected get shellEjectionForceFactor(): number {
        return 0.16;
    }

    protected computeShellPosition(position: Vector3): Vector3 {
        return position.setFromMatrixPosition(this.skeleton.bones[42].matrixWorld);
    }

    protected computeShellQuaternion(quaternion: Quaternion) {
        this.shellRotationMatrixEye.setFromMatrixPosition(this.skeleton.bones[42].matrixWorld);
        this.shellRotationMatrixTarget.setFromMatrixPosition(this.skeleton.bones[43].matrixWorld);
        this.shellRotationMatrix.lookAt(this.shellRotationMatrixEye, this.shellRotationMatrixTarget, this.up);
        return quaternion.setFromRotationMatrix(this.shellRotationMatrix)
            .multiply(Firearm.SHELL_ROTATION_X_ANGLE_ADJUSTMENT);
    }

    protected computeShellTargetPosition(position: Vector3) {
        position.setFromMatrixPosition(this.skeleton.bones[42].matrixWorld);
        this.worldToLocal(position);
        position.x += 4;
        position.y += 3.4;
        position.z += 4;
    }

    protected ejectShell() {
        if (!this.shellEjected) {
            super.ejectShell();
            this.shellEjected = true;
        }
    }

    protected get fireFlashMaterialNames(): string[] {
        return [
            'models/weapons/shotgun/shotgun_mflashb',
            'models/weapons/shotgun/shotgun_mflash2',
            'models/weapons/shotgun/shotgun_mflash'
        ];
    }

    protected initFireFlashMaterialParameters(parameters: Map<string, any>) {
        const flash1Rotate = Math.random();
        const flash1Scroll = flash1Rotate < 0.5 ? 0 : 1 / 32;
        const flash3Rotate = Math.random();
        const flash3Scroll = flash3Rotate < 0.5 ? 0 : 1 / 32;

        parameters.set('shotgunFlash1Rotate', flash1Rotate);
        parameters.set('shotgunFlash3Rotate', flash3Rotate);
        parameters.set('shotgunFlash1ScrollX', flash1Scroll);
        parameters.set('shotgunFlash2ScrollX', 0);
        parameters.set('shotgunFlash3ScrollX', flash3Scroll);
    }

    protected updateFireFlashMaterialParameters(parameters: Map<string, any>, deltaTime: number) {
        // Animation of flash 1 consists of 32 frames
        let flash1Scroll = Math.trunc(deltaTime / (this.fireFlashDurationMillis / 32));
        // Animation of flash 2 consists of 8 frames
        const flash2Scroll = Math.trunc(deltaTime / (this.fireFlashDurationMillis / 8));
        // Animation of flash 3 consists of 32 frames
        let flash3Scroll = Math.trunc(deltaTime / (this.fireFlashDurationMillis / 32));

        const flash1Rotate = parameters.get('shotgunFlashRotate');
        if (flash1Rotate >= 0.5) {
            flash1Scroll++;
        }
        const flash3Rotate = parameters.get('shotgunFlashRotate');
        if (flash3Rotate >= 0.5) {
            flash3Scroll++;
        }

        parameters.set('shotgunFlash1ScrollX', flash1Scroll / 32);
        parameters.set('shotgunFlash2ScrollX', flash2Scroll / 8);
        parameters.set('shotgunFlash3ScrollX', flash3Scroll / 32);
    }

    protected computeFireFlashPosition(position: Vector3) {
        position.setFromMatrixPosition(this.skeleton.bones[40].matrixWorld);
        this.worldToLocal(position);
    }

    protected updateAmmoCountersOnReload() {
        if (this.ammoClip < this.ammoClipSize) {
            if (this.ammoReserve === -1) { // Infinite reserve
                this.ammoClip = Math.min(this.ammoClip + 2, this.ammoClipSize);
            } else {
                if (this.ammoReserve === 1 || this.ammoClip === this.ammoClipSize - 1) {
                    this.ammoReserve = this.ammoReserve - 1;
                    this.ammoClip = this.ammoClip + 1;
                } else {
                    this.ammoReserve = this.ammoReserve - 2;
                    this.ammoClip = this.ammoClip + 2;
                }
            }
        }
    }

    protected get attackCoords(): Vector2[] {
        const coords = [];
        for (let i = 0; i < 13; i++) {
            const x = Math.random() * BUCKSHOT_DISTRIBUTION_FACTOR - BUCKSHOT_DISTRIBUTION_FACTOR / 2.0;
            const y = Math.random() * BUCKSHOT_DISTRIBUTION_FACTOR - BUCKSHOT_DISTRIBUTION_FACTOR / 2.0;
            coords.push(new Vector2(x, y));
        }
        return coords;
    }

    protected canAttack(): boolean {
        return this.ammoClip > 0 && (this.isIdle() || this.isReloading());
    }

    protected applyTubeDeformToFireFlash = (() => {
        const view = new Vector3();
        const face1 = new Vector3(5702, 5701, 5700);
        const face2 = new Vector3(5704, 5705, 5703);
        return (geometry: BufferGeometry, offset?: Vector3) => {
            view.set(-15, 0, 0);
            if (offset) {
                view.y -= offset.x / this.config.worldScale;
                view.z -= offset.y / this.config.worldScale;
            }
            BufferGeometries.applyTubeDeform(geometry, view, face1, face2);
        };
    })();

    private initAnimationFlows() {
        this.addAnimationFlow('enable', this.animate('raise')
            .onStart(() => this.playRaiseSound())
            .thenCrossFadeTo('idle').withDelay(0.5).flow);
        this.addAnimationFlow('disable', this.animate('idle').thenCrossFadeTo('lower').withDuration(0.21).flow);
        this.addAnimationFlow('attack', this.animate('idle')
            .thenCrossFadeToAny('fire1', 'fire2', 'fire3').withDuration(0.1).onStart(() => {
                this.playFireSound();
                this.playPumpSound(0.65);
            })
            .thenCrossFadeTo('idle').withDelay(1.2).flow);
        this.addAnimationFlow('reload', this.animate('idle')
            .thenCrossFadeTo('reload_start').withDuration(0.42).onStart(() => this.playReloadStartSound())
            .thenCrossFadeToAny('reload_loop', 'reload_loop2', 'reload_loop3').repeat(() => {
                const requiredAmmo = Math.min(this.ammoClipSize - this.ammoClip, this.ammoReserve);
                let repetitions = Math.floor(requiredAmmo / 2);
                if (requiredAmmo % 2 !== 0) {
                    repetitions++;
                }
                return repetitions;
            }).withDelay(0.19).withDuration(0.22).onLoop(() => {
                this.playReloadLoopSound();
                this.updateAmmoCountersOnReloadLoop(0.3);
            })
            .thenCrossFadeTo('reload_end').withDelay(0.4).onStart(() => this.playPumpSound(0.5))
            .thenCrossFadeTo('idle').withDelay(0.8).flow);
    }

    private updateAmmoCountersOnReloadLoop(delay = 0) {
        if (delay === 0) {
            this.updateAmmoCountersOnReload();
        } else {
            this.lastReloadTime = performance.now();
            this.ammoCountersUpdateTimeoutMillis = delay * 1000;
            this.ammoCountersUpdated = false;
        }
    }

    private playRaiseSound() {
        this.playSound('raise', 0.1);
    }

    private playFireSound() {
        this.playSound('fire');
    }

    private playPumpSound(delay?: number) {
        this.playSound('pump', delay);
    }

    private playReloadStartSound() {
        this.playSound('reload_start');
    }

    private playReloadLoopSound(delay?: number) {
        this.playSound('reload_loop', delay);
    }
}
