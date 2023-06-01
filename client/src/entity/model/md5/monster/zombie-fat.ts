import {
    AxesHelper,
    Bone,
    MathUtils,
    Matrix4,
    Mesh,
    MeshNormalMaterial,
    Quaternion,
    SphereGeometry,
    Vector3
} from 'three';

import {randomInt} from 'mathjs';

import {Monster, MonsterState} from './monster';
import {Md5ModelParameters} from '../md5-model';
import {Game} from '../../../../game';
import {PhysicsBody} from '../../../../physics/physics-body';

let zombieResolve: (zombie: ZombieFat) => void = () => undefined;

const WALK1_SPEED = 27.4;
const WALK2_SPEED = 29.12;
const WALK3_SPEED = 57.74;
const WALK4_SPEED = 25.8;

const LEFT_SLAP_SPEED = 38.16;
const ATTACK2_SPEED = 39.14;
const ATTACK3_SPEED = 38.98;

const LEFT_ARM = 0;

export class ZombieFat extends Monster {
    static readonly INSTANCE: Promise<ZombieFat> = new Promise<ZombieFat>((resolve) => zombieResolve = resolve);

    deltaTime = 0;

    private changedAnimationAt = 0;
    private walking = false;

    private currentWalkAnimationName?: string;
    private currentAttackAnimationName?: string;
    private stopWalkingScheduled = false;
    private lastArm = LEFT_ARM;

    constructor(parameters: Md5ModelParameters) {
        super(parameters);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        this.deltaTime = 0;

        this.updateState();
        if (this.isIdle()) {
            this.playChatterSound();
        } else if (this.isWalking()) {
            this.increasePositionOffset(deltaTime * this.walkSpeed);
            this.stopWalkingIfScheduled();
        } else if (this.isAttacking()) {
            this.increasePositionOffset(deltaTime * this.attackSpeed);
        }
        this.updateCollisionModel();
    }

    changeAnimation() {
        if (this.changedAnimationAt > 0) {
            const now = performance.now();
            if (now - this.changedAnimationAt < 500) {
                return;
            }
        }

        this.attack();
        this.changedAnimationAt = performance.now();
    }

    startWalking() {
        if (this.isIdle()) {
            this.startAnimationFlow('start_walking');
            this.positionOffset.setScalar(0);
            this.changeState(MonsterState.WALKING);
        }
    }

    stopWalking() {
        if (this.isWalking()) {
            if (this.isWalkAnimationRunningWithFullWeight()) {
                this.doStopWalking();
            } else {
                // Wait until fading of idle and walk actions completes
                this.stopWalkingScheduled = true;
            }
        }
    }

    protected doInit() {
        super.doInit();
        this.initAnimationFlows();
        this.idle();
        this.updateCollisionModel();
        zombieResolve(this);
    }

    protected updateCollisionModel(position: Vector3 = this.calculatedPosition,
                                   quaternion: Quaternion = this.quaternion) {
        super.updateCollisionModel(position, quaternion);
        this.updateRagdoll();
    }

    protected updateState() {
        if (this.currentState === MonsterState.ATTACKING && this.isAnyAnimationRunning('idle1')) {
            // Switch state to idle as soon as idle animation is running to prevent monster drifting back after slap
            this.resetSkeletonPosition();
            this.position.add(this.positionOffset);
            this.positionOffset.setScalar(0);
            this.changeState(MonsterState.IDLE);
        }
    }

