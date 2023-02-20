import {Euler, MathUtils, Vector3} from 'three';

import {Md5Model, Md5ModelParameters, Md5ModelState} from '../md5-model';
import {Game} from '../../../../game';
import {Sound} from '../../../sound/sound';

export abstract class Monster extends Md5Model {
    protected readonly direction = new Vector3();
    protected readonly positionOffset = new Vector3();

    constructor(parameters: Md5ModelParameters) {
        super(parameters);
    }

    update(deltaTime: number) {
        super.update(deltaTime);
        this.updateDirection();
        if (this.isIdle()) {
            this.resetSkeletonPosition();
        }
    }

    protected isIdle(): boolean {
        return this.currentState === MonsterState.IDLE;
    }

    protected isWalking(): boolean {
        return this.currentState === MonsterState.WALKING;
    }

    protected isAttacking(): boolean {
        return this.currentState === MonsterState.ATTACKING;
    }

    protected playSound(soundName: string, delay?: number): Sound | undefined {
        const sound = super.playSound(soundName, delay);
        if (sound && !sound.parent) {
            this.add(sound);
        }
        return sound;
    }

    protected playSingleSound(soundName: string, delay?: number): Sound | undefined {
        const sound = super.playSingleSound(soundName, delay);
        if (sound && !sound.parent) {
            this.add(sound);
        }
        return sound;
    }

    protected canAttack() {
        return this.currentState === MonsterState.IDLE;
    }

    protected resetSkeletonPosition() {
        this.skeleton.bones[0].position.x = 0;
        this.skeleton.bones[0].position.z = 0;
    }

    private updateDirection = (() => {
        const directionRotation = new Euler();

        return () => {
            directionRotation.set(this.rotation.x, this.rotation.y, this.rotation.z - MathUtils.degToRad(90));
            this.getWorldDirection(this.direction).applyEuler(directionRotation);
        };
    })();
}

export class MonsterState extends Md5ModelState {
    static readonly IDLE = 'idle';
    static readonly WALKING = 'walking';
    static readonly ATTACKING = 'attacking';
}
