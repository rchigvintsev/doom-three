import {BufferGeometry, Quaternion, Vector3} from 'three';

import {Player} from '../../../player/player';
import {ParticleSystem} from '../../../../particles/particle-system';
import {Firearm, FirearmParameters, FirearmState} from './firearm';
import {DecalSystem} from '../../../../decal/decal-system';
import {BufferGeometries} from '../../../../util/buffer-geometries';

const SHELL_EJECTION_TIMEOUT_MILLIS = 650;

export class Shotgun extends Firearm {
    private shellEjected = true;

    constructor(parameters: ShotgunParameters) {
        super(parameters);
        this.applyTubeDeformToFireFlash(this.geometry);
    }

    update(deltaTime: number, player?: Player) {
        super.update(deltaTime, player);
        if (this.lastFireTime > 0) {
            const now = performance.now();
            const fireDelta = now - this.lastFireTime;

            if (!this.shellEjected && fireDelta > SHELL_EJECTION_TIMEOUT_MILLIS) {
                this.ejectShell();
            }
        }
    }

    attack() {
        super.attack();
        if (this.canAttack()) {
            this.shellEjected = false;
        }
    }

    isLowAmmo(): boolean {
        return this.ammoClip < 3;
    }

    onHit() {
        // Do nothing
    }

    onMiss() {
        // Do nothing
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
                if (!this.isAnyAnimationRunning('reload_start', 'reload_loop', 'reload_loop2', 'reload_loop3', 'reload_end')) {
                    this.changeState(FirearmState.IDLE);
                }
                break;
            default:
                super.updateState();
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
        super.ejectShell();
        this.shellEjected = true;
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
                this.updateAmmoCountersOnReload();
            })
            .thenCrossFadeTo('reload_end').withDelay(0.4).onStart(() => this.playPumpSound(0.5))
            .thenCrossFadeTo('idle').withDelay(0.8).flow);
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

    private applyTubeDeformToFireFlash = (() => {
        /*
         *  Shotgun flash faces
         *  ===================
         *
         *     Player's view direction
         *               |
         *         5700  V
         *    5703 |\  --------- 5701
         *         | \ \       |
         *         |  \ \      |
         *         |   \ \     |
         *     Top |    \ \    | Bottom
         *         |     \ \   |
         *         |      \ \  |
         *         |       \ \ |
         *    5705 |________\ \| 5702
         *                  5704
         */

        const view = new Vector3();
        const face1 = new Vector3(5700, 5702, 5701);
        const face2 = new Vector3(5705, 5703, 5704);
        return (geometry: BufferGeometry, offset?: Vector3) => {
            view.set(-15, 0, 0);
            if (offset) {
                view.y -= offset.x / this.config.worldScale;
                view.z -= offset.y / this.config.worldScale;
            }
            BufferGeometries.applyTubeDeform(geometry, view, face1, face2);
        };
    })();
}

export interface ShotgunParameters extends FirearmParameters {
    particleSystem: ParticleSystem;
    decalSystem: DecalSystem;
    detonationSmoke: string;
    detonationSpark: string;
    detonationMark: string;
}
