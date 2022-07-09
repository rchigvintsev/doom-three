import {AnimationAction, Audio, BufferGeometry, Material, Object3D, SpotLight, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {Weapon} from './weapon';
import {GameConfig} from '../../../game-config';
import {AttackEvent} from '../../../event/weapon-events';
import {Player} from '../../player/player';

const PUNCH_FORCE = 50;
const ATTACK_DISTANCE = 30;

const LIGHT_INTENSITY = 1.5;
const LIGHT_DISTANCE = 1000;
const LIGHT_ANGLE = Math.PI / 6;

export class Flashlight extends Weapon {
    private readonly attackDistance!: number;
    private readonly punchAnimationActionNames = ['swing1', 'swing2'];

    private readonly light?: SpotLight;
    private readonly bone5Position = new Vector3();
    private readonly bone6Position = new Vector3();
    private readonly lightDirection = new Vector3();
    private readonly lightPosition = new Vector3();
    private readonly lightTargetPosition = new Vector3();

    private lastPunchAnimationAction?: AnimationAction;

    constructor(config: GameConfig,
                geometry: BufferGeometry,
                materials: Material | Material[],
                sounds: Map<string, Audio<AudioNode>[]>) {
        super(config, geometry, materials, sounds);

        this.attackDistance = ATTACK_DISTANCE * config.worldScale;

        if (!config.renderOnlyWireframe) {
            this.light = new SpotLight();
            this.light.intensity = LIGHT_INTENSITY;
            this.light.distance = LIGHT_DISTANCE * config.worldScale;
            this.light.angle = LIGHT_ANGLE;
            this.add(this.light);
            this.add(this.light.target);
        }
    }


    update(deltaTime: number, player?: Player) {
        super.update(deltaTime, player);
        this.updateLight();
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
            const nextPunchActionName = this.punchAnimationActionNames[randomInt(0, this.punchAnimationActionNames.length)];
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

    private updateLight() {
        if (this.light) {
            this.updateMatrixWorld();

            const bones = this.skeleton.bones;
            this.bone5Position.setFromMatrixPosition(bones[5].matrixWorld);
            this.bone6Position.setFromMatrixPosition(bones[6].matrixWorld);

            this.lightDirection.subVectors(this.bone5Position, this.bone6Position).normalize();

            this.light.position
                .copy(this.worldToLocal(this.lightPosition.copy(this.bone5Position)));
            this.light.target.position
                .copy(this.worldToLocal(this.lightTargetPosition.copy(this.bone5Position).add(this.lightDirection)));
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