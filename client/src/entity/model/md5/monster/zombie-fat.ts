import {randomInt} from 'mathjs';

import {Monster, MonsterState} from './monster';
import {Md5ModelParameters} from '../md5-model';

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
            this.updateCollisionModel();
            this.stopWalkingIfScheduled();
        } else if (this.isAttacking()) {
            this.increasePositionOffset(deltaTime * this.attackSpeed);
        }
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

    protected updateState() {
        if (this.currentState === MonsterState.ATTACKING && this.isAnyAnimationRunning('idle1')) {
            // Switch state to idle as soon as idle animation is running to prevent monster drifting back after slap
            this.resetSkeletonPosition();
            this.position.add(this.positionOffset);
            this.positionOffset.setScalar(0);
            this.changeState(MonsterState.IDLE);
        }
    }

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

    private updateCollisionModel() {
        this.collisionModel.position.setFromVector3(this.calculatedPosition);
        this.collisionModel.quaternion.copy(this.quaternion);
    }

    private doStopWalking() {
        this.startAnimationFlow('stop_walking');
        this.position.add(this.positionOffset);
        this.positionOffset.setScalar(0);
        this.resetSkeletonPosition();
        this.changeState(MonsterState.IDLE);
    }
}
