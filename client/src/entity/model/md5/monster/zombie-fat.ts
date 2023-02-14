import {ArrowHelper, Vector3} from 'three';

import {Monster, MonsterState} from './monster';
import {Md5ModelParameters} from '../md5-model';
import {Game} from '../../../../game';

let zombieResolve: (zombie: ZombieFat) => void = () => undefined;

const WALK1_SPEED = 27.4;
const WALK2_SPEED = 29.12;
const WALK3_SPEED = 57.74;
const WALK4_SPEED = 25.8;

export class ZombieFat extends Monster {
    static readonly INSTANCE: Promise<ZombieFat> = new Promise<ZombieFat>((resolve) => zombieResolve = resolve);

    private lastWalkAnimationName?: string;

    constructor(parameters: Md5ModelParameters) {
        super(parameters);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.isIdle()) {
            this.playChatterSound();
        } else if (this.isWalking()) {
            const directionFactor = deltaTime * this.walkSpeed;
            this.positionOffset.x += this.direction.x * directionFactor;
            this.positionOffset.y += this.direction.y * directionFactor;
            this.positionOffset.z += this.direction.z * directionFactor;
        }
    }

    protected doInit() {
        super.doInit();
        this.initAnimationFlows();
        this.idle();
        zombieResolve(this);
    }

    private idle() {
        this.animate('idle1').start();
        this.changeState(MonsterState.IDLE);
    }

    private startWalking() {
        this.startAnimationFlow('start_walking');
        this.positionOffset.setScalar(0);
        this.changeState(MonsterState.WALKING);
    }

    private stopWalking() {
        this.startAnimationFlow('stop_walking');
        this.position.add(this.positionOffset);
        this.changeState(MonsterState.IDLE);
    }

    private initAnimationFlows() {
        this.addAnimationFlow('start_walking', this.animate('idle1')
            .thenCrossFadeToAny('walk1', 'walk2', 'walk3', 'walk4').withDuration(0.3).repeat(Infinity)
            .onStart(action => this.lastWalkAnimationName = action.getClip().name)
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
    }

    private playChatterSound() {
        if (!this.isPlayingSound('chatter')) {
            this.playSound('chatter', Math.random() * 4 + 1);
        }
    }

    private playFootstepSound() {
        this.playSoundOnce('footstep');
    }

    private get walkSpeed(): number {
        switch (this.lastWalkAnimationName) {
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
}
