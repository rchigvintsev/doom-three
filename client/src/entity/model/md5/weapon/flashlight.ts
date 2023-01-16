import {BufferGeometry, Intersection, Mesh, SpotLight, Texture, Vector3} from 'three';

import {Weapon, WeaponState} from './weapon';
import {AttackEvent} from '../../../../event/weapon-events';
import {Player} from '../../../player/player';
import {BufferGeometries} from '../../../../util/buffer-geometries';
import {Md5ModelParameters} from '../md5-model';

const PUNCH_FORCE = 30;
const ATTACK_DISTANCE = 30;

const LIGHT_INTENSITY = 2.0;
const LIGHT_DISTANCE = 1000;
const LIGHT_ANGLE = Math.PI / 6;
const LIGHT_DECAY = 0;

export class Flashlight extends Weapon {
    private readonly attackDistance!: number;

    private readonly bone5Position = new Vector3();
    private readonly bone6Position = new Vector3();

    private readonly light?: SpotLight;
    private readonly lightDirection?: Vector3;
    private readonly lightPosition?: Vector3;
    private readonly lightTargetPosition?: Vector3;
    private readonly shadowCameraUp ?: Vector3;

    constructor(parameters: FlashlightParameters) {
        super(parameters);

        this.attackDistance = ATTACK_DISTANCE * this.config.worldScale;

        if (!this.config.renderOnlyWireframe) {
            this.light = new SpotLight();
            this.light.intensity = LIGHT_INTENSITY;
            this.light.distance = LIGHT_DISTANCE;
            this.light.angle = LIGHT_ANGLE;
            this.light.decay = LIGHT_DECAY;
            (<any>this.light).map = parameters.lightMap;
            this.light.shadow.camera.near = 0.01;

            this.add(this.light);
            this.add(this.light.target);

            this.lightDirection = new Vector3();
            this.lightPosition = new Vector3();
            this.lightTargetPosition = new Vector3();

            this.shadowCameraUp = this.light.shadow.camera.up.clone();
        }

        this.applyTubeDeformToBeam(this.geometry);
    }

    update(deltaTime: number, player?: Player) {
        super.update(deltaTime, player);
        this.updateLight();
    }

    attack(): void {
        if (this.canAttack()) {
            this.startAnimationFlow('attack');
            this.changeState(FlashlightState.PUNCHING);
            this.dispatchEvent(new AttackEvent(this, this.attackDistance, PUNCH_FORCE));
        }
    }

    onHit(target: Mesh, intersection: Intersection) {
        this.playImpactSound(intersection.point, target);
    }

    onMiss() {
        this.playWooshSound();
    }

    protected doInit() {
        super.doInit();
        this.initAnimationFlows();
    }

    protected updateState() {
        super.updateState();
        if (this.currentState === FlashlightState.PUNCHING && !this.isAnyAnimationRunning('swing1', 'swing2')) {
            this.changeState(FlashlightState.IDLE);
        }
    }

    protected updateAcceleration(direction: Vector3) {
        super.updateAcceleration(direction);
        const offset = this.acceleration.offset;
        if (offset.x !== 0 || offset.y !== 0) {
            this.applyTubeDeformToBeam(this.geometry, offset);
            if (this.wireframeHelper) {
                this.applyTubeDeformToBeam(this.wireframeHelper.geometry, offset);
            }
        }
    }

    protected drop(time: number, rotationX: number): Vector3 | undefined {
        const offset = super.drop(time, rotationX);
        if (offset) {
            this.applyTubeDeformToBeam(this.geometry, offset);
            if (this.wireframeHelper) {
                this.applyTubeDeformToBeam(this.wireframeHelper.geometry, offset);
            }
        }
        return offset;
    }

    private applyTubeDeformToBeam = (() => {
        /*
         *  Flashlight beam faces
         *  =====================
         *
         *     Player's view direction
         *               |
         *         2481  V
         *    2480 |\  --------- 2483
         *         | \ \       |
         *         |  \ \      |
         *         |   \ \     |
         *  Bottom |    \ \    | Top
         *         |     \ \   |
         *         |      \ \  |
         *         |       \ \ |
         *    2478 |________\ \| 2482
         *                  2479
         */

        const view = new Vector3();
        const face1 = new Vector3(2481, 2478, 2483);
        const face2 = new Vector3(2479, 2480, 2482);
        return (geometry: BufferGeometry, offset?: Vector3) => {
            view.set(0, 0, -15);
            if (offset) {
                view.z -= offset.x / this.config.worldScale;
                view.y += offset.y / this.config.worldScale;
            }
            BufferGeometries.applyTubeDeform(geometry, view, face1, face2);
        };
    })();

    private initAnimationFlows() {
        this.addAnimationFlow('enable', this.animate('raise')
            .onStart(() => this.playRaiseSound())
            .thenCrossFadeTo('idle')
            .withDuration(0.4).flow);
        this.addAnimationFlow('disable', this.animate('idle').thenCrossFadeTo('lower').withDuration(0.25).flow);
        this.addAnimationFlow('attack', this.animateAny('swing1', 'swing2')
            .thenCrossFadeTo('idle')
            .withFadeOutDuration(0.625)
            .withFadeInDuration(1.875).flow);
    }

    private updateLight() {
        if (this.visible && !this.config.renderOnlyWireframe) {
            this.updateMatrixWorld();

            const bones = this.skeleton.bones;
            this.bone5Position.setFromMatrixPosition(bones[5].matrixWorld);
            this.bone6Position.setFromMatrixPosition(bones[6].matrixWorld);

            this.lightDirection!.subVectors(this.bone5Position, this.bone6Position).normalize();

            this.light!.position
                .copy(this.worldToLocal(this.lightPosition!.copy(this.bone5Position)));
            this.light!.target.position
                .copy(this.worldToLocal(this.lightTargetPosition!.copy(this.bone5Position).add(this.lightDirection!)));

            this.light!.shadow.camera.up
                .copy(this.shadowCameraUp!)
                .applyQuaternion(this.parent!.quaternion)
                .applyQuaternion(this.parent!.parent!.quaternion);
        }
    }

    private canAttack() {
        return this.currentState === FlashlightState.IDLE;
    }

    private playRaiseSound() {
        this.playSound('raise', 0.1);
    }

    private playWooshSound() {
        this.playSound('woosh', 0.1);
    }
}

export interface FlashlightParameters extends Md5ModelParameters {
    lightMap?: Texture;
}

export class FlashlightState extends WeaponState {
    static readonly PUNCHING = 'punching';
}