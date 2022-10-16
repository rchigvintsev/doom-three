import {AnimationAction, Audio, BufferGeometry, Material, Object3D, SpotLight, Texture, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {Weapon} from './weapon';
import {GameConfig} from '../../../game-config';
import {AttackEvent} from '../../../event/weapon-events';
import {Player} from '../../player/player';
import {BufferGeometries} from '../../../util/buffer-geometries';
import {Face3} from '../../../geometry/face3';

const PUNCH_FORCE = 50;
const ATTACK_DISTANCE = 30;

const LIGHT_INTENSITY = 2.0;
const LIGHT_DISTANCE = 1000;
const LIGHT_ANGLE = Math.PI / 6;
const LIGHT_DECAY = 0;

export class Flashlight extends Weapon {
    private readonly attackDistance!: number;
    private readonly punchAnimationActionNames = ['swing1', 'swing2'];

    private readonly bone5Position = new Vector3();
    private readonly bone6Position = new Vector3();

    private readonly light?: SpotLight;
    private readonly lightDirection?: Vector3;
    private readonly lightPosition?: Vector3;
    private readonly lightTargetPosition?: Vector3;
    private readonly shadowCameraUp ?: Vector3;

    private lastPunchAnimationAction?: AnimationAction;

    constructor(config: GameConfig,
                geometry: BufferGeometry,
                materials: Material | Material[],
                sounds: Map<string, Audio<AudioNode>[]>,
                lightMap?: Texture) {
        super(config, geometry, materials, sounds);

        this.attackDistance = ATTACK_DISTANCE * config.worldScale;

        if (!config.renderOnlyWireframe) {
            this.light = new SpotLight();
            this.light.intensity = LIGHT_INTENSITY;
            this.light.distance = LIGHT_DISTANCE;
            this.light.angle = LIGHT_ANGLE;
            this.light.decay = LIGHT_DECAY;
            (<any>this.light).map = lightMap;

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

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.animateCrossFade('raise', 'idle', 0.40);
            this.playRaiseSound();
            // Weapon visibility will be changed on next rendering step
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.animateCrossFade('idle', 'lower', 0.25);
            // Weapon visibility will be changed on "lower" animation finish
        }
    }

    attack(): void {
        if (this.canAttack()) {
            const nextPunchActionIndex = randomInt(0, this.punchAnimationActionNames.length);
            const nextPunchActionName = this.punchAnimationActionNames[nextPunchActionIndex];
            this.animateCrossFadeAsync(nextPunchActionName, 'idle', 0.625, 1.875);
            this.lastPunchAnimationAction = this.getAnimationAction(nextPunchActionName);
            this.dispatchEvent(new AttackEvent(this, this.attackDistance, PUNCH_FORCE));
        }
    }

    onHit(_target: Object3D): void {
        this.playImpactSound();
    }

    onMiss(): void {
        this.playWooshSound();
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

    private applyTubeDeformToBeam(geometry: BufferGeometry, offset?: Vector3) {
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

        const view = new Vector3(0, 0, -15);
        if (offset) {
            view.z -= offset.x / this.config.worldScale;
            view.y += offset.y / this.config.worldScale;
        }
        BufferGeometries.applyTubeDeform(geometry, view, new Face3(2481, 2478, 2483), new Face3(2479, 2480, 2482));
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
        return this.enabled && !this.isRaising() && !this.isLowering() && !this.isAttacking();
    }

    private isAttacking(): boolean {
        return !!(this.lastPunchAnimationAction && this.lastPunchAnimationAction.isRunning());
    }

    private playRaiseSound() {
        this.playFirstSound('raise', 0.1);
    }

    private playImpactSound() {
        this.playRandomSound('impact');
    }

    private playWooshSound() {
        this.playRandomSound('woosh', 0.1);
    }
}