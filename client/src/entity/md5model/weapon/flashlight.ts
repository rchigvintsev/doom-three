import {
    AnimationAction,
    Audio,
    BufferGeometry,
    Camera, Color,
    Material,
    MathUtils,
    Matrix4,
    Object3D,
    PerspectiveCamera,
    Vector3
} from 'three';

import {randomInt} from 'mathjs';

import {Weapon} from './weapon';
import {GameConfig} from '../../../game-config';
import {AttackEvent} from '../../../event/weapon-events';
import {Player} from '../../player/player';

const PUNCH_FORCE = 50;
const ATTACK_DISTANCE = 30;

const LIGHT_COLOR = new Color();
const LIGHT_INTENSITY = 2.0;
const LIGHT_DISTANCE = 1000;
const LIGHT_ANGLE = Math.PI / 6;
const LIGHT_DECAY = 0;

export class Flashlight extends Weapon {
    private readonly attackDistance!: number;
    private readonly punchAnimationActionNames = ['swing1', 'swing2'];

    private readonly bone5Position = new Vector3();
    private readonly bone6Position = new Vector3();

    private readonly lightCamera?: PerspectiveCamera;
    private readonly lightPosition?: Vector3;
    private readonly lightTargetPosition?: Vector3;
    private readonly lightCameraTargetPosition?: Vector3;

    private lastPunchAnimationAction?: AnimationAction;

    constructor(config: GameConfig,
                geometry: BufferGeometry,
                materials: Material | Material[],
                sounds: Map<string, Audio<AudioNode>[]>,
                private readonly camera: Camera) {
        super(config, geometry, materials, sounds);

        this.attackDistance = ATTACK_DISTANCE * config.worldScale;

        if (!config.renderOnlyWireframe) {
            this.lightCamera = new PerspectiveCamera(MathUtils.radToDeg(2 * LIGHT_ANGLE), 1.0, 1, 1000);
            this.add(this.lightCamera);

            this.lightPosition = new Vector3();
            this.lightTargetPosition = new Vector3();
            this.lightCameraTargetPosition = new Vector3();
        }

        this.applyTubeDeformToBeam(this.geometry);
    }

    get lightColor(): Color {
        return LIGHT_COLOR;
    }

    get lightIntensity(): number {
        return LIGHT_INTENSITY;
    }

    get lightDistance(): number {
        return LIGHT_DISTANCE * this.config.worldScale;
    }

    get lightAngle(): number {
        return LIGHT_ANGLE;
    }

    get lightDecay(): number {
        return LIGHT_DECAY;
    }

    update(deltaTime: number, player?: Player) {
        super.update(deltaTime, player);
        this.updateLight();
        this.updateLightCamera();
    }

    updateLightCamera() {
        if (this.visible && !this.config.renderOnlyWireframe) {
            this.lightCamera!.position.copy(this.lightPosition!);
            this.localToWorld(this.lightCameraTargetPosition!.copy(this.lightTargetPosition!));
            this.lightCamera!.lookAt(this.lightCameraTargetPosition!);
        }
    }

    updateLightDirection(direction: Vector3) {
        if (this.visible && !this.config.renderOnlyWireframe) {
            direction.copy(this.bone6Position)
                .sub(this.bone5Position)
                .transformDirection(this.camera.matrixWorldInverse);
        }
    }

    updateLightTextureProjectionMatrix(m: Matrix4) {
        if (this.visible && !this.config.renderOnlyWireframe) {
            m.set(
                0.5, 0.0, 0.0, 0.5,
                0.0, 0.5, 0.0, 0.5,
                0.0, 0.0, 0.5, 0.5,
                0.0, 0.0, 0.0, 1.0
            )
                .multiply(this.lightCamera!.projectionMatrix)
                .multiply(this.lightCamera!.matrixWorldInverse);
        }
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.animateCrossFadeTo('raise', 'idle', 0.40);
            this.playRaiseSound();
            // Weapon visibility will be changed on next rendering step
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.animateCrossFadeTo('idle', 'lower', 0.25);
            // Weapon visibility will be changed on "lower" animation finish
        }
    }

    attack(): void {
        if (this.canAttack()) {
            const nextPunchActionIndex = randomInt(0, this.punchAnimationActionNames.length);
            const nextPunchActionName = this.punchAnimationActionNames[nextPunchActionIndex];
            this.animateFadeOutFadeIn(nextPunchActionName, 0.625, 'idle', 1.875);
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
        const view = new Vector3(0, 0, -15);
        if (offset) {
            view.z -= offset.x / this.config.worldScale;
            view.y += offset.y / this.config.worldScale;
        }

        const positions = geometry.getAttribute('position');

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

        // Beam vertices
        const i = 2481, j = 2478, k = 2483, l = 2479;
        const v1 = new Vector3(positions.getX(i), positions.getY(i), positions.getZ(i));
        const v2 = new Vector3(positions.getX(j), positions.getY(j), positions.getZ(j));
        const v3 = new Vector3(positions.getX(k), positions.getY(k), positions.getZ(k));
        const v4 = new Vector3(positions.getX(l), positions.getY(l), positions.getZ(l));

        // v1 - v3 and v2 - v4 have the shortest distances

        const v1v3Len = v4.clone().sub(v2).length();
        const v2v4Len = v3.clone().sub(v1).length();

        const v1v3Mid = new Vector3(
            0.5 * (v1.x + v3.x),
            0.5 * (v1.y + v3.y),
            0.5 * (v1.z + v3.z)
        );

        const v2v4Mid = new Vector3(
            0.5 * (v2.x + v4.x),
            0.5 * (v2.y + v4.y),
            0.5 * (v2.z + v4.z)
        );

        const major = new Vector3().subVectors(v1v3Mid, v2v4Mid);
        const minor = new Vector3();

        let dir = v1v3Mid.clone().sub(view);
        minor.crossVectors(major, dir).normalize();

        minor.multiplyScalar(0.5 * v1v3Len);
        v1.copy(v1v3Mid.clone().sub(minor));
        v3.copy(v1v3Mid.clone().add(minor));

        dir = v2v4Mid.clone().sub(view);
        minor.crossVectors(major, dir).normalize();

        minor.multiplyScalar(0.5 * v2v4Len);
        v2.copy(v2v4Mid.clone().add(minor));
        v4.copy(v2v4Mid.clone().sub(minor));

        positions.setXYZ(i, v1.x, v1.y, v1.z);
        positions.setXYZ(j, v2.x, v2.y, v2.z);
        positions.setXYZ(k, v3.x, v3.y, v3.z);
        positions.setXYZ(l, v4.x, v4.y, v4.z);

        // Additionally change vertices with the same positions as v1 and v2
        positions.setXYZ(2480, v1.x, v1.y, v1.z);
        positions.setXYZ(2482, v2.x, v2.y, v2.z);

        positions.needsUpdate = true;
    }

    private updateLight() {
        if (this.visible && !this.config.renderOnlyWireframe) {
            this.updateMatrixWorld();

            const bones = this.skeleton.bones;
            this.bone5Position.setFromMatrixPosition(bones[5].matrixWorld);
            this.bone6Position.setFromMatrixPosition(bones[6].matrixWorld);

            this.worldToLocal(this.lightPosition!.copy(this.bone5Position));
            this.worldToLocal(this.lightTargetPosition!.copy(this.bone6Position));
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