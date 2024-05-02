import {Bone, Matrix4, Quaternion, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {Monster, MonsterParameters, MonsterState} from './monster';
import {PhysicsBody} from '../../../../physics/physics-body';
import {Weapon} from '../weapon/weapon';
import {Game} from '../../../../game';

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

    constructor(parameters: MonsterParameters) {
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
        if (this.isDead()) {
            this.makeSkeletonFollowRagdoll();
        } else {
            super.updateCollisionModel(position, quaternion);
            this.makeRagdollFollowAnimation();
        }
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

    protected onBodyHit(body: PhysicsBody, weapon: Weapon) {
        const wasDead = this.isDead();
        super.onBodyHit(body, weapon);
        if (!wasDead && weapon.damage > 0) {
            this.stopAllSounds();
            if (this.isDead()) {
                this.playDeathSound();
            } else {
                this.playPainSound();
            }
        }
    }

    private makeRagdollFollowAnimation = (() => {
        const q = new Quaternion();
        const zAxis = new Vector3(0, 0, 1);

        return () => {
            const leftLowerLeg = this.collisionModel.bodyByName('leftLowerLeg');
            if (leftLowerLeg) {
                const leftKneeBone = this.skeleton.bones[6];
                const leftAnkleBone = this.skeleton.bones[8];
                this.makeRagdollPartFollowAnimation(leftLowerLeg, {boneA: leftKneeBone, boneB: leftAnkleBone});
            }

            const rightLowerLeg = this.collisionModel.bodyByName('rightLowerLeg');
            if (rightLowerLeg) {
                const rightKneeBone = this.skeleton.bones[14];
                const rightAnkleBone = this.skeleton.bones[16];
                this.makeRagdollPartFollowAnimation(rightLowerLeg, {boneA: rightKneeBone, boneB: rightAnkleBone});
            }

            const leftUpperLeg = this.collisionModel.bodyByName('leftUpperLeg');
            if (leftUpperLeg) {
                const leftHipBone = this.skeleton.bones[4];
                const leftKneeBone = this.skeleton.bones[6];
                this.makeRagdollPartFollowAnimation(leftUpperLeg, {boneA: leftHipBone, boneB: leftKneeBone});
            }

            const rightUpperLeg = this.collisionModel.bodyByName('rightUpperLeg');
            if (rightUpperLeg) {
                const rightHipBone = this.skeleton.bones[12];
                const rightKneeBone = this.skeleton.bones[14];
                this.makeRagdollPartFollowAnimation(rightUpperLeg, {boneA: rightHipBone, boneB: rightKneeBone});
            }

            const belly = this.collisionModel.bodyByName('belly');
            if (belly) {
                const pelvisBone = this.skeleton.bones[21];
                const chestBone = this.skeleton.bones[26];
                this.makeRagdollPartFollowAnimation(belly, {
                    boneA: pelvisBone,
                    boneB: chestBone,
                    rotationFunc: (rm, d) => rm.makeRotationFromQuaternion(q.setFromUnitVectors(this.up, d.normalize())),
                    translationFunc: (tm, l) => tm.makeTranslation(0, l / 2.0, 3.1)
                });
            }

            const chest = this.collisionModel.bodyByName('chest');
            if (chest) {
                const neckBone = this.skeleton.bones[30];
                const chestBone = this.skeleton.bones[26];
                this.makeRagdollPartFollowAnimation(chest, {
                    boneA: chestBone,
                    boneB: neckBone,
                    translationFunc: (tm, l) => tm.makeTranslation(0, l / 2.0, 2)
                });
            }

            const leftUpperArm = this.collisionModel.bodyByName('leftUpperArm');
            if (leftUpperArm) {
                const leftShoulderBone = this.skeleton.bones[32];
                const leftElbowBone = this.skeleton.bones[33];
                this.makeRagdollPartFollowAnimation(leftUpperArm, {boneA: leftShoulderBone, boneB: leftElbowBone});
            }

            const leftLowerArm = this.collisionModel.bodyByName('leftLowerArm');
            if (leftLowerArm) {
                const leftElbowBone = this.skeleton.bones[33];
                const leftWristBone = this.skeleton.bones[35];
                this.makeRagdollPartFollowAnimation(leftLowerArm, {boneA: leftElbowBone, boneB: leftWristBone});
            }

            const rightUpperArm = this.collisionModel.bodyByName('rightUpperArm');
            if (rightUpperArm) {
                const rightShoulderBone = this.skeleton.bones[49];
                const rightElbowBone = this.skeleton.bones[50];
                this.makeRagdollPartFollowAnimation(rightUpperArm, {
                    boneA: rightShoulderBone,
                    boneB: rightElbowBone,
                    // 0.383972 rad = 22 degrees
                    rotationFunc: (rm) => rm.makeRotationFromQuaternion(q.setFromAxisAngle(zAxis, 0.383972)),
                    translationFunc: (tm, l) => tm.makeTranslation(0, -l / 2.0, 0)
                });
            }

            const rightLowerArm = this.collisionModel.bodyByName('rightLowerArm');
            if (rightLowerArm) {
                const rightElbowBone = this.skeleton.bones[50];
                const rightWristBone = this.skeleton.bones[52];
                this.makeRagdollPartFollowAnimation(rightLowerArm, {
                    boneA: rightElbowBone,
                    boneB: rightWristBone,
                    translationFunc: (tm, l) => tm.makeTranslation(0, -l / 2.0, 0)
                });
            }

            const head = this.collisionModel.bodyByName('head');
            if (head) {
                const headBone = this.skeleton.bones[68];
                this.makeRagdollPartFollowAnimation(head, {
                    boneA: headBone,
                    translationFunc: (tm) => tm.makeTranslation(0, 1, 1.5)
                });
            }
        };
    })();

    private makeSkeletonFollowRagdoll() {
        const leftLowerLeg = this.collisionModel.bodyByName('leftLowerLeg');
        const leftLowerLegBone = this.skeleton.getBoneByName('Lloleg');
        if (leftLowerLeg && leftLowerLegBone) {
            this.makeSkeletonFollowRagdollPart(leftLowerLeg, leftLowerLegBone,
                bone => bone.rotateX(Math.PI),
                bone => bone.translateY(-leftLowerLeg.height / 2.0));
        }

        const rightLowerLeg = this.collisionModel.bodyByName('rightLowerLeg');
        const rightLowerLegBone = this.skeleton.getBoneByName('Rloleg');
        if (rightLowerLeg && rightLowerLegBone) {
            this.makeSkeletonFollowRagdollPart(rightLowerLeg, rightLowerLegBone,
                bone => bone.rotateX(Math.PI),
                bone => bone.translateY(-rightLowerLeg.height / 2.0));
        }

        const leftUpperLeg = this.collisionModel.bodyByName('leftUpperLeg');
        const leftUpperLegBone = this.skeleton.getBoneByName('Lupleg');
        if (leftUpperLeg && leftUpperLegBone) {
            this.makeSkeletonFollowRagdollPart(leftUpperLeg, leftUpperLegBone,
                bone => bone.rotateX(Math.PI),
                bone => bone.translateY(-leftUpperLeg.height / 2.0));
        }

        const rightUpperLeg = this.collisionModel.bodyByName('rightUpperLeg');
        const rightUpperLegBone = this.skeleton.getBoneByName('Rupleg');
        if (rightUpperLeg && rightUpperLegBone) {
            this.makeSkeletonFollowRagdollPart(rightUpperLeg, rightUpperLegBone,
                bone => bone.rotateX(Math.PI),
                bone => bone.translateY(-rightUpperLeg.height / 2.0));
        }

        const belly = this.collisionModel.bodyByName('belly');
        const bodyBone = this.skeleton.getBoneByName('Body');
        if (belly && bodyBone) {
            this.makeSkeletonFollowRagdollPart(belly, bodyBone,
                undefined,
                bone => bone.translateY(-belly.height / 2.0));
        }

        const chest = this.collisionModel.bodyByName('chest');
        const chestBone = this.skeleton.getBoneByName('chest');
        if (chest && chestBone) {
            this.makeSkeletonFollowRagdollPart(chest, chestBone,
                undefined,
                bone => bone.translateY(-chest.height / 2.0));
        }

        const head = this.collisionModel.bodyByName('head');
        const headBone = this.skeleton.getBoneByName('head');
        if (head && headBone) {
            this.makeSkeletonFollowRagdollPart(head, headBone);
        }

        const rightUpperArm = this.collisionModel.bodyByName('rightUpperArm');
        const rightUpperArmBone = this.skeleton.getBoneByName('Ruparm');
        if (rightUpperArm && rightUpperArmBone) {
            this.makeSkeletonFollowRagdollPart(rightUpperArm, rightUpperArmBone,
                bone => bone.rotateY(Math.PI),
                bone => bone.translateY(rightUpperArm.height / 2.0));
        }

        const rightLowerArm = this.collisionModel.bodyByName('rightLowerArm');
        const rightLowerArmBone = this.skeleton.getBoneByName('Rloarm');
        if (rightLowerArm && rightLowerArmBone) {
            this.makeSkeletonFollowRagdollPart(rightLowerArm, rightLowerArmBone,
                bone => bone.rotateY(Math.PI),
                bone => bone.translateY(rightLowerArm.height / 2.0));
        }

        const leftUpperArm = this.collisionModel.bodyByName('leftUpperArm');
        const leftUpperArmBone = this.skeleton.getBoneByName('Luparm');
        if (leftUpperArm && leftUpperArmBone) {
            this.makeSkeletonFollowRagdollPart(leftUpperArm, leftUpperArmBone,
                    bone => bone.rotateX(Math.PI).rotateY(Math.PI),
                    bone => bone.translateY(-leftUpperArm.height / 2.0));
        }

        const leftLowerArm = this.collisionModel.bodyByName('leftLowerArm');
        const leftLowerArmBone = this.skeleton.getBoneByName('Lloarm');
        if (leftLowerArm && leftLowerArmBone) {
            this.makeSkeletonFollowRagdollPart(leftLowerArm, leftLowerArmBone,
                    bone => bone.rotateX(Math.PI).rotateY(Math.PI),
                    bone => bone.translateY(-leftLowerArm.height / 2.0));
        }
    }

    private makeSkeletonFollowRagdollPart = (() => {
        const rotationMatrix = new Matrix4();

        return (body: PhysicsBody,
                bone: Bone,
                rotationFunc?: (bone: Bone) => void,
                translationFunc?: (bone: Bone) => void) => {
            const oldParent = bone.parent;
            this.scene.attach(bone);

            bone.position.copy(body.getPosition());
            bone.quaternion.setFromRotationMatrix(rotationMatrix.makeRotationFromQuaternion(body.getQuaternion()));
            if (rotationFunc) {
                rotationFunc(bone);
            }
            if (translationFunc) {
                translationFunc(bone);
            }

            oldParent!.attach(bone);
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
            this.stopSounds('chatter');
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

    private playPainSound() {
        this.playSingleSound('pain');
    }

    private playDeathSound() {
        this.playSingleSound('death');
    }

    private get walkSpeed(): number {
        const config = Game.getContext().config;
        switch (this.currentWalkAnimationName) {
            case 'walk1':
                return WALK1_SPEED * config.worldScale;
            case 'walk2':
                return WALK2_SPEED * config.worldScale;
            case 'walk3':
                return WALK3_SPEED * config.worldScale;
            case 'walk4':
                return WALK4_SPEED * config.worldScale;
        }
        return 0;
    }

    private get attackSpeed(): number {
        const config = Game.getContext().config;
        switch (this.currentAttackAnimationName) {
            case 'attack_leftslap':
                return LEFT_SLAP_SPEED * config.worldScale;
            case 'attack2':
                return ATTACK2_SPEED * config.worldScale;
            case 'attack3':
                return ATTACK3_SPEED * config.worldScale;
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
