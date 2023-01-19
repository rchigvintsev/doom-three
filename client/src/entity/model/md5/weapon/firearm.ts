import {Euler, MathUtils, Matrix4, Object3D, PointLight, Quaternion, Vector3} from 'three';
import {degToRad} from 'three/src/math/MathUtils';

import {Tween} from '@tweenjs/tween.js';

import {Weapon, WeaponState} from './weapon';
import {Md5ModelParameters} from '../md5-model';
import {DebrisSystem} from '../../../../debris/debris-system';
import {UpdatableMeshBasicMaterial} from '../../../../material/updatable-mesh-basic-material';
import {AttackEvent} from '../../../../event/weapon-events';
import {Player} from '../../../player/player';

const SHELL_POSITION = new Vector3();
const SHELL_QUATERNION = new Quaternion();
const SHELL_TARGET_POSITION = new Vector3();
const SHELL_EJECTION_FORCE = new Vector3();

const FIRE_FLASH_DURATION_MILLIS = 120;

export abstract class Firearm extends Weapon {
    readonly recoilTween: Tween<Euler>;

    private fireFlashLight?: PointLight;
    private fireFlashMaterialParams?: Map<string, any>;
    private readonly fireFlashMaterials: UpdatableMeshBasicMaterial[] = [];

    protected static readonly SHELL_ROTATION_X_ANGLE_ADJUSTMENT = new Quaternion()
        .setFromAxisAngle(new Vector3(1, 0, 0), MathUtils.degToRad(-90));

    protected readonly shellRotationMatrix = new Matrix4();
    protected readonly shellRotationMatrixEye = new Vector3();
    protected readonly shellRotationMatrixTarget = new Vector3();
    protected lastFireTime = 0;

    private readonly shellTarget: Object3D;
    private _ammoClip: number;
    private _ammoReserve: number;

    constructor(parameters: FirearmParameters) {
        super(parameters);

        this._ammoClip = this.ammoClipSize;
        this._ammoReserve = this.maxAmmoReserve;

        this.initFireFlash();
        this.recoilTween = this.createRecoilTween(parameters);

        this.shellTarget = new Object3D();
        this.add(this.shellTarget);
    }

    abstract isLowAmmo(): boolean;

    update(deltaTime: number, player?: Player) {
        super.update(deltaTime, player);
        if (this.lastFireTime > 0) {
            const now = performance.now();
            const fireDelta = now - this.lastFireTime;
            if (fireDelta > this.fireFlashDurationMillis) {
                this.hideFireFlash();
            } else {
                this.updateFireFlash(fireDelta);
            }
        }
    }

    attack() {
        if (this.canAttack()) {
            this.showFireFlash();
            this.startAnimationFlow('attack');
            this._ammoClip--;
            this.changeState(FirearmState.SHOOTING);
            this.lastFireTime = performance.now();
            this.showMuzzleSmoke();
            this.ejectShell();
            this.dispatchEvent(new AttackEvent(this, this.attackDistance, this.attackForce));
        } else if (this._ammoClip === 0) {
            this.reload();
        }
    }

    reload() {
        if (this.canReload()) {
            this.startAnimationFlow('reload');
            this.changeState(FirearmState.RELOADING);
        }
    }

    get ammoClip(): number {
        return this._ammoClip;
    }

    set ammoClip(value: number) {
        this._ammoClip = value;
    }

    get ammoReserve(): number {
        return this._ammoReserve;
    }

    set ammoReserve(value: number) {
        this._ammoReserve = value;
    }

    protected get ammoClipSize(): number {
        return (<FirearmParameters>this.parameters).ammoClipSize;
    }

    protected get shellDebrisName(): string | undefined {
        return (<FirearmParameters>this.parameters).shell;
    }

    protected get shellEjectionForceFactor(): number {
        return 1;
    }

    protected computeShellPosition(_position: Vector3) {
        // Do nothing by default
    }

    protected computeShellTargetPosition(_position: Vector3) {
        // Do nothing by default
    }

    protected computeShellQuaternion(_quaternion: Quaternion) {
        // Do nothing by default
    }

    protected ejectShell() {
        if (this.shellDebrisName) {
            const debris = this.debrisSystem.createDebris(this.shellDebrisName);

            const collisionModel = debris.collisionModel!;
            this.computeShellPosition(SHELL_POSITION);
            collisionModel.setPosition(SHELL_POSITION);
            this.computeShellQuaternion(SHELL_QUATERNION);
            collisionModel.setQuaternion(SHELL_QUATERNION);

            this.computeShellTargetPosition(SHELL_TARGET_POSITION);
            this.shellTarget.position.copy(SHELL_TARGET_POSITION);
            this.shellTarget.updateMatrixWorld();

            collisionModel.applyImpulse(SHELL_EJECTION_FORCE
                .subVectors(SHELL_TARGET_POSITION.setFromMatrixPosition(this.shellTarget.matrixWorld), SHELL_POSITION)
                .multiplyScalar(this.shellEjectionForceFactor));

            debris.show(100);
        }
    }

