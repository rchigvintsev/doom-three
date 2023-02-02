import {Monster, MonsterState} from './monster';
import {Md5ModelParameters} from '../md5-model';

let zombieResolve: (zombie: ZombieFat) => void = () => undefined;

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
    }

    private stopWalking() {
        this.startAnimationFlow('stop_walking');
    }

    private initAnimationFlows() {
        this.addAnimationFlow('start_walking', this.animate('idle1')
            .thenCrossFadeToAny('walk1', 'walk2', 'walk3', 'walk4').withDuration(0.3).repeat(Infinity).flow);
        this.addAnimationFlow('stop_walking', this.animateCurrent(false)
            .thenCrossFadeTo('idle1').withDuration(0.25).flow);
    }

    private playChatterSound() {
        if (!this.isPlayingSound()) {
            this.playSound('chatter', Math.random() * 4 + 1);
        }
    }
}