    private updateRagdoll() {
        const leftLowerLeg = this.collisionModel.getBody('leftLowerLeg');
        if (leftLowerLeg) {
            const leftKneeBone = this.skeleton.bones[6];
            const leftAnkleBone = this.skeleton.bones[8];
            this.updateRagdollPart(leftLowerLeg, leftKneeBone, leftAnkleBone);
        }

        const rightLowerLeg = this.collisionModel.getBody('rightLowerLeg');
        if (rightLowerLeg) {
            const rightKneeBone = this.skeleton.bones[14];
            const rightAnkleBone = this.skeleton.bones[16];
            this.updateRagdollPart(rightLowerLeg, rightKneeBone, rightAnkleBone);
        }

        const leftUpperLeg = this.collisionModel.getBody('leftUpperLeg');
        if (leftUpperLeg) {
            const leftHipBone = this.skeleton.bones[4];
            const leftKneeBone = this.skeleton.bones[6];
            this.updateRagdollPart(leftUpperLeg, leftHipBone, leftKneeBone);
        }

        const rightUpperLeg = this.collisionModel.getBody('rightUpperLeg');
        if (rightUpperLeg) {
            const rightHipBone = this.skeleton.bones[12];
            const rightKneeBone = this.skeleton.bones[14];
            this.updateRagdollPart(rightUpperLeg, rightHipBone, rightKneeBone);
        }

        const belly = this.collisionModel.getBody('belly');
        if (belly) {
            const pelvisBone = this.skeleton.bones[21];
            const chestBone = this.skeleton.bones[26];
            this.updateRagdollPart(belly, pelvisBone, chestBone);
        }

        const chest = this.collisionModel.getBody('chest');
        if (chest) {
            const neckBone = this.skeleton.bones[30];
            const chestBone = this.skeleton.bones[26];
            this.updateRagdollPart(chest, chestBone, neckBone);
        }

        const leftUpperArm = this.collisionModel.getBody('leftUpperArm');
        if (leftUpperArm) {
            const leftShoulderBone = this.skeleton.bones[32];
            const leftElbowBone = this.skeleton.bones[33];
            this.updateRagdollPart(leftUpperArm, leftShoulderBone, leftElbowBone);
        }

        const leftLowerArm = this.collisionModel.getBody('leftLowerArm');
        if (leftLowerArm) {
            const leftElbowBone = this.skeleton.bones[33];
            const leftWristBone = this.skeleton.bones[35];
            this.updateRagdollPart(leftLowerArm, leftElbowBone, leftWristBone);
        }

        const rightUpperArm = this.collisionModel.getBody('rightUpperArm');
        if (rightUpperArm) {
            const rightShoulderBone = this.skeleton.bones[49];
            const rightElbowBone = this.skeleton.bones[50];
            this.updateRagdollPart(rightUpperArm, rightShoulderBone, rightElbowBone);
        }

        const rightLowerArm = this.collisionModel.getBody('rightLowerArm');
        if (rightLowerArm) {
            const rightElbowBone = this.skeleton.bones[50];
            const rightWristBone = this.skeleton.bones[52];
            this.updateRagdollPart(rightLowerArm, rightElbowBone, rightWristBone);
        }
    }

    private updateRagdollPart = (() => {
        const boneMatrix = new Matrix4();
        const ragdollMatrix = new Matrix4();
        const rotationMatrix = new Matrix4();
        const translationMatrix = new Matrix4();

        const v1 = new Vector3();
        const v2 = new Vector3();

        const yAxis = new Vector3(0, 1, 0);
        const zAxis = new Vector3(0, 0, 1);

        const position = new Vector3();
        const quaternion = new Quaternion();
        const scale = new Vector3();

        return (ragdollPart: PhysicsBody, boneA: Bone, boneB: Bone) => {
            v1.setFromMatrixPosition(boneMatrix.identity().multiply(boneA.matrixWorld));
            v2.setFromMatrixPosition(boneMatrix.identity().multiply(boneB.matrixWorld));

            rotationMatrix.identity();

            if (ragdollPart.name === 'belly') {
                const angle = MathUtils.degToRad(this.turnAngle);
                v1.applyQuaternion(quaternion.setFromAxisAngle(yAxis, angle));
                v2.applyQuaternion(quaternion.setFromAxisAngle(yAxis, angle));

                const direction = v2.sub(v1).normalize();
                rotationMatrix.makeRotationFromQuaternion(quaternion.setFromUnitVectors(this.up, direction));

                translationMatrix.identity().makeTranslation(0, 5.25, 3.1);
            } else if (ragdollPart.name === 'chest') {
                translationMatrix.identity().makeTranslation(0, 5.75, 2);
            } else if (ragdollPart.name == 'rightLowerArm') {
                const direction = v1.sub(v2);
                const length = direction.length() / this.config.worldScale;
                translationMatrix.identity().makeTranslation(0, -length / 2.0, 0);
            } else if (ragdollPart.name === 'rightUpperArm') {
                const direction = v1.sub(v2);
                const length = direction.length() / this.config.worldScale;
                rotationMatrix
                    .makeRotationFromQuaternion(quaternion.setFromAxisAngle(zAxis, MathUtils.degToRad(25)));
                translationMatrix.identity().makeTranslation(0, -length / 2.0, 0);
            } else {
                const direction = v1.sub(v2);
                const length = direction.length() / this.config.worldScale;
                translationMatrix.identity().makeTranslation(0, length / 2.0, 0);
            }

            ragdollMatrix
                .identity()
                .multiply(boneA.matrixWorld)
                .multiply(rotationMatrix)
                .multiply(translationMatrix)
                .decompose(position, quaternion, scale);

            ragdollPart.setPosition(position);
            ragdollPart.setQuaternion(quaternion);
        };
    })();

    private idle(startAtTime?: number) {
        if (startAtTime == undefined) {
            startAtTime = Math.random() * 9.25;
        }
        this.animate('idle1').startAtTime(startAtTime).start();
        this.changeState(MonsterState.IDLE);
        if (this.wireframeHelper) {
            this.wireframeHelper.animate('idle1').startAtTime(startAtTime).start();
        }
    }

