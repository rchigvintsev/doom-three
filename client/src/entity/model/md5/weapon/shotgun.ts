import {BufferGeometry, Intersection, PointLight, Quaternion, Vector3} from 'three';
import {WeaponState} from './weapon';
import {Player} from '../../../player/player';
import {UpdatableMeshBasicMaterial} from '../../../../material/updatable-mesh-basic-material';
import {ParticleSystem} from '../../../../particles/particle-system';
import {Particle} from '../../../particle/particle';
import {Firearm, FirearmParameters} from './firearm';
import {DecalSystem} from '../../../../decal/decal-system';
import {AttackEvent} from '../../../../event/weapon-events';

const AMMO_CLIP_SIZE = 8;
const FIRE_FLASH_DURATION_MILLIS = 120;
const SHELL_EJECTION_TIMEOUT_MILLIS = 650;
// const FIRE_FLASH_COLOR = 0xffcc66;
// const FIRE_FLASH_DISTANCE = 120;
const MAX_AMMO_RESERVE = 312;
// const BULLET_FORCE = 5;
// const ATTACK_DISTANCE = 1000;

export class Shotgun extends Firearm {
    private readonly fireFlashMaterials: UpdatableMeshBasicMaterial[] = [];

    private fireFlashMaterialParams?: Map<string, any>;
    private fireFlashLight?: PointLight;

    // -1 means infinite
    private ammoReserve = MAX_AMMO_RESERVE;
    private ammoClip = AMMO_CLIP_SIZE;
    private lastFireTime = 0;
    private shellEjected = true;

    constructor(parameters: ShotgunParameters) {
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

        if (!this.shellEjected && fireDelta > SHELL_EJECTION_TIMEOUT_MILLIS) {
            this.ejectShell();
        }

        if (fireDelta > FIRE_FLASH_DURATION_MILLIS) {
            this.hideFireFlash();
        } else {
            this.updateFireFlash(fireDelta);
        }
    }

    attack() {
        if (this.canAttack()) {
            if (this.ammoClip === 0) {
                this.reload();
            } else {
                this.showFireFlash();
                this.startAnimationFlow('attack');
                this.ammoClip--;
                this.changeState(ShotgunState.SHOOTING);
                this.lastFireTime = performance.now();
                this.showMuzzleSmoke();
                this.shellEjected = false;
                this.dispatchEvent(new AttackEvent(this, 0, 0));
            }
        }
    }

    getAmmoClip(): number {
        return this.ammoClip;
    }

    getAmmoReserve(): number {
        return this.ammoReserve;
    }

    isLowAmmo(): boolean {
        return this.ammoClip < 3;
    }

    reload(): void {
        if (this.canReload()) {
            this.startAnimationFlow('reload');
            this.changeState(ShotgunState.RELOADING);
        }
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
            case ShotgunState.SHOOTING:
                if (!this.isAnyAnimationRunning('fire1', 'fire2', 'fire3')) {
                    this.changeState(ShotgunState.IDLE);
                }
                break;
            case ShotgunState.RELOADING:
                if (!this.isAnyAnimationRunning('reload_start', 'reload_loop', 'reload_loop2', 'reload_loop3', 'reload_end')) {
                    this.changeState(ShotgunState.IDLE);
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

    protected get shellDebrisName(): string {
        return (<ShotgunParameters>this.parameters).shellDebrisName;
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

    protected ejectShell = () => {
        super.ejectShell();
        this.shellEjected = true;
    };

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
                const requiredAmmo = Math.min(AMMO_CLIP_SIZE - this.ammoClip, this.ammoReserve);
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

    private get particleSystem(): ParticleSystem {
        return (<ShotgunParameters>this.parameters).particleSystem;
    }

    private get muzzleSmokeParticleName(): string {
        return (<ShotgunParameters>this.parameters).muzzleSmokeParticleName;
    }

    private get detonationSmokeParticleName(): string {
        return (<ShotgunParameters>this.parameters).detonationSmokeParticleName;
    }

    private get detonationSparkParticleName(): string {
        return (<ShotgunParameters>this.parameters).detonationSparkParticleName;
    }

    private setMuzzleSmokeParticlePosition(_particle: Particle) {
        // Do nothing
    }

    private initFireFlash() {
        // Do nothing
    }

    private showFireFlash() {
        // Do nothing
    }

    private updateFireFlash(_deltaTime: number) {
        // Do nothing
    }

    private hideFireFlash() {
        // Do nothing
    }

    private showMuzzleSmoke() {
        // Do nothing
    }

    private showDetonationSmoke(intersection: Intersection) {
        this.showDetonationParticle(this.detonationSmokeParticleName, intersection);
    }

    private showDetonationSpark(intersection: Intersection) {
        this.showDetonationParticle(this.detonationSparkParticleName, intersection);
    }

    private showDetonationParticle = (() => {
        const particleOffset = new Vector3();
        return (particleName: string, intersection: Intersection) => {
            if (!this.config.renderOnlyWireframe) {
                const particles = this.particleSystem.createParticles(particleName);
                particles.onShowParticle = particle => {
                    particle.position.copy(intersection.point);
                    if (intersection.face) {
                        particle.position.add(particleOffset
                            .copy(intersection.face.normal)
                            .negate()
                            .multiplyScalar(2 * this.config.worldScale));
                    }
                };
                particles.show();
            }
        };
    })();

    private canAttack() {
        return this.isIdle();
    }

    private canReload() {
        return this.ammoClip < AMMO_CLIP_SIZE && this.ammoReserve > 0 && this.isIdle();
    }

    private isIdle() {
        return this.currentState === ShotgunState.IDLE;
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

    private updateAmmoCountersOnReload() {
        if (this.ammoReserve === -1) { // Infinite reserve
            this.ammoClip = Math.min(this.ammoClip + 2, AMMO_CLIP_SIZE);
        } else {
            if (this.ammoReserve === 1 || this.ammoClip === AMMO_CLIP_SIZE - 1) {
                this.ammoReserve--;
                this.ammoClip++;
            } else {
                this.ammoReserve -= 2;
                this.ammoClip += 2;
            }
        }
    }

    private applyTubeDeformToFireFlash(_geometry: BufferGeometry, _offset?: Vector3) {
        // Do nothing
    }
}

export interface ShotgunParameters extends FirearmParameters {
    particleSystem: ParticleSystem;
    decalSystem: DecalSystem;
    muzzleSmokeParticleName: string;
    detonationSmokeParticleName: string;
    detonationSparkParticleName: string;
    detonationMarkDecalName: string;
    shellDebrisName: string;
}

export class ShotgunState extends WeaponState {
    static readonly SHOOTING = 'shooting';
    static readonly RELOADING = 'reloading';
}