    protected get fireFlashMaterialNames(): string[] {
        return [];
    }

    protected get fireFlashDurationMillis(): number {
        return FIRE_FLASH_DURATION_MILLIS;
    }

    protected initFireFlashMaterialParameters(_parameters: Map<string, any>) {
        // Do nothing by default
    }

    protected updateFireFlashMaterialParameters(_parameters: Map<string, any>, _deltaTime: number) {
        // Do nothing by default
    }

    protected showMuzzleSmoke() {
        // Do nothing by default
    }

    protected updateAmmoCountersOnReload() {
        // Do nothing by default
    }

    protected canAttack() {
        return this._ammoClip > 0 && this.isIdle();
    }

    protected canReload() {
        return this._ammoClip < this.ammoClipSize && this._ammoReserve > 0 && this.isIdle();
    }

    protected changeState(newState: string) {
        super.changeState(newState);
        if (this.currentState === FirearmState.IDLE && this.previousState === FirearmState.RELOADING) {
            this.updateAmmoCountersOnReload();
        }
    }

    private initFireFlash() {
        if (!this.config.renderOnlyWireframe) {
            for (const materialName of this.fireFlashMaterialNames) {
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

                this.fireFlashLight = new PointLight(0x000);
                this.fireFlashLight.distance = this.fireFlashDistance * this.config.worldScale;
                this.add(this.fireFlashLight);
            }
        }
    }

    private showFireFlash() {
        if (this.fireFlashMaterials.length > 0) {
            this.initFireFlashMaterialParameters(this.fireFlashMaterialParams!);

            for (const material of this.fireFlashMaterials) {
                material.setParameters(this.fireFlashMaterialParams!);
                material.visible = true;
                material.update();
            }

            // Simple changing light visibility causes micro-freeze at the first shot
            this.fireFlashLight!.color.setHex(this.fireFlashColor);
        }
    }

    private updateFireFlash(deltaTime: number) {
        if (this.fireFlashMaterials.length > 0) {
            this.updateFireFlashMaterialParameters(this.fireFlashMaterialParams!, deltaTime);
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

    private get debrisSystem(): DebrisSystem {
        return (<FirearmParameters>this.parameters).debrisSystem;
    }

    private get fireFlashDistance(): number {
        return (<FirearmParameters>this.parameters).fireFlashDistance;
    }

    private get maxAmmoReserve(): number {
        return (<FirearmParameters>this.parameters).maxAmmoReserve;
    }

    private get fireFlashColor(): number {
        return (<FirearmParameters>this.parameters).fireFlashColor;
    }

    private get attackDistance(): number {
        return (<FirearmParameters>this.parameters).attackDistance;
    }

    private get attackForce(): number {
        return (<FirearmParameters>this.parameters).attackForce;
    }

    private createRecoilTween(parameters: FirearmParameters): Tween<Euler> {
        const rotation = new Euler();
        const recoilTimeTo = parameters.recoilTime * 0.4;
        const recoilTimeFrom = parameters.recoilTime * 0.6;
        return new Tween(rotation)
            .to({x: degToRad(parameters.recoilAngle)}, recoilTimeTo)
            .chain(new Tween(rotation).to({x: 0}, recoilTimeFrom).onUpdate((object, elapsed) => {
                const updateCallback = (<any>this.recoilTween)._onUpdateCallback;
                if (updateCallback) {
                    updateCallback(object, elapsed);
                }
            }));
    }

    private isIdle() {
        return this.currentState === WeaponState.IDLE;
    }
}

export function isFirearm(weapon: any): weapon is Firearm {
    return weapon instanceof Firearm;
}

export interface FirearmParameters extends Md5ModelParameters {
    debrisSystem: DebrisSystem;
    shell: string;
    recoilAngle: number;
    recoilTime: number;
    fireFlashDistance: number;
    fireFlashColor: number;
    ammoClipSize: number;
    maxAmmoReserve: number;
    attackDistance: number;
    attackForce: number;
}

export class FirearmState extends WeaponState {
    static readonly SHOOTING = 'shooting';
    static readonly RELOADING = 'reloading';
}