    private attack() {
        if (this.canAttack()) {
            this.stopAllSounds('chatter');
            const nextArm = (this.lastArm + 1) % 2;
            let animationFlowName;
            if (nextArm === LEFT_ARM) {
                animationFlowName = randomInt(0, 2) === 0 ? 'melee_attack1' : 'melee_attack3';
            } else {
                animationFlowName = 'melee_attack2';
            }
            this.startAnimationFlow(animationFlowName);
            this.lastArm = nextArm;
            this.positionOffset.setScalar(0);
            this.changeState(MonsterState.ATTACKING);
        }
    }

    private stopWalkingIfScheduled() {
        if (this.stopWalkingScheduled && this.isWalkAnimationRunningWithFullWeight()) {
            this.doStopWalking();
            this.stopWalkingScheduled = false;
        }
    }

    private isWalkAnimationRunningWithFullWeight(): boolean {
        const runningAction = this.runningAction;
        const runningActionName = runningAction?.getClip().name;
        return runningActionName === this.currentWalkAnimationName && runningAction?.weight === 1;
    }

    private initAnimationFlows() {
        this.addAnimationFlow('start_walking', this.animate('idle1')
            .thenCrossFadeToAny('walk1', 'walk2', 'walk3', 'walk4').withDuration(0.3).repeat(Infinity)
            .onStart(action => this.currentWalkAnimationName = action.getClip().name)
            .onLoop(() => {
                if (this.isWalking()) {
                    this.position.add(this.positionOffset);
                    this.positionOffset.setScalar(0);
                }
            })
            .onTime([0.35, 1], () => this.playFootstepSound(), action => action === 'walk1' || action === 'walk4')
            .onTime([0.4, 1.2], () => this.playFootstepSound(), action => action === 'walk2')
            .onTime([0.35, 0.75], () => this.playFootstepSound(), action => action === 'walk3').flow);
        this.addAnimationFlow('stop_walking', this.animateCurrent(false)
            .thenCrossFadeTo('idle1').withDuration(0.25).flow);
        this.addAnimationFlow('melee_attack1', this.animate('attack_leftslap')
            .onStart(action => {
                this.currentAttackAnimationName = action.getClip().name;
                this.playCombatChatterSound();
            })
            .onTime([0.2, 0.75], () => this.playFootstepSound())
            .onTime([0.4], () => this.playWhooshSound())
            .thenCrossFadeTo('idle1').withDelay(0.8).withDuration(0.25).flow);
        this.addAnimationFlow('melee_attack2', this.animate('attack2')
            .onStart(action => {
                this.currentAttackAnimationName = action.getClip().name;
                this.playCombatChatterSound();
            })
            .onTime([0.15, 0.8], () => this.playFootstepSound())
            .onTime([0.3], () => this.playWhooshSound())
            .thenCrossFadeTo('idle1').withDelay(0.8).withDuration(0.25).flow);
        this.addAnimationFlow('melee_attack3', this.animate('attack3')
            .onStart(action => {
                this.currentAttackAnimationName = action.getClip().name;
                this.playCombatChatterSound();
            })
            .onTime([0.25, 0.8], () => this.playFootstepSound())
            .onTime([0.3], () => this.playWhooshSound())
            .thenCrossFadeTo('idle1').withDelay(0.8).withDuration(0.25).flow);
    }

    private playChatterSound() {
        this.playSingleSound('chatter', Math.random() * 4 + 1);
    }

    private playCombatChatterSound() {
        this.playSound('chatter_combat');
    }

    private playWhooshSound(delay?: number) {
        this.playSound('whoosh', delay);
    }

    private playFootstepSound() {
        this.playSound('footstep');
    }

    private get walkSpeed(): number {
        switch (this.currentWalkAnimationName) {
            case 'walk1':
                return WALK1_SPEED * this.config.worldScale;
            case 'walk2':
                return WALK2_SPEED * this.config.worldScale;
            case 'walk3':
                return WALK3_SPEED * this.config.worldScale;
            case 'walk4':
                return WALK4_SPEED * this.config.worldScale;
        }
        return 0;
    }

    private get attackSpeed(): number {
        switch (this.currentAttackAnimationName) {
            case 'attack_leftslap':
                return LEFT_SLAP_SPEED * this.config.worldScale;
            case 'attack2':
                return ATTACK2_SPEED * this.config.worldScale;
            case 'attack3':
                return ATTACK3_SPEED * this.config.worldScale;
        }
        return 0;
    }

    private increasePositionOffset(directionFactor: number) {
        this.positionOffset.x += this.direction.x * directionFactor;
        this.positionOffset.y += this.direction.y * directionFactor;
        this.positionOffset.z += this.direction.z * directionFactor;
    }

    private doStopWalking() {
        this.startAnimationFlow('stop_walking');
        this.position.add(this.positionOffset);
        this.positionOffset.setScalar(0);
        this.resetSkeletonPosition();
        this.changeState(MonsterState.IDLE);
    }
}
