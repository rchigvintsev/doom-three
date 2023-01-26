import {BufferGeometry, Quaternion, Vector3} from 'three';

import {BufferGeometries} from '../../../../util/buffer-geometries';
import {Firearm, FirearmParameters, FirearmState} from './firearm';

export class Pistol extends Firearm {
    constructor(parameters: FirearmParameters) {
        super(parameters);
        this.applyTubeDeformToFireFlash(this.geometry);
    }

    isLowAmmo(): boolean {
        return this.ammoClip < 5;
    }

    protected doInit() {
        super.doInit();
        this.initAnimationFlows();
    }

    protected updateState() {
        switch (this.currentState) {
            case FirearmState.LOWERING:
                if (!this.isAnyAnimationRunning('put_away')) {
                    this.changeState(FirearmState.INACTIVE);
                }
                break;
            case FirearmState.SHOOTING:
                if (!this.isAnyAnimationRunning('fire1')) {
                    this.changeState(FirearmState.IDLE);
                }
                break;
            case FirearmState.RELOADING:
                if (!this.isAnyAnimationRunning('reload_empty')) {
                    this.changeState(FirearmState.IDLE);
                }
                break;
            default:
                super.updateState();
        }
    }

    protected computeMuzzleSmokeParticlePosition(position: Vector3) {
        return position.setFromMatrixPosition(this.skeleton.bones[25].matrixWorld);
    }

    protected get shellEjectionForceFactor(): number {
        return 0.08;
    }

    protected computeShellPosition(position: Vector3) {
        position.setFromMatrixPosition(this.skeleton.bones[28].matrixWorld);
    }

    protected computeShellTargetPosition(position: Vector3) {
        position.setFromMatrixPosition(this.skeleton.bones[24].matrixWorld);
        this.worldToLocal(position);
        position.y += 3.4;
        position.z += 3.4;
    }

    protected computeShellQuaternion(quaternion: Quaternion) {
        this.shellRotationMatrixEye.setFromMatrixPosition(this.skeleton.bones[24].matrixWorld);
        this.shellRotationMatrixTarget.setFromMatrixPosition(this.skeleton.bones[25].matrixWorld);
        this.shellRotationMatrix.lookAt(this.shellRotationMatrixEye, this.shellRotationMatrixTarget, this.up);
        quaternion.setFromRotationMatrix(this.shellRotationMatrix).multiply(Firearm.SHELL_ROTATION_X_ANGLE_ADJUSTMENT);
    }

    protected get fireFlashMaterialNames(): string[] {
        return ['models/weapons/pistol/pistol_mflash', 'models/weapons/pistol/pistol_mflash2'];
    }

    protected initFireFlashMaterialParameters(parameters: Map<string, any>) {
        const flash1Rotate = Math.random();
        const flash1Scroll = flash1Rotate < 0.5 ? 0 : 1 / 12;

        parameters.set('pistolFlashRotate', flash1Rotate);
        parameters.set('pistolFlashScrollX', flash1Scroll);
        parameters.set('pistolFlash2ScrollX', 0);
    }

    protected updateFireFlashMaterialParameters(parameters: Map<string, any>, deltaTime: number) {
        // Animation of flash 1 consists of 12 frames
        let flash1FrameNumber = Math.trunc(deltaTime / (this.fireFlashDurationMillis / 12));
        // Animation of flash 2 consists of 4 frames
        const flash2FrameNumber = Math.trunc(deltaTime / (this.fireFlashDurationMillis / 4));

        const flash1Rotate = parameters.get('pistolFlashRotate');
        if (flash1Rotate >= 0.5) {
            flash1FrameNumber += 1;
        }

        parameters.set('pistolFlashScrollX', flash1FrameNumber / 12);
        parameters.set('pistolFlash2ScrollX', flash2FrameNumber / 4);
    }

    protected computeFireFlashPosition(position: Vector3) {
        position.setFromMatrixPosition(this.skeleton.bones[25].matrixWorld);
        this.worldToLocal(position);
    }

    protected updateAmmoCountersOnReload() {
        if (this.ammoClip < this.ammoClipSize) {
            if (this.ammoReserve === -1) { // Infinite reserve
                this.ammoClip = this.ammoClipSize;
            } else if (this.ammoReserve < this.ammoClipSize) {
                this.ammoClip = this.ammoReserve;
                this.ammoReserve = 0;
            } else {
                this.ammoReserve -= this.ammoClipSize - this.ammoClip;
                this.ammoClip = this.ammoClipSize;
            }
        }
    }

    protected applyTubeDeformToFireFlash = (() => {
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

        const view = new Vector3();
        const face1 = new Vector3(6066, 6068, 6067);
        const face2 = new Vector3(6071, 6069, 6070);
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
        this.addAnimationFlow('disable', this.animate('idle').thenCrossFadeTo('put_away').withDuration(0.25).flow);
        this.addAnimationFlow('attack', this.animate('idle')
            .thenCrossFadeTo('fire1').withDuration(0.1).onStart(() => this.playFireSound())
            .thenIf(() => this.ammoClip > 1, this.animate('fire1').thenCrossFadeTo('idle').withDelay(0.3))
            .else(this.animate('fire1').thenCrossFadeTo('idle_empty').withDelay(0.2)).flow);
        this.addAnimationFlow('reload', this.animateIf(() => this.ammoClip === 0, 'idle_empty')
            .else(this.animate('idle'))
            .thenCrossFadeTo('reload_empty').withDuration(0.5).onStart(() => this.playReloadSound())
            .thenCrossFadeTo('idle').withDelay(1.85).flow);
    }

    private playRaiseSound() {
        this.playSound('raise', 0.1);
    }

    private playFireSound() {
        this.playSound('fire');
    }

    private playReloadSound() {
        this.playSound('reload');
    }
}
