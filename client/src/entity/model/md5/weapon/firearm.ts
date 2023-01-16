import {Euler, MathUtils, Matrix4, Object3D, Quaternion, Vector3} from 'three';
import {degToRad} from 'three/src/math/MathUtils';

import {Tween} from '@tweenjs/tween.js';

import {Weapon} from './weapon';
import {Md5ModelParameters} from '../md5-model';
import {DebrisSystem} from '../../../../debris/debris-system';

const SHELL_POSITION = new Vector3();
const SHELL_QUATERNION = new Quaternion();
const SHELL_TARGET_POSITION = new Vector3();
const SHELL_EJECTION_FORCE = new Vector3();

export abstract class Firearm extends Weapon {
    readonly recoilTween: Tween<Euler>;

    protected static readonly SHELL_ROTATION_X_ANGLE_ADJUSTMENT = new Quaternion()
        .setFromAxisAngle(new Vector3(1, 0, 0), MathUtils.degToRad(-90));

    protected readonly shellRotationMatrix = new Matrix4();
    protected readonly shellRotationMatrixEye = new Vector3();
    protected readonly shellRotationMatrixTarget = new Vector3();

    private readonly shellTarget: Object3D;

    constructor(parameters: FirearmParameters) {
        super(parameters);
        this.recoilTween = this.createRecoilTween(parameters);

        this.shellTarget = new Object3D();
        this.add(this.shellTarget);
    }

    abstract getAmmoClip(): number;

    abstract getAmmoReserve(): number;

    abstract isLowAmmo(): boolean;

    abstract reload(): void;

    protected get shellDebrisName(): string | undefined {
        return undefined;
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

    private get debrisSystem(): DebrisSystem {
        return (<FirearmParameters>this.parameters).debrisSystem;
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
}

export function isFirearm(weapon: any): weapon is Firearm {
    return weapon instanceof Firearm;
}

export interface FirearmParameters extends Md5ModelParameters {
    debrisSystem: DebrisSystem;
    recoilAngle: number;
    recoilTime: number;
}
