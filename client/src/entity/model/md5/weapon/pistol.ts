import {BufferGeometry, Event, MathUtils, Matrix4, Object3D, PointLight, Quaternion, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {Md5ModelParameters} from '../md5-model';
import {Weapon} from './weapon';
import {AttackEvent, WeaponDisableEvent} from '../../../../event/weapon-events';
import {Player} from '../../../player/player';
import {UpdatableMeshBasicMaterial} from '../../../../material/updatable-mesh-basic-material';
import {BufferGeometries} from '../../../../util/buffer-geometries';
import {ParticleSystem} from '../../../../particles/particle-system';
import {Particle} from '../../../particle/particle';
import {DebrisSystem} from '../../../../debris/debris-system';
import {Firearm} from './firearm';

const AMMO_CLIP_SIZE = 12;
const FIRE_FLASH_DURATION_MILLIS = 120;
const FIRE_FLASH_COLOR = 0xffcc66;
const FIRE_FLASH_DISTANCE = 120;

export class Pistol extends Weapon implements Firearm {
    private readonly fireFlashMaterials: UpdatableMeshBasicMaterial[] = [];

    private shellTarget!: Object3D;

    private fireFlashMaterialParams?: Map<string, any>;
    private fireFlashLight?: PointLight;

    // -1 means infinite
    private ammoReserve = -1;
    private ammoClip = AMMO_CLIP_SIZE;
    private lastFireTime = 0;

    constructor(parameters: PistolParameters) {
        super(parameters);
        if (!this.config.renderOnlyWireframe) {
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
            if (this.ammoClip === 0) {
                this.animateCrossFade('idle_empty', 'reload_empty', 0.5);
                this.animateCrossFadeDelayed('reload_empty', 'idle', 1.85);
                this.playReloadSound();
            } else {
                this.showFireFlash();
                this.animateCrossFade('idle', 'fire1', 0.1);
                if (this.ammoClip > 1) {
                    this.animateCrossFadeDelayed('fire1', 'idle', 0.3);
                } else {
                    this.animateCrossFadeDelayed('fire1', 'idle_empty', 0.2);
                }
                this.ammoClip--;
                this.playFireSound();
                this.lastFireTime = performance.now();

                this.showMuzzleSmoke();
                this.ejectShell();
                this.dispatchEvent(new AttackEvent(this, 0, 0));
            }
        }
    }

    ammo(): number {
        return this.ammoClip;
    }

    totalAmmo(): number {
        return this.ammoReserve;
    }

    reload(): void {
        if (this.canReload() && this.ammoClip < AMMO_CLIP_SIZE) {
            const idleAnimationName = this.ammoClip === 0 ? 'idle_empty' : 'idle';
            this.animateCrossFade(idleAnimationName, 'reload_empty', 0.5);
            this.animateCrossFadeDelayed('reload_empty', 'idle', 1.85);
            this.playReloadSound();
        }
    }

    onHit(_target: Object3D) {
        // Do nothing
    }

    onMiss() {
        // Do nothing
    }

    protected doInit() {
        super.doInit();

        this.shellTarget = new Object3D();
        this.shellTarget.position.copy(new Vector3()
            .setFromMatrixPosition(this.skeleton.bones[24].matrixWorld)
            .add(new Vector3(0, 3.4, 3.4)));
        this.add(this.shellTarget);
    }

    protected onAnimationFinished(e: Event) {
        const clipName = e.action.getClip().name;
        if (clipName === 'put_away') {
            if (!this.enabled) {
                this.visible = false;
                this.dispatchEvent(new WeaponDisableEvent(this));
            }
        } else if (clipName === 'reload_empty') {
            this.updateAmmoCountersOnReload();
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

    private get particleSystem(): ParticleSystem {
        return (<PistolParameters>this.parameters).particleSystem;
    }

    private get debrisSystem(): DebrisSystem {
        return (<PistolParameters>this.parameters).debrisSystem;
    }

    private get muzzleSmokeParticleName(): string {
        return (<PistolParameters>this.parameters).muzzleSmokeParticleName;
    }

    private get shellDebrisName(): string {
        return (<PistolParameters>this.parameters).shellDebrisName;
    }

    private setMuzzleSmokeParticlePosition(particle: Particle) {
        return particle.position.setFromMatrixPosition(this.skeleton.bones[25].matrixWorld);
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

            this.fireFlashLight = new PointLight(0x000);
            this.fireFlashLight.distance = FIRE_FLASH_DISTANCE * this.config.worldScale;
            this.add(this.fireFlashLight);
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

            // Simple changing light visibility causes micro-freeze at the first shot
            this.fireFlashLight!.color.setHex(FIRE_FLASH_COLOR);
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

            this.fireFlashLight!.position.setFromMatrixPosition(this.skeleton.bones[25].matrixWorld);
            this.worldToLocal(this.fireFlashLight!.position);
        }
    }

    private hideFireFlash() {
        if (this.fireFlashMaterials.length > 0) {
            for (const material of this.fireFlashMaterials) {
                material.visible = false;
            }
            this.fireFlashLight!.color.setHex(0x000);
        }
    }

    private showMuzzleSmoke() {
        if (!this.config.renderOnlyWireframe) {
            const smokeParticles = this.particleSystem.createParticles(this.muzzleSmokeParticleName);
            smokeParticles.onShowParticle = particle => this.setMuzzleSmokeParticlePosition(particle);
            smokeParticles.show();
        }
    }

    private ejectShell = (() => {
        const shellPosition = new Vector3();
        const eye = new Vector3();
        const target = new Vector3();
        const shellRotationMatrix = new Matrix4();
        const shellQuaternion = new Quaternion();
        const xAngleAdjustment = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), MathUtils.degToRad(-90));
        const shellTargetPosition = new Vector3();
        const forceVector = new Vector3();

        return () => {
            const debris = this.debrisSystem.createDebris(this.shellDebrisName);
            const collisionModel = debris.collisionModel!;

            collisionModel.setPosition(shellPosition.setFromMatrixPosition(this.skeleton.bones[28].matrixWorld));
            debris.position.copy(shellPosition);

            eye.setFromMatrixPosition(this.skeleton.bones[24].matrixWorld);
            target.setFromMatrixPosition(this.skeleton.bones[25].matrixWorld);
            collisionModel.setQuaternion(shellQuaternion
                .setFromRotationMatrix(shellRotationMatrix.lookAt(eye, target, this.up))
                .multiply(xAngleAdjustment));
            debris.quaternion.copy(shellQuaternion);

            collisionModel.applyForce(forceVector
                .subVectors(shellTargetPosition.setFromMatrixPosition(this.shellTarget.matrixWorld), shellPosition)
                .multiplyScalar(5.0));

            debris.show(100);
        };
    })();

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
            this.ammoClip = AMMO_CLIP_SIZE;
        } else if (this.ammoReserve < AMMO_CLIP_SIZE) {
            this.ammoClip = this.ammoReserve;
            this.ammoReserve = 0;
        } else {
            this.ammoClip = AMMO_CLIP_SIZE;
            this.ammoReserve -= AMMO_CLIP_SIZE;
        }
    }

    private applyTubeDeformToFireFlash = (() => {
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
}

export interface PistolParameters extends Md5ModelParameters {
    particleSystem: ParticleSystem;
    debrisSystem: DebrisSystem;
    muzzleSmokeParticleName: string;
    shellDebrisName: string;
}