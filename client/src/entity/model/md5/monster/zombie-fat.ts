import {ArrowHelper, Vector3} from 'three';

import {Monster, MonsterState} from './monster';
import {Md5ModelParameters} from '../md5-model';
import {Game} from '../../../../game';

let zombieResolve: (zombie: ZombieFat) => void = () => undefined;

const WALK1_SPEED = 27.4;

export class ZombieFat extends Monster {
    static readonly INSTANCE: Promise<ZombieFat> = new Promise<ZombieFat>((resolve) => zombieResolve = resolve);

    private changedAnimationAt = 0;
    private walking = false;

    constructor(parameters: Md5ModelParameters) {
        super(parameters);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.isIdle()) {
            this.playChatterSound();
        } else if (this.isWalking()) {
            const directionFactor = deltaTime * WALK1_SPEED * this.config.worldScale;
            this.positionOffset.x += this.direction.x * directionFactor;
            this.positionOffset.y += this.direction.y * directionFactor;
            this.positionOffset.z += this.direction.z * directionFactor;
        }
    }

    public changeAnimation() {
        if (this.changedAnimationAt > 0) {
            const now = performance.now();
            if (now - this.changedAnimationAt < 500) {
                return;
            }
        }

        if (this.walking) {
            this.stopWalking();
            this.walking = false;
        } else {
            this.startWalking();
            this.walking = true;
        }
        this.changedAnimationAt = performance.now();
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
            .thenCrossFadeToAny('walk1').withDuration(0.3).repeat(Infinity).onLoop(() => {
                if (this.isWalking()) {
                    this.position.add(this.positionOffset);
                    this.positionOffset.setScalar(0);
                }
            }).flow);
        this.addAnimationFlow('stop_walking', this.animateCurrent(false)
            .thenCrossFadeTo('idle1').withDuration(0.25).flow);
    }

    private playChatterSound() {
        if (!this.isPlayingSound()) {
            this.playSound('chatter', Math.random() * 4 + 1);
        }
    }
}
