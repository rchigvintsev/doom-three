import {Euler, MathUtils, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {Md5Model, Md5ModelParameters, Md5ModelState} from '../md5-model';
import {Sound} from '../../../sound/sound';
import {AgentBehavior} from '../../../../ai/agent-behavior';

export abstract class Monster extends Md5Model {
    readonly behaviors: AgentBehavior[] = [];

    protected readonly direction = new Vector3();
    protected readonly positionOffset = new Vector3();

    constructor(parameters: Md5ModelParameters) {
        super(parameters);
    }

    update(deltaTime: number) {
        super.update(deltaTime);
        this.updateBehaviors(deltaTime);
        this.updateDirection();
        if (this.isIdle()) {
            this.resetSkeletonPosition();
        }
    }

    abstract startWalking(): void;

    abstract stopWalking(): void;

    isIdle(): boolean {
        return this.currentState === MonsterState.IDLE;
    }

    isWalking(): boolean {
        return this.currentState === MonsterState.WALKING;
    }

    randomDirection() {
        this.rotateZ(MathUtils.degToRad(randomInt(-90, 90)));
        this.updateDirection();
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
        if (this.wireframeHelper) {
            this.wireframeHelper.skeleton.bones[0].position.x = 0;
            this.wireframeHelper.skeleton.bones[0].position.z = 0;
        }
    }

    private updateBehaviors(deltaTime: number) {
        for (const behavior of this.behaviors) {
            behavior.update(deltaTime);
        }
